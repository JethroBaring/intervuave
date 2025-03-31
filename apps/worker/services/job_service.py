import httpx
from processor.processor import process_interview
from processor.logger import get_logger

logger = get_logger("job-service")

async def notify_callback(callback_url: str, job_id: str, result_data: dict):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(callback_url, json={
                "jobId": job_id,
                "status": "completed",
                "results": result_data
            })
            response.raise_for_status()
        logger.info(f"Callback successful for job {job_id}")
    except Exception as e:
        logger.error(f"Callback failed for job {job_id}: {str(e)}")

async def submit_processing_job(job_id: str, video_url: str, timestamps: list, questions: dict, callback_url: str):
    try:
        logger.info(f"Processing job {job_id}")
        interview_result = process_interview(job_id, {
            "videoUrl": video_url,
            "timestamps": timestamps,
            "questions": questions
        })
        logger.info(f"Completed job {job_id}")
        print(interview_result)
        # if callback_url:
        #     await notify_callback(callback_url, job_id, interview_result)

    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
