# Use Python 3.10 Slim
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (ffmpeg for audio)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy Requirements
COPY requirements.txt .

# Install Python Dependencies
# We use --no-cache-dir to keep the image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy Application Code
COPY . .

# Create a non-root user (Security Best Practice for HF)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Expose Port 7860 (Hugging Face Spaces Default)
EXPOSE 7860

# Run the Application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
