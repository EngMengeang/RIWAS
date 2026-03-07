from flask import Flask, request, jsonify
import fitz  # PyMuPDF

app = Flask(__name__)

@app.route("/extract", methods=["POST"])
def extract_pdf():
    try:
        # Dictionary to store extracted text
        texts = {}

        # Loop through all uploaded files (resume, coverLetter)
        for key in request.files:
            file = request.files[key]
            pdf = fitz.open(stream=file.read(), filetype="pdf")
            text = ""
            for page in pdf:
                text += page.get_text()
            pdf.close()
            texts[key] = text  # key will be 'resume' or 'coverLetter'

        return jsonify(texts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Development server (for testing only)
# For production, use: ./run_production.sh or gunicorn -w 4 -b 127.0.0.1:5001 extract_service:app
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)