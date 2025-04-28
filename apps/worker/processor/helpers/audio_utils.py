import os
import re

import librosa
import numpy as np
from faster_whisper import WhisperModel


def analyze_audio(audio_path: str) -> dict:
    try:
        # Check if file exists first
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        model = WhisperModel("medium", device="cpu", compute_type="int8")

        # Explicitly request word timestamps
        segments, info = model.transcribe(
            audio_path, word_timestamps=True, vad_filter=True, language="en"
        )
        segments = list(segments)

        text = ""
        confidences = []
        word_timings = []
        disfluency_timings = []
        pause_locations = []
        total_words = 0
        total_duration = 0.0
        pause_count = 0
        last_end = 0.0

        filler_words_list = ["um", "uh", "like", "you know"]
        filler_pattern = re.compile(
            r"\b(" + "|".join(re.escape(fw) for fw in filler_words_list) + r")\b",
            re.IGNORECASE,
        )
        filler_counts = {fw: 0 for fw in filler_words_list}

        for segment in segments:
            text += segment.text.strip() + " "
            confidences.append(segment.avg_logprob)
            total_duration += segment.end - segment.start
            words = segment.text.strip().split()
            total_words += len(words)

            # Word timings & disfluency timings
            # Check if words attribute exists and is not None
            if hasattr(segment, "words") and segment.words is not None:
                for word_info in segment.words:
                    word_timings.append(
                        {
                            "word": word_info.word,
                            "start": round(word_info.start, 2),
                            "end": round(word_info.end, 2),
                        }
                    )

                    word_lower = word_info.word.lower()
                    if filler_pattern.search(word_lower):
                        # Find which filler word matched
                        for filler in filler_words_list:
                            if re.search(
                                r"\b" + re.escape(filler) + r"\b",
                                word_lower,
                                re.IGNORECASE,
                            ):
                                disfluency_timings.append(
                                    {
                                        "word": filler,
                                        "timestamp": round(word_info.start, 2),
                                    }
                                )
                                filler_counts[filler] += 1
                                break
            else:
                # If word-level timestamps aren't available, add a segment-level entry
                print(
                    f"Warning: Word-level timestamps not available for segment: '{segment.text}'"
                )

            # Pause locations
            if last_end > 0 and segment.start - last_end >= 0.5:
                pause_locations.append(round(last_end, 2))
                pause_count += 1
            last_end = segment.end

        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        duration_minutes = total_duration / 60 if total_duration > 0 else 1
        words_per_minute = total_words / duration_minutes

        # Volume variation
        try:
            y, sr = librosa.load(audio_path, sr=None)
            rms = librosa.feature.rms(y=y)[0]
            volume_variation = float(np.std(rms))
        except Exception as e:
            print(f"Warning: Could not analyze volume variation: {e}")
            volume_variation = 0.0

        speech_rate = total_words / total_duration if total_duration > 0 else 0.0

        return {
            "text": text.strip(),
            "confidence": round(np.exp(avg_confidence), 2),
            "words_per_minute": round(words_per_minute, 2),
            "speech_rate": round(speech_rate, 2),
            "pause_count": pause_count,
            "pauseLocations": pause_locations,
            "volume_variation": round(volume_variation, 4),
            "filler_words": filler_counts,
            "disfluencies": disfluency_timings,
            "word_timings": word_timings,
        }

    except FileNotFoundError as e:
        print(f"File not found: {e}")
        raise Exception(f"Audio analysis failed: {str(e)}")
    except Exception as e:
        print(f"Error in analyze_audio: {e}")
        raise Exception(f"Audio analysis failed: {str(e)}")
