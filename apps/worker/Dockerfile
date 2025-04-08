# Base slim image with Python 3.11
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables - Important: Change DeepFace home to a location in /tmp
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEEPFACE_HOME=/tmp/deepface \
    MPLCONFIGDIR=/tmp/matplotlib

# Install OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    gcc \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories with proper permissions before installing requirements
RUN mkdir -p /tmp/deepface && \
    chmod -R 777 /tmp/deepface && \
    mkdir -p /tmp/matplotlib && \
    chmod -R 777 /tmp/matplotlib && \
    mkdir -p /app/chunks && \
    chmod -R 777 /app/chunks && \
    mkdir -p /.config && \
    chmod -R 777 /.config

# Copy requirements first (leverage Docker cache)
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Make sure the application code has proper permissions
RUN chmod -R 755 /app && \
    chmod -R 777 /app/chunks

# Expose port
EXPOSE 7860

# Use a non-root user to run the application
RUN useradd -m appuser
USER appuser

# Run the app
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]