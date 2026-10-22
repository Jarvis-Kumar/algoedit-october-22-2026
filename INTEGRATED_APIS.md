# 🌟 Integrated APIs Directory & Registry

This document lists **every single external API and backend service** integrated into this website. Use this as the source of truth for configured adapters, storage, real-time collaboration, and payment systems.

---

## 📋 Comprehensive API Integration Registry

| Service Name | Purpose / Functionality | Config / Adapter Files | Target Env Keys |
| :--- | :--- | :--- | :--- |
| **Google Gemini API** | Multi-modal prompt expansion, AI orchestration, and conversational assistance. | `/services/adapters/geminiAdapter.ts` | `GEMINI_API_KEY` |
| **Fal.ai API** | Unified generative provider importing OpenAI (DALL-E), Stability AI, Pika, Runway, Polo, and Replicate models securely. | `/services/adapters/*Adapter.ts`<br>`/services/config.ts` | `FAL_KEY` |
| **Cloudflare Workers AI** | Serverless inference engine for client/server AI models. | `/services/config.ts` | `CLOUDFLARE_API_TOKEN`<br>`CLOUDFLARE_ACCOUNT_ID` |
| **Cloudflare R2 Storage** | High-performance, S3-compatible cloud object storage for media files & assets. | `/services/storage/storageService.ts` | `CLOUDFLARE_R2_ACCESS_KEY_ID`<br>`CLOUDFLARE_R2_SECRET_ACCESS_KEY`<br>`CLOUDFLARE_R2_BUCKET`<br>`CLOUDFLARE_R2_ENDPOINT` |
| **Upstash Redis (TCP)** | Ultra-fast key-value cache and pub-sub broker for scalable realtime room collaboration. | `/services/collaboration/collaborationServer.ts`<br>`/services/config.ts` | `REDIS_URL` or `UPSTASH_REDIS_URL` |
| **Upstash Redis (REST)** | REST fallback connection endpoints for cache queries. | `/services/config.ts` | `UPSTASH_REDIS_REST_URL`<br>`UPSTASH_REDIS_REST_TOKEN` |
| **Stripe API** | Secure user billing, checkout sessions, and webhook processing. | `/services/config.ts` | `STRIPE_SECRET_KEY`<br>`STRIPE_WEBHOOK_SECRET` |

---

## 🛠️ Detailed Integration Details

### 1. Generative AI & Model Adapters (Unified via Fal.ai)
The platform features an abstract model adapter framework `/services/adapters/adapterFactory.ts` that dynamically selects the configured provider:
* **Google Gemini (`GoogleGenAI` SDK)**: Uses `@google/genai` to trigger robust, multi-modal capabilities.
* **OpenAI (via Fal.ai)**: Routes GPT-4o style text completions to Qwen models and DALL-E image generations to Flux Pro on Fal.ai.
* **Stability AI (via Fal.ai)**: Routes SDXL/Stable Diffusion requests to Stable Diffusion models hosted on Fal.ai.
* **Runway & Pika (via Fal.ai)**: Routes high-fidelity text-to-video / image-to-video requests to Luma Dream Machine on Fal.ai.
* **Replicate & Polo (via Fal.ai)**: Routes upscale, face restoration, segmentation (RealESRGAN, GFPGAN, SAM), and other workflows to optimized serverless instances on Fal.ai.
* **Fal.ai Key Integration**: All models previously requiring independent developer API keys are now securely managed under a single unified `FAL_KEY` key.

### 2. High-Speed Media Asset Storage (Cloudflare R2)
All user uploads, media files, and output creations are persistently stored in **Cloudflare R2** via `/services/storage/storageService.ts`:
* Built using the `@aws-sdk/client-s3` protocol.
* Features secure pre-signed upload URL generation (`getUploadUrl`) and download URL generation (`getDownloadUrl`).
* Relies on the custom endpoint configuration mapping directly to your account: `https://<account_id>.r2.cloudflarestorage.com`.

### 3. Realtime Collaboration & Cache (Upstash Redis)
Multi-user project editing and live sync rely on a robust pub-sub architecture using **Upstash Redis**:
* Custom adapter parsing (`cleanEnvString`) prevents quote wrapping/escaping issues on URL structures.
* Links directly to the `socket.io` server via `@socket.io/redis-adapter` for low-latency active event propagation across system client threads.
* Implements optional fallback support using the HTTP-based REST token parameters for fast lookup cache queries.

### 4. Billing Engine (Stripe)
* Synchronized with Stripe portal checkouts and standard webhooks to handle real-time plan tracking for active AI studios.

---

## 📋 Environment Setup Guide

To apply these endpoints to your environment configuration instantly, add the following variables to your Settings:

```env
# Essential AI Providers
GEMINI_API_KEY=your_gemini_api_key
FAL_KEY=your_fal_ai_key

# Stripe Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudflare Workers / Account management
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# Cloudflare R2 S3-Compatible Storage Credentials
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET=algoedit-storage
CLOUDFLARE_R2_ENDPOINT=https://your_cloudflare_account_id.r2.cloudflarestorage.com

# Upstash Redis TCP Collaboration Endpoints
REDIS_URL=rediss://default:your_token@your_db.upstash.io:6379

# Upstash Redis REST Credentials
UPSTASH_REDIS_REST_URL=https://your_db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token
```
