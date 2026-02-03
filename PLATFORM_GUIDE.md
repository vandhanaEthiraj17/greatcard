# Enterprise Greetings Platform - Integration Guide

**Version**: 1.0.0  
**Status**: Production Ready  
**Audience**: Integration Engineers, Platform SREs, Solution Architects

---

## 1. Platform Contract

The GreatCard AI Platform is a **Headless, Asynchronous Generation Engine** designed for high-volume, automated content creation.

### Target Consumers
-   **HR Portals**: Triggering employee birthday/anniversary batches.
-   **Marketing Automation**: Generating personalized client retention assets.
-   **Internal Schedulers**: Cron jobs running nightly generation tasks.

### Service Guarantees
-   **Durability**: Once a Job ID is returned (HTTP 200), the request is persisted in Redis/Mongo and will be processed.
-   **Availability**: The system utilizes a 3-tier AI redundancy model (Imagen -> Stable Diffusion -> Canvas) to ensure *something* is always generated.
-   **Idempotency**: Reprocessing the same CSV will generate new assets (unique variants).

### Non-Guarantees
-   **Real-Time Latency**: Generation is computationally expensive. Do not use this API for blocking, real-time UI interactions (e.g., "loading spinners" waiting for a batch). Use the Polling pattern.
-   **Strict Style Determinism**: AI generation varies. While we structurally enforce intent, "Creative Mode" has inherent randomness.

---

## 2. Authentication & Access

### Security Model
The platform currently operates on an **Internal Trust Model** protected by Network Policies and Application-Level Rate Limiting.

-   **Authentication**: Deferred to the API Gateway (Kong/Apigee) or Private VPC Ingress. The application expects valid traffic to reach it.
-   **Rate Limiting**: Enforced at **100 requests / 15 minutes** per IP address.
    -   *Violation Response*: `HTTP 429 Too Many Requests`.
-   **Data isolation**: Jobs are isolated by `JobId`.

### Recommended Gateway Configuration
If exposing this service publicly, configure your Gateway to inject:
```http
X-Authenticated-User: <client-id>
```

---

## 3. Integration Patterns

### Workflow: Bulk Batch Generation
The primary integration pattern is **Async Batch Processing**.

#### Step 1: Upload & Trigger
Send the CSV file to initate the job.

```bash
curl -X POST http://platform-host/api/bulk/generate \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/employees.csv"
```

**Response (Immediate 200 OK):**
```json
{
  "success": true,
  "jobId": "651abcdef1234567890",  <-- STORE THIS
  "totalRows": 500
}
```

#### Step 2: Poll for Completion
Check status every 5-10 seconds.

```bash
curl -X GET http://platform-host/api/bulk/status/651abcdef1234567890
```

**Response (Processing):**
```json
{
  "success": true,
  "job": {
    "status": "PROCESSING",
    "processedRows": 150,
    "totalRows": 500
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "job": {
    "status": "COMPLETED",
    "result": [
       { "row": 1, "imageUrl": "..." },
       { "row": 2, "imageUrl": "..." }
    ]
  }
}
```

### Retry Guidance
-   **5xx Errors**: Safe to retry immediately (transient network issues).
-   **429 Errors**: Backoff exponentially (wait 1s, then 2s, then 4s).
-   **Job Status "FAILED"**: Do not retry automatically. Alert human operator.

---

## 4. Failure & Degradation Strategy

This platform relies on external AI Cloud Providers (Google Vertex AI, OpenAI). We employ a **"Graceful Degradation"** strategy to ensure business continuity during outages.

### The 3-Tier Safety Net
1.  **Tier 1: Premium AI (Vertex AI)**
    -   *Normal Operation*. High-fidelity, custom imagery.
2.  **Tier 2: Backup AI (Stable Diffusion)**
    -   *Trigger*: Vertex AI rate limits, timeouts, or credential failures.
    -   *Outcome*: Standard-fidelity imagery.
3.  **Tier 3: Canvas Fallback (Solid Color)**
    -   *Trigger*: Total internet outage or external API failures.
    -   *Outcome*: A clean, solid-color background with perfect typography.
    -   *Business Value*: **The card is ALWAYS delivered.** The text (Greeting) is always preserved.

### Auditability
Every generated asset includes an `ai_audit` record in the database:
```json
"ai_audit": {
    "engine": "stable_diffusion",
    "fallback_triggered": true,
    "generation_time_ms": 1200
}
```
Use this data to monitor degradation frequency.

---

## 5. Operations Checklist

### Pre-Deployment
- [ ] **Environment**: Ensure `MONGO_URI` and `REDIS_HOST` are set.
- [ ] **Keys**: Set `OPENAI_API_KEY` and `GOOGLE_APPLICATION_CREDENTIALS` (optional but recommended for Premium tier).
- [ ] **Storage**: Ensure writable permissions on `/storage/generated`.

### Health Verification
Configure your Load Balancer Health Check to:
-   **URL**: `GET /api/health/db`
-   **Expected Status**: `200 OK`
-   **Signals**: returns `{ "mongo": "connected", "redis": "ready" }`.

### Signals to Watch
-   **High "fallback_triggered" count**: Indicates primary AI keys are invalid or quota exceeded.
-   **High 429 Responses**: Clients are hammering the API; consider increasing Rate Limit window or scaling workers.
