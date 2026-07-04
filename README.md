# Object Storage API

A small Express.js service that wraps [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible object storage) using the AWS SDK v3. It exposes a thin REST API for uploading, listing, creating and deleting objects and buckets, plus an interactive Swagger UI.

## Features

- Upload a single file to any bucket (`POST /upload/:bucket/single`)
- Upload up to 10 files at once (`POST /upload/:bucket/multiple`)
- List all buckets (`GET /buckets`)
- List objects in a bucket (`GET /bucket/:bucket/objects`)
- Create a bucket (`POST /bucket/:bucket/create`)
- Delete a single object (`DELETE /bucket/:bucket/object/:key`)
- Delete every object in a bucket (`DELETE /bucket/:bucket/reset`)
- Health check (`GET /health`)
- Interactive OpenAPI 3.0 documentation at `/api-docs`

## Project structure

```
object-storage/
├── src/
│   ├── server.js          # Boots the HTTP server
│   ├── app.js             # Express app, middleware, route mounting
│   ├── swagger.js         # OpenAPI spec (swagger-jsdoc)
│   ├── config/
│   │   ├── env.js         # Loads & validates environment variables
│   │   ├── s3.js          # S3Client instance
│   │   └── multer.js      # Multer (in-memory) config
│   ├── routes/
│   │   ├── index.js       # Aggregates all routers
│   │   ├── system.js      # /health
│   │   ├── uploads.js     # /upload/...
│   │   └── buckets.js     # /buckets, /bucket/...
│   ├── controllers/
│   │   ├── healthController.js
│   │   ├── uploadController.js
│   │   └── bucketController.js
│   ├── middlewares/
│   │   ├── notFound.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── response.js    # success()/fail() helpers
│       ├── upload.js      # uploadToS3() helper
│       └── keyGenerator.js
├── .env.example
└── package.json
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AnhTuIT04/object-storage.git
   cd object-storage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your S3-compatible credentials:
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm start          # production
   npm run dev        # auto-reload via nodemon
   ```

The server boots on the port defined by `PORT` (default `5000`).

## Configuration

All configuration is read from environment variables (see `.env.example`). The app will refuse to start if any of the required variables below are missing.

> **Cloudflare R2 notes**
> - Your S3 API endpoint is `https://<account-id>.r2.cloudflarestorage.com` (find the account ID in the Cloudflare dashboard under **R2 → Overview**).
> - R2 ignores the region; use `auto` for `AWS_REGION`.
> - R2 requires path-style addressing, so set `AWS_S3_FORCE_PATH_STYLE=true`.
> - Access keys are created under **R2 → Manage R2 API Tokens**.
> - `OBJECT_ACCESS_URL` should be your R2 public bucket URL (e.g. `https://pub-<account-id>.r2.dev`) if you've enabled public access on the bucket.

| Variable                   | Required | Default        | Description                                                                 |
|----------------------------|----------|----------------|-----------------------------------------------------------------------------|
| `AWS_ACCESS_KEY_ID`        | yes      | —              | R2 access key ID (created under R2 → Manage R2 API Tokens).                |
| `AWS_SECRET_ACCESS_KEY`    | yes      | —              | R2 secret access key.                                                      |
| `AWS_ENDPOINT`             | yes      | —              | R2 S3 endpoint: `https://<account-id>.r2.cloudflarestorage.com`.           |
| `AWS_REGION`               | yes      | —              | Use `auto` for R2. Also used as `LocationConstraint` when creating buckets. |
| `OBJECT_ACCESS_URL`        | no       | S3 `Location`  | Base URL used to build the public `url` returned after an upload (e.g. your `pub-<account-id>.r2.dev` URL). If unset, the SDK's `Location` is used. |
| `AWS_S3_FORCE_PATH_STYLE`  | no       | `false`        | Set to `true` for R2 (path-style addressing: `endpoint/bucket/key`).       |
| `PORT`                     | no       | `5000`         | HTTP port the API listens on.                                              |
| `NODE_ENV`                 | no       | `development`  | Node environment label.                                                    |

## API documentation (Swagger UI)

Once the server is running, open:

```
http://localhost:5000/api-docs
```

You can explore every endpoint, inspect request/response schemas and execute live calls from the browser. The OpenAPI spec is generated from JSDoc comments in `src/routes/*.js` plus the component schemas in `src/swagger.js`.

## Endpoints

### System

#### `GET /health`
Returns `{ success, message, timestamp }` to confirm the API is up.

### File upload

#### `POST /upload/:bucket/single`
Upload one file. The object key is generated as `<timestamp>-<random><ext>` (the original extension is preserved; the original filename is **not** used as the key).

- Content-Type: `multipart/form-data`
- Form field: `file`
- Max file size: **100 MB**

```bash
curl -X POST \
  http://localhost:5000/upload/my-bucket/single \
  -F "file=@/path/to/file.jpg"
```

Response (`200`):
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "file.jpg",
    "key": "1719686400000-a1b2c3.jpg",
    "url": "https://pub-<account-id>.r2.dev/1719686400000-a1b2c3.jpg",
    "bucket": "my-bucket",
    "size": 102400,
    "mimetype": "image/jpeg"
  }
}
```

#### `POST /upload/:bucket/multiple`
Upload up to 10 files in one request. Each file is uploaded independently; per-file failures are reported in the `failed` array and do not abort the others.

- Content-Type: `multipart/form-data`
- Form field: `files` (repeated)
- Max files: **10**, max size per file: **100 MB**

```bash
curl -X POST \
  http://localhost:5000/upload/my-bucket/multiple \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.png"
```

Response (`200` if at least one file succeeded, `500` if every file failed):
```json
{
  "success": true,
  "message": "Uploaded 2 of 2 files",
  "data": {
    "bucket": "my-bucket",
    "successful": [
      { "success": true, "filename": "file1.jpg", "key": "1719686400000-a1b2c3.jpg", "url": "...", "size": 102400, "mimetype": "image/jpeg" }
    ],
    "failed": [],
    "summary": { "total": 2, "successful": 2, "failed": 0 }
  }
}
```

### Bucket management

#### `GET /buckets`
List all buckets.

#### `GET /bucket/:bucket/objects`
List objects in a bucket.

#### `POST /bucket/:bucket/create`
Create a new bucket. Returns `409` if the bucket already exists.

```bash
curl -X POST http://localhost:5000/bucket/my-new-bucket/create
```

#### `DELETE /bucket/:bucket/object/:key`
Delete a single object by key.

```bash
curl -X DELETE http://localhost:5000/bucket/my-bucket/object/1719686400000-a1b2c3.jpg
```

#### `DELETE /bucket/:bucket/reset`
Delete **all** objects in a bucket. Objects are listed with pagination and removed in batches of up to 1000 per `DeleteObjects` request. The response reports the number of objects deleted.

```bash
curl -X DELETE http://localhost:5000/bucket/my-bucket/reset
```

## File upload limits

- Maximum file size: **100 MB** per file
- Maximum number of files per multiple-upload request: **10**
- Files are buffered in memory (Multer `memoryStorage`); size your process accordingly for large concurrent uploads.

## Error handling

All errors return a standardized body:

```json
{ "success": false, "message": "Error description" }
```

Common HTTP status codes:

| Status | Meaning                                                              |
|--------|----------------------------------------------------------------------|
| `200`  | Success                                                              |
| `400`  | Bad request (no file provided, file exceeds the 100 MB limit, ...)  |
| `404`  | Unknown route                                                        |
| `409`  | Bucket already exists (`POST /bucket/:bucket/create`)               |
| `500`  | Internal server error / S3 error / all files in a multi-upload failed |

Multer errors (e.g. `LIMIT_FILE_SIZE`) are surfaced as `400` with a human-readable message rather than a generic `500`.

## Testing uploads with an HTML form

The repo no longer ships a `test.html` route. You can use this snippet locally to exercise the upload endpoints:

```html
<!DOCTYPE html>
<html>
<head><title>File Upload Test</title></head>
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
