from typing import Any, Dict, List

from ..logger import get_logger

logger = get_logger("metrics")


def compute_engagement(
    posture_data: Dict[str, Any], audio_features: Dict[str, Any]
) -> Dict[str, Any]:
    """Compute engagement score based on body language and audio features"""
    try:
        # Dynamic weight factors
        weights = {
            "gaze": 0.3,
            "movement": 0.2,
            "gesture": 0.2,
            "speech_rate": 0.15,
            "volume": 0.15,
        }

        gaze_factor = posture_data.get("eyeGaze", 0.0) * weights["gaze"]
        movement_factor = (
            min(1.0, posture_data.get("movement_energy", 0.0) * 5) * weights["movement"]
        )
        gesture_factor = (
            min(1.0, posture_data.get("gesture_count", 0) / 10) * weights["gesture"]
        )
        speech_rate_factor = (
            min(1.0, audio_features.get("words_per_minute", 0) / 150)
            * weights["speech_rate"]
        )
        volume_variation_factor = (
            min(1.0, audio_features.get("volume_variation", 0) * 10) * weights["volume"]
        )

        engagement_score = sum(
            [
                gaze_factor,
                movement_factor,
                gesture_factor,
                speech_rate_factor,
                volume_variation_factor,
            ]
        )
        engagement_score = max(0.0, min(1.0, engagement_score))

        # Confidence: based on detection presence
        confidence = 0.0
        if posture_data.get("detection_confidence", 0) > 0.5:
            confidence += 0.4
        if audio_features.get("words_per_minute", 0) > 50:
            confidence += 0.3
        if posture_data.get("gesture_count", 0) > 0:
            confidence += 0.3

        return {"score": round(engagement_score, 2), "confidence": round(confidence, 2)}
    except Exception as e:
        logger.error(f"Failed to compute engagement: {str(e)}")
        return {"score": 0.5, "confidence": 0.0}


def compute_emotional_tone(
    emotions: Dict[str, Any], transcript_text: str
) -> Dict[str, Any]:
    """Compute emotional tone score based on facial expressions and transcript"""
    try:
        top_emotions = emotions.get("top_emotions", {})
        if not top_emotions:
            return {"score": 0.5, "confidence": 0.0}

        emotion_scores = {
            "happy": 1.0,
            "surprise": 0.7,
            "neutral": 0.5,
            "sad": 0.3,
            "angry": 0.2,
            "fear": 0.2,
            "disgust": 0.2,
        }

        total = sum(top_emotions.values()) or 1.0
        emotional_tone_score = sum(
            emotion_scores.get(emotion, 0.5) * (value / total)
            for emotion, value in top_emotions.items()
        )

        confidence = round(total / 100, 2)  # Based on percentage coverage
        confidence = min(1.0, confidence)

        return {"score": round(emotional_tone_score, 2), "confidence": confidence}
    except Exception as e:
        logger.error(f"Failed to compute emotional tone: {str(e)}")
        return {"score": 0.5, "confidence": 0.0}


def compute_speech_clarity(
    transcript_data: Dict[str, Any], audio_features: Dict[str, Any]
) -> Dict[str, Any]:
    """Compute speech clarity score based on transcription confidence and audio features"""
    try:
        transcription_confidence = transcript_data.get("confidence", 0.0) * 0.6

        words_per_minute = audio_features.get("words_per_minute", 0)
        speech_rate_factor = (
            0.2
            if 100 <= words_per_minute <= 160
            else 0.2 * (1.0 - min(1.0, abs(words_per_minute - 130) / 70))
        )

        pause_count = audio_features.get("pause_count", 0)
        pause_factor = 0.2 * (1.0 - min(1.0, pause_count / 15))

        speech_clarity_score = (
            transcription_confidence + speech_rate_factor + pause_factor
        )
        speech_clarity_score = max(0.0, min(1.0, speech_clarity_score))

        return {
            "score": round(speech_clarity_score, 2),
            "confidence": round(transcript_data.get("confidence", 0.0), 2),
        }
    except Exception as e:
        logger.error(f"Failed to compute speech clarity: {str(e)}")
        return {"score": 0.5, "confidence": 0.0}


def estimate_confidence(
    posture_data: Dict[str, Any], audio_features: Dict[str, Any]
) -> Dict[str, Any]:
    """Estimate candidate confidence based on body language & audio"""
    try:
        posture_factor = posture_data.get("posture", 0.0) * 0.3
        movement_factor = min(1.0, posture_data.get("movement_energy", 0.0) * 3) * 0.2

        speech_rate = audio_features.get("words_per_minute", 0)
        speech_rate_factor = (
            0.2
            if 120 <= speech_rate <= 180
            else 0.2 * (1.0 - min(1.0, abs(speech_rate - 150) / 60))
        )

        pause_count = audio_features.get("pause_count", 0)
        filler_count = sum(audio_features.get("filler_words", {}).values())
        fluency_factor = 0.3 * (1.0 - min(1.0, (pause_count + filler_count) / 20))

        confidence_score = sum(
            [posture_factor, movement_factor, speech_rate_factor, fluency_factor]
        )
        confidence_score = max(0.0, min(1.0, confidence_score))

        detection_confidence = posture_data.get("detection_confidence", 0.0)
        confidence = round((0.5 + detection_confidence / 2), 2)

        return {"score": round(confidence_score, 2), "confidence": confidence}
    except Exception as e:
        logger.error(f"Failed to estimate confidence: {str(e)}")
        return {"score": 0.5, "confidence": 0.0}
