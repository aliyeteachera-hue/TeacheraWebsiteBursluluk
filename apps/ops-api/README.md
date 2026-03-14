# @teachera/ops-api

Production host: `ops-api.teachera.com.tr`

## Runtime ownership
- Notification worker/webhook/DLQ APIs
- Observability collector APIs
- Ops health endpoint
- Owns cron configuration for worker + observability collection
- Uses shared backend modules from `packages/shared/backend`

## Commands
- `npm --prefix apps/ops-api run build`

## Deploy
Deploy this runtime from `apps/ops-api` with `vercel.json` in this folder.
