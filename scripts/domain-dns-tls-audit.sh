#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0

report_pass() {
  echo "PASS|$1|$2"
  PASS=$((PASS + 1))
}

report_fail() {
  echo "FAIL|$1|$2"
  FAIL=$((FAIL + 1))
}

check_dns() {
  local host="$1"
  local dns_out
  dns_out="$(dig +short "$host" | tr '\n' ' ' | sed 's/  */ /g' | sed 's/ $//')"
  if [[ -n "$dns_out" ]]; then
    report_pass "dns:$host" "$dns_out"
  else
    report_fail "dns:$host" "no_dns_answer"
  fi
}

check_tls() {
  local host="$1"
  local cert subject issuer not_after

  cert="$(echo | openssl s_client -connect "${host}:443" -servername "$host" 2>/dev/null | openssl x509 -noout -subject -issuer -dates || true)"
  if [[ -z "$cert" ]]; then
    report_fail "tls:$host" "tls_handshake_or_cert_parse_failed"
    return
  fi

  subject="$(echo "$cert" | awk -F= '/^subject=/{print $NF}' | sed 's/^ *//')"
  issuer="$(echo "$cert" | awk -F= '/^issuer=/{print $NF}' | sed 's/^ *//')"
  not_after="$(echo "$cert" | awk -F= '/^notAfter=/{print $2}' | sed 's/^ *//')"

  if [[ "$subject" == *"$host" ]]; then
    report_pass "tls:$host" "subject=$subject|issuer=$issuer|notAfter=$not_after"
  else
    report_fail "tls:$host" "subject_mismatch|subject=$subject|expected_contains=$host"
  fi
}

check_http_head() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local status

  status="$(curl -sS -o /tmp/domain-audit-body.out -w '%{http_code}' -I "$url" || true)"
  if [[ "$status" == "$expected" ]]; then
    report_pass "http:$name" "status=$status|url=$url"
  else
    report_fail "http:$name" "status=$status|expected=$expected|url=$url"
  fi
}

echo "=== Domain + DNS + TLS Audit ($(date -u '+%Y-%m-%dT%H:%M:%SZ')) ==="

for host in teachera.com.tr exam-api.teachera.com.tr panel-api.teachera.com.tr ops-api.teachera.com.tr; do
  check_dns "$host"
  check_tls "$host"
done

# Host-level HTTP expectations (HEAD):
# - www returns 200 on root
# - exam-api and ops-api return 200 on /api/health
# - panel-api has no root document and should return 404 at /
check_http_head "www_root" "https://teachera.com.tr/" "200"
check_http_head "exam_api_health" "https://exam-api.teachera.com.tr/api/health" "200"
check_http_head "panel_api_root" "https://panel-api.teachera.com.tr/" "404"
check_http_head "ops_api_health" "https://ops-api.teachera.com.tr/api/health" "200"

echo "=== Summary ==="
echo "pass=$PASS"
echo "fail=$FAIL"

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

