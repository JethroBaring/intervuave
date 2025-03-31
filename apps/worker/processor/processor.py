# ✅ Final Clean & Working process_interview() with webm handling

from datetime import datetime
import time
import os
from .helpers.video_utils import extract_audio, slice_video, slice_audio, convert_webm_to_mp4
from .helpers.audio_utils import analyze_audio
from .helpers.vision_utils import analyze_emotions, analyze_body_language
from .helpers.metrics import compute_engagement, compute_emotional_tone, compute_speech_clarity, estimate_confidence

PROCESSING_VERSION = "v1.1"
CHUNK_SAVE_DIR = os.path.join(os.path.dirname(__file__), "../chunks")
os.makedirs(CHUNK_SAVE_DIR, exist_ok=True)


def process_interview(interview_id: str, metadata: dict) -> dict:
    results = []
    error_log = []
    start_time = time.time()

    try:
        video_url = metadata["videoUrl"]
        timestamps = metadata["timestamps"]

        # Handle video path & conversion
        if video_url.endswith(".webm"):
            mp4_path = video_url.replace(".webm", ".mp4")
            convert_webm_to_mp4(video_url, mp4_path)
            video_path = mp4_path
        else:
            video_path = os.path.abspath(video_url)
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video file not found: {video_path}")

        audio_path = extract_audio(video_path)

        for timestamp in timestamps:
            question_id = timestamp["questionId"]
            start_ms = timestamp["start"]
            end_ms = timestamp["end"]

            try:
                saved_video = os.path.join(CHUNK_SAVE_DIR, f"{interview_id}_{question_id}.mp4")
                saved_audio = os.path.join(CHUNK_SAVE_DIR, f"{interview_id}_{question_id}.wav")

                slice_video(video_path, start_ms / 1000.0, end_ms / 1000.0, saved_video)
                slice_audio(audio_path, start_ms / 1000.0, end_ms / 1000.0, saved_audio)

                audio_data = analyze_audio(saved_audio)
                emotion_data = analyze_emotions(saved_video, with_timeline=True)
                posture_data = analyze_body_language(saved_video, with_timeline=True)

                engagement_data = compute_engagement(posture_data, audio_data)
                emotional_tone_data = compute_emotional_tone(emotion_data, audio_data["text"])
                speech_clarity_data = compute_speech_clarity(audio_data, audio_data)
                confidence_data = estimate_confidence(posture_data, audio_data)

                duration = end_ms - start_ms

                result = {
                    "questionId": question_id,
                    "transcript": audio_data["text"],
                    "start": start_ms,
                    "end": end_ms,
                    "duration": duration,
                    "wordTimings": audio_data.get("word_timings", []),
                    "emotionTimeline": emotion_data.get("timeline", []),
                    "postureTimeline": posture_data.get("timeline", []),
                    "gazeTimeline": posture_data.get("gaze_timeline", []),
                    "pauseLocations": audio_data.get("pauseLocations", []),
                    "disfluencies": audio_data.get("disfluencies", []),
                    "expressivenessTimeline": posture_data.get("expressiveness_timeline", []),
                    "expressiveness": round(sum(x["score"] for x in posture_data.get("expressiveness_timeline", [])) / (len(posture_data.get("expressiveness_timeline", []) or [1])), 2),
                    "emotion": emotion_data.get("dominant_emotion"),
                    "eyeGaze": posture_data.get("eyeGaze", 0.0),
                    "posture": posture_data.get("posture", 0.0),
                    "gestures": posture_data.get("gesture_count", 0),
                    "movement": posture_data.get("movement_energy", 0.0),
                    "speechFeatures": {
                        "rate": audio_data.get("words_per_minute", 0),
                        "volumeVariation": audio_data.get("volume_variation", 0.0),
                        "pauseCount": audio_data.get("pause_count", 0),
                        "fillerWords": audio_data.get("filler_words", {})
                    },
                    "metrics": {
                        "speechClarity": speech_clarity_data["score"],
                        "confidence": confidence_data["score"],
                        "emotionalTone": emotional_tone_data["score"],
                        "engagement": engagement_data["score"],
                        "bodyLanguage": posture_data.get("posture", 0.0)
                    },
                    "metricsConfidence": {
                        "speechClarity": speech_clarity_data["confidence"],
                        "confidence": confidence_data["confidence"],
                        "emotionalTone": emotional_tone_data["confidence"],
                        "engagement": engagement_data["confidence"],
                        "bodyLanguage": posture_data.get("detection_confidence", 0.0)
                    },
                    "processingVersion": PROCESSING_VERSION,
                    "qualityFlag": "good"
                }

                results.append(result)

            except Exception as e:
                results.append({
                    "questionId": question_id,
                    "error": str(e),
                    "partial": True
                })
                error_log.append(f"Error processing question {question_id}: {str(e)}")

        os.unlink(video_path)
        os.unlink(audio_path)

        return {
            "interviewId": interview_id,
            "responses": results,
            "errors": error_log,
            "processingTime": time.time() - start_time,
            "processedAt": datetime.now().isoformat()
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "interviewId": interview_id
        }
