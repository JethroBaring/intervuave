import httpx
from processor.processor import process_interview
from processor.logger import get_logger
from datetime import datetime, timezone

logger = get_logger("job-service")

async def notify_status(status_callback_url: str, interview_id: str, status: str):
    """Notify NestJS API about status change"""
    try:
        async with httpx.AsyncClient() as client:
            now = datetime.now(timezone.utc)
            formatted_now = now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            response = await client.patch(f"{status_callback_url}")
            response.raise_for_status()
        logger.info(f"Status updated to '{status}' for job {interview_id}")
    except Exception as e:
        logger.error(f"Status update failed for job {interview_id}: {str(e)}")

async def notify_callback(callback_url: str, interview_id: str, result_data: dict):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(callback_url, json={
                # "jobId": interview_id,
                # "status": "completed",
                "responses": result_data
            })
            response.raise_for_status()
        logger.info(f"Callback successful for job {interview_id}")
    except Exception as e:
        logger.error(f"Callback failed for job {interview_id}: {str(e)}")

async def submit_processing_job(interview_id: str, video_url: str, timestamps: list, questions: dict, callback_url: str, status_callback_url: str):
    try:
        logger.info(f"Processing job {interview_id}")
        await notify_status(status_callback_url, interview_id, "processing")
        interview_result = await process_interview(interview_id, {
            "videoUrl": video_url,
            "timestamps": timestamps,
            "questions": questions
        })
        logger.info(f"Completed job {interview_id}")
        # print(interview_result)
        # if callback_url:
        await notify_callback(callback_url, interview_id, interview_result)

    except Exception as e:
        logger.error(f"Error processing job {interview_id}: {str(e)}")
