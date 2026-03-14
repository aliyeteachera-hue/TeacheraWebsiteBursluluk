#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEAM="${VERCEL_TEAM:-ahmet-fehim-uyars-projects}"
ATTACH_DOMAINS="${ATTACH_DOMAINS:-0}"
DEPLOY="${DEPLOY:-0}"
SMOKE="${SMOKE:-1}"

APPS=(
  "www:teachera-www:teachera.com.tr"
  "exam-api:teachera-exam-api:exam-api.teachera.com.tr"
  "panel-api:teachera-panel-api:panel-api.teachera.com.tr"
  "ops-api:teachera-ops-api:ops-api.teachera.com.tr"
)

echo "TEAM=$TEAM"
echo "ROOT_DIR=$ROOT_DIR"

echo "== Step 1/4: Link each app to its Vercel project =="
for item in "${APPS[@]}"; do
  IFS=":" read -r app_dir project_name _domain <<<"$item"
  full_dir="$ROOT_DIR/apps/$app_dir"
  echo "-- linking $full_dir -> $project_name"
  npx --yes vercel link \
    --yes \
    --scope "$TEAM" \
    --project "$project_name" \
    --cwd "$full_dir"
done

echo "== Step 2/4: Verify local links =="
for item in "${APPS[@]}"; do
  IFS=":" read -r app_dir _project_name _domain <<<"$item"
  full_dir="$ROOT_DIR/apps/$app_dir"
  printf "%s -> " "$app_dir"
  cat "$full_dir/.vercel/project.json"
done

if [[ "$ATTACH_DOMAINS" == "1" ]]; then
  echo "== Step 3/4: Ensure domain assignment =="
  for item in "${APPS[@]}"; do
    IFS=":" read -r app_dir project_name domain_name <<<"$item"
    full_dir="$ROOT_DIR/apps/$app_dir"
    echo "-- attach domain $domain_name -> $project_name (cwd=$app_dir)"
    set +e
    domain_output="$(npx --yes vercel domains add "$domain_name" --scope "$TEAM" --cwd "$full_dir" 2>&1)"
    domain_exit=$?
    set -e
    if [[ $domain_exit -eq 0 ]]; then
      echo "$domain_output"
      continue
    fi

    if echo "$domain_output" | grep -qi "already assigned"; then
      echo "OK: $domain_name already assigned (no action needed)."
      continue
    fi

    echo "$domain_output"
    echo "WARN: domain add failed for $domain_name. Continuing..."
  done
else
  echo "== Step 3/4: Domain assignment skipped (set ATTACH_DOMAINS=1 to enable) =="
fi

if [[ "$DEPLOY" == "1" ]]; then
  echo "== Step 4/4: Deploy all 4 projects =="
  cd "$ROOT_DIR"
  npm run deploy:www:prod
  npm run deploy:exam-api:prod
  npm run deploy:panel-api:prod
  npm run deploy:ops-api:prod
else
  echo "== Step 4/4: Deploy skipped (set DEPLOY=1 to enable) =="
fi

if [[ "$SMOKE" == "1" ]]; then
  echo "== Smoke checks =="
  curl -sS -o /tmp/www.out -w "www|HTTP|%{http_code}\n" "https://teachera.com.tr"

  EXAM_HEALTH_STATUS="$(curl -sS -o /tmp/exam_health.out -w '%{http_code}' 'https://exam-api.teachera.com.tr/api/health')"
  EXAM_START_STATUS="$(curl -sS -o /tmp/exam_start.out -w '%{http_code}' 'https://exam-api.teachera.com.tr/api/exam/session/start')"
  PANEL_ME_STATUS="$(curl -sS -o /tmp/panel_me.out -w '%{http_code}' 'https://panel-api.teachera.com.tr/api/panel/auth/me')"
  OPS_HEALTH_STATUS="$(curl -sS -o /tmp/ops_health.out -w '%{http_code}' 'https://ops-api.teachera.com.tr/api/health')"
  OPS_WORKER_STATUS="$(curl -sS -o /tmp/ops_worker.out -w '%{http_code}' 'https://ops-api.teachera.com.tr/api/notifications/worker')"

  echo "exam_api|health|HTTP|$EXAM_HEALTH_STATUS (200 expected)"
  echo "exam_api|start|HTTP|$EXAM_START_STATUS (405 expected for GET)"
  echo "panel_api|auth_me|HTTP|$PANEL_ME_STATUS (401 expected unauth)"
  echo "ops_api|health|HTTP|$OPS_HEALTH_STATUS (200 expected)"
  echo "ops_api|worker|HTTP|$OPS_WORKER_STATUS (401/403 expected without worker secret)"

  head -c 180 /tmp/exam_health.out; echo
  head -c 180 /tmp/exam_start.out; echo
  head -c 180 /tmp/panel_me.out; echo
  head -c 180 /tmp/ops_health.out; echo
  head -c 180 /tmp/ops_worker.out; echo
else
  echo "Smoke skipped (set SMOKE=1 to enable)"
fi

echo "DONE: Vercel multi-project setup flow complete."
