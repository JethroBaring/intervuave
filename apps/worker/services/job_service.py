import httpx
from processor.processor import process_interview
from processor.logger import get_logger
from datetime import datetime, timezone

logger = get_logger("job-service")

async def notify_status(status_callback_url: str, interview_id: str, status: str):
    """Notify NestJS API about status change"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            now = datetime.now(timezone.utc)
            formatted_now = now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            response = await client.patch(f"{status_callback_url}")
            response.raise_for_status()
        logger.info(f"Status updated to '{status}' for job {interview_id}")
    except Exception as e:
        logger.error(f"Status update failed for job {interview_id}: {str(e)}")

async def notify_callback(callback_url: str, interview_id: str, result_data: dict):
    try:
        # Configure client with increased timeout and transport options for large payloads
        async with httpx.AsyncClient(timeout=120.0, transport=httpx.AsyncHTTPTransport(local_address="0.0.0.0")) as client:
            response = await client.post(callback_url, json={
                # "jobId": interview_id,
                # "status": "completed",
                "responses": result_data
            })
            response.raise_for_status()
        logger.info(f"Callback successful for job {interview_id}")
    except Exception as e:
        logger.error(f"Callback failed for job {interview_id}: {str(e)}")

async def notify_task_status(task_status_callback_url: str, interview_id: str, status: str):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.patch(f"{task_status_callback_url}", json={
                "interview_id": interview_id,
                "status": status
            })
            response.raise_for_status()
        logger.info(f"Task status updated to '{status}' for job {interview_id}")
    except Exception as e:
        logger.error(f"Task status update failed for job {interview_id}: {str(e)}")

async def notify_worker_status(worker_status_callback_url: str, interview_id: str, status: str):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.patch(f"{worker_status_callback_url}", json={
                "interview_id": interview_id,
                "status": status
            })
            response.raise_for_status()
        logger.info(f"Worker status updated to '{status}' for job {interview_id}")
    except Exception as e:
        logger.error(f"Worker status update failed for job {interview_id}: {str(e)}")

async def submit_processing_job(interview_id: str, video_url: str, timestamps: list, questions: dict, callback_url: str, status_callback_url: str, task_status_callback_url: str, worker_status_callback_url: str):
    try:
        logger.info(f"Processing job {interview_id}")
        await notify_status(status_callback_url, interview_id, "processing")
        await notify_task_status(task_status_callback_url, interview_id, "PROCESSING")
        await notify_worker_status(worker_status_callback_url, interview_id, "BUSY")
        interview_result = await process_interview(interview_id, {
            "videoUrl": video_url,
            "timestamps": timestamps,
            "questions": questions
        })
        logger.info(f"Completed job {interview_id}")
        # print(interview_result)
        # if callback_url:

        try:
            await notify_callback(callback_url, interview_id, interview_result)
            await notify_task_status(task_status_callback_url, interview_id, "PROCESSED")
            await notify_worker_status(worker_status_callback_url, interview_id, "AVAILABLE")
        except Exception as e:
            logger.error(f"Error updating task and worker status for job {interview_id}: {str(e)}")

    except Exception as e:
        await notify_task_status(task_status_callback_url, interview_id, "FAILED_PROCESSING")
        await notify_worker_status(worker_status_callback_url, interview_id, "AVAILABLE")
        logger.error(f"Error processing job {interview_id}: {str(e)}")
