# PDF Extraction Service

Flask service for extracting text from PDF files (resumes, cover letters, etc.)

## Running the Service

### Development Mode
For local testing and development:
```bash
python extract_service.py
```
**Note:** You'll see a warning about using a development server - this is expected in development.

### Production Mode
For production deployment:

**Option 1: Using the startup script**
```bash
./run_production.sh
```

**Option 2: Direct gunicorn command**
```bash
gunicorn -w 4 -b 127.0.0.1:5001 --timeout 120 extract_service:app
```

**Parameters:**
- `-w 4`: 4 worker processes (adjust based on CPU cores)
- `-b 127.0.0.1:5001`: Bind to localhost on port 5001
- `--timeout 120`: 120 second timeout for PDF processing
- `extract_service:app`: Module and application name

## API Endpoint

**POST /extract**
- Accepts multipart/form-data with PDF files
- Returns JSON with extracted text for each file
- Keys: 'resume', 'coverLetter', or custom field names

## Dependencies
- Flask
- PyMuPDF (fitz)
- Gunicorn (for production)
