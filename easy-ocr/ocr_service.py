from flask import Flask, request, jsonify
import easyocr

app = Flask(__name__)

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    reader = easyocr.Reader(['en'], gpu=False) 
    results = reader.readtext(file.read())
    extracted_text = ' '.join([res[1] for res in results])

    return jsonify({'text': extracted_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5550)
