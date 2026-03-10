# Object Storage API

A simple Express.js API for ClawCloud object storage with S3-compatible interface.

## Features

- Upload single files to any bucket
- Upload multiple files to any bucket
- List buckets
- List objects in bucket
- Health check endpoint
- **Interactive API Documentation with Swagger UI**

## Installation

1. Clone repository:
```
git clone https://github.com/AnhTuIT04/object-storage.git
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Start the server:
```bash
node server.js
```

## 📚 API Documentation

This API includes **interactive Swagger UI documentation** that allows you to:
- Explore all available endpoints
- Test API calls directly from the browser
- View request/response schemas
- Download OpenAPI specification

**Access the documentation at:** `http://localhost:5000/api-docs` (or your configured port)

The Swagger UI provides a user-friendly interface to:
1. **Try out endpoints** - Execute real API calls with custom parameters
2. **View detailed schemas** - See request/response structure and examples
3. **Authentication testing** - Test with different bucket names and files
4. **Download API spec** - Get the OpenAPI/Swagger JSON specification

## API Endpoints

### Upload Single File
**POST** `/upload/:bucket/single`

Upload a single file to the specified bucket.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `file` field

**Example using curl:**
```bash
curl -X POST \
  http://localhost:5000/upload/my-bucket/single \
  -F "file=@/path/to/your/file.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "file.jpg",
    "key": "1635123456789-file.jpg",
    "url": "https://objectstorageapi.ap-southeast-1.clawcloudrun.com/my-bucket/1635123456789-file.jpg",
    "bucket": "my-bucket",
    "size": 102400,
    "mimetype": "image/jpeg"
  }
}
```

### Upload Multiple Files
**POST** `/upload/:bucket/multiple`

Upload multiple files to the specified bucket.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `files` field (multiple files)

**Example using curl:**
```bash
curl -X POST \
  http://localhost:5000/upload/my-bucket/multiple \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.png" \
  -F "files=@/path/to/file3.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Uploaded 3 of 3 files",
  "data": {
    "bucket": "my-bucket",
    "successful": [
      {
        "success": true,
        "filename": "file1.jpg",
        "key": "1635123456789-abc123-file1.jpg",
        "url": "https://objectstorageapi.ap-southeast-1.clawcloudrun.com/my-bucket/1635123456789-abc123-file1.jpg",
        "size": 102400,
        "mimetype": "image/jpeg"
      }
    ],
    "failed": [],
    "summary": {
      "total": 3,
      "successful": 3,
      "failed": 0
    }
  }
}
```

### Other Endpoints

#### Health Check
**GET** `/health`

Check if the API is running.

#### List Buckets
**GET** `/buckets`

List all available buckets.

#### List Objects in Bucket
**GET** `/bucket/:bucket/objects`

List all objects in a specific bucket.

## Configuration

The application uses the following environment variables:

```env
# ClawCloud S3-compatible storage credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-1
AWS_ENDPOINT=https://objectstorageapi.ap-southeast-1.clawcloudrun.com
AWS_S3_FORCE_PATH_STYLE=true

# Server configuration
PORT=5000
NODE_ENV=development
```

## File Upload Limits

- Maximum file size: 10MB per file
- Maximum number of files in multiple upload: 10 files

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing files, invalid parameters)
- `500`: Internal Server Error (upload failed, S3 errors)

## Testing with HTML Form

Create a simple HTML file to test the upload functionality:

```html
<!DOCTYPE html>
<html>
<head>
    <title>File Upload Test</title>
</head>
<body>
    <h1>Single File Upload</h1>
    <form action="http://localhost:5000/upload/test-bucket/single" method="post" enctype="multipart/form-data">
        <input type="file" name="file" required>
        <button type="submit">Upload Single File</button>
    </form>

    <h1>Multiple File Upload</h1>
    <form action="http://localhost:5000/upload/test-bucket/multiple" method="post" enctype="multipart/form-data">
        <input type="file" name="files" multiple required>
        <button type="submit">Upload Multiple Files</button>
    </form>
</body>
</html>
```

## License

MIT
