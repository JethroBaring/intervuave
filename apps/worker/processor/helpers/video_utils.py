import subprocess
import tempfile
import os
from ..logger import get_logger
import requests

logger = get_logger("video-utils")

# video_utils.py
def convert_webm_to_mp4(input_path: str, output_path: str):
    """Convert WebM to MP4 using ffmpeg"""
    try:
        cmd = [
            "ffmpeg", "-i", input_path,
            "-r", "25",
            "-c:v", "libx264",
            "-preset", "fast",
            output_path, "-y"
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        logger.info(f"Converted WebM to MP4: {output_path}")
    except Exception as e:
        raise Exception(f"Failed to convert WebM to MP4: {str(e)}")

def download_video(url: str) -> str:
    """Download video and ensure it's MP4 format"""
    logger.info(f"Downloading video from {url}")
    try:
        # Detect extension
        extension = url.split('.')[-1].lower()
        if extension not in ["mp4", "webm"]:
            raise Exception("Unsupported video format")

        # Download original
        with tempfile.NamedTemporaryFile(suffix=f'.{extension}', delete=False) as temp_file:
            video_path = temp_file.name

        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(video_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # If webm → convert
        if extension == "webm":
            mp4_path = video_path.replace('.webm', '.mp4')
            convert_webm_to_mp4(video_path, mp4_path)
            os.unlink(video_path)  # delete original webm
            return mp4_path

        return video_path

    except Exception as e:
        logger.error(f"Failed to download video: {str(e)}")
        if 'video_path' in locals() and os.path.exists(video_path):
            os.unlink(video_path)
        raise
def extract_audio(video_path: str) -> str:
    """Extract audio from video file and return path to audio file"""
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
        audio_path = temp_file.name
    try:
        # Use ffmpeg to extract audio
        import subprocess
        cmd = [
            'ffmpeg', '-i', video_path, 
            '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', 
            audio_path, '-y'
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return audio_path
    except Exception as e:
        if os.path.exists(audio_path):
            os.unlink(audio_path)
        raise Exception(f"Failed to extract audio: {str(e)}")
import subprocess

def slice_video(video_path: str, start_time_ms: float, end_time_ms: float, output_path: str) -> None:
    """Slice a segment from a video file with accurate timing"""
    try:
        start_sec = start_time_ms
        duration = (end_time_ms - start_time_ms)

        cmd = [
            "ffmpeg",
            "-ss", str(start_sec),
            "-i", video_path,
            "-t", str(duration),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-preset", "veryfast",
            output_path,
            "-y"
        ]
        subprocess.run(cmd, check=True)
        print(f"✅ Sliced video saved to {output_path}")
    except subprocess.CalledProcessError as e:
        print(e.stderr.decode())
        raise Exception(f"FFmpeg failed: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to slice video: {str(e)}")



def slice_audio(audio_path: str, start_time: float, end_time: float, output_path: str) -> None:
    """Slice a segment from an audio file"""
    try:
        import subprocess
        cmd = [
            'ffmpeg', '-i', audio_path, 
            '-ss', str(start_time), '-to', str(end_time),
            '-c:a', 'copy',
            output_path, '-y'
        ]
        subprocess.run(cmd, check=True, capture_output=True)
    except Exception as e:
        raise Exception(f"Failed to slice audio: {str(e)}")
# Audio processing functions
