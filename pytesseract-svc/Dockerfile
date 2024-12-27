# Use a lightweight Python image
FROM python:3.10-slim

# Install Tesseract and required system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files to the container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port for the Flask app
EXPOSE 5000

# Start the app using gunicorn
CMD ["gunicorn", "pytesseract:app", "--bind", "0.0.0.0:5550"]
