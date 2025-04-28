import logging


def get_logger(
    name: str, job_id: str = "N/A", question_id: str = "N/A"
) -> logging.LoggerAdapter:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '{"time": "%(asctime)s", "level": "%(levelname)s", "job": "%(job_id)s", "question": "%(question_id)s", "message": "%(message)s"}'
    )
    handler.setFormatter(formatter)
    if not logger.handlers:
        logger.addHandler(handler)
    return logging.LoggerAdapter(logger, {"job_id": job_id, "question_id": question_id})
