from typing import Any, Dict, List, Optional

from ..logger import get_logger

logger = get_logger("utils")


# utils.py
def dominant_emotion(emotions: List[Dict[str, Any]]) -> Optional[str]:
    """Determine the dominant emotion across all analyzed frames"""
    if not emotions:
        return None
    emotion_counts = {}
    for emotion_data in emotions:
        emotion = emotion_data["emotion"]
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    # Return the most frequent emotion
    if emotion_counts:
        return max(emotion_counts.items(), key=lambda x: x[1])[0]
    return None


def summarize_emotion_timeline(emotions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create a simplified timeline of emotional changes"""
    if not emotions:
        return []
    # Sort by timestamp
    emotions = sorted(emotions, key=lambda x: x["timestamp"])
    # Simplify the timeline by grouping similar consecutive emotions
    timeline = []
    current_emotion = None
    start_time = 0
    for emotion_data in emotions:
        emotion = emotion_data["emotion"]
        timestamp = emotion_data["timestamp"]
        if emotion != current_emotion:
            if current_emotion:
                timeline.append(
                    {"emotion": current_emotion, "start": start_time, "end": timestamp}
                )
            current_emotion = emotion
            start_time = timestamp
    # Add the last emotion segment
    if current_emotion and emotions:
        timeline.append(
            {
                "emotion": current_emotion,
                "start": start_time,
                "end": emotions[-1]["timestamp"],
            }
        )
    return timeline
