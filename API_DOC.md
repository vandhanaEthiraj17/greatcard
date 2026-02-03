# API Documentation v1.0 [FROZEN]

This document defines the stable API contract for the Enterprise Greeting Card Generation System.
**Breaking changes to this contract are strictly prohibited.**

## Base URL
`http://<SERVER_HOST>:<PORT>/api`

---

## 1. Bulk Generation (Entry Point)
**Endpoint**: `POST /bulk/generate`
**Description**: Upload a CSV file to trigger an asynchronous bulk generation job.

### Request
-   **Content-Type**: `multipart/form-data`
-   **Body**:
    -   `file`: (Required) A valid `.csv` file.

**CSV Format**:
```csv
name,occasion,prompt
Alice,Birthday,Elegant floral card
Bob,Corporate,Thank you for partnership
```

### Response
**Success (200 OK)**
```json
{
  "success": true,
  "message": "Bulk job started successfully",
  "jobId": "651a...9f",
  "totalRows": 150
}
```

**Error (400 Bad Request)**
```json
{
  "success": false,
  "message": "Invalid file type. Only CSV allowed."
}
```

---

## 2. Job Status (polling)
**Endpoint**: `GET /bulk/status/:id`
**Description**: Check the progress of a specific bulk job. Implementation supports "Partial Success".

### Request
-   **Params**: `id` (The `jobId` from the generation response)

### Response
**Success (200 OK)**
```json
{
  "success": true,
  "job": {
    "status": "PROCESSING",
    "totalRows": 100,
    "processedRows": 45,
    "failedRows": 0,
    "completedAt": null,
    "result": [
       {
         "row": 1,
         "name": "Alice",
         "status": "SUCCESS",
         "imageUrl": "http://.../storage/generated/ai-card-1.jpg"
       }
    ],
    "errors": []
  }
}
```

---

## 3. Healtcheck (Liveness)
**Endpoint**: `GET /health/db`
**Description**: Checks connectivity to critical infrastructure (Mongo, Redis). Use this for Load Balancer probes.

### Response
**Success (200 OK)**
```json
{
  "status": "OK",
  "mongo": "connected",
  "redis": "ready"
}
```

**Failure (503 Service Unavailable)**
```json
{
  "status": "ERROR",
  "mongo": "disconnected"
}
```
