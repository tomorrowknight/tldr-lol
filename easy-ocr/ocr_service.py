import os
from flask import Flask, request, jsonify
from PIL import Image
import pytesseract

app = Flask(__name__)

@app.route("/")
def home():
    return "OCR Service is Running!"

@app.route("/ocr", methods=["POST"])
def process_ocr():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']

    try:
        # Open the image file
        image = Image.open(file.stream)

        # Perform OCR
        text = pytesseract.image_to_string(image)

        return jsonify({"text": text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
