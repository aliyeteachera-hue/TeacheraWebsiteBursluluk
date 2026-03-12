# P0-9 Target Infra Topology (10k–15k)
Date: 2026-03-12

## Goal
P0-9 requires production topology that separates runtime concerns and proves scale-readiness for 10k–15k concurrent campaign traffic.

## Runtime Boundaries (Required)
Use dedicated hosts/services for each concern:

1. `www.teachera.com.tr`  
Frontend web app + static pages only (no heavy exam/session workloads).

2. `exam-api.teachera.com.tr`  
Candidate exam APIs (`/api/exam/*`, `/api/health`) behind gateway/edge policy.

3. `panel-api.teachera.com.tr`  
Panel APIs (`/api/panel/*`) isolated from candidate traffic.

4. `ops-api.teachera.com.tr`  
Worker + webhook + replay (`/api/notifications/*`) isolated from public web paths.

## Target Managed Services
1. PostgreSQL: Aurora PostgreSQL or RDS PostgreSQL Multi-AZ, encrypted, backup retention >= 7 days, PITR enabled.
2. Redis: ElastiCache replication group, automatic failover enabled, transit+at-rest encryption enabled.
3. Queue: SQS standard queue + DLQ (`RedrivePolicy` mandatory), KMS encryption preferred.
4. Object store/CDN: S3 + CloudFront (bucket encryption + versioning).
5. API edge policy/gateway: API Gateway/ALB + WAF rules for abuse endpoints.

## Autoscaling Matrix (Documented Baseline)
Tune after load-test evidence, but minimum documented baseline:

1. Exam API service
min: 4 instances, max: 40 instances, target CPU: 55%, target memory: 65%.

2. Panel API service
min: 2 instances, max: 10 instances, target CPU: 45%.

3. Worker service
min: 2 instances, max: 20 instances, scale trigger: queue depth + age of oldest message.

4. DB capacity policy
writer + >=1 reader, autoscaling or pre-provisioned burst headroom during exam windows.

## DNS / Traffic Policy
1. Route53 records map each host to its dedicated runtime.
2. Candidate traffic routed only to `exam-api`; panel users only to `panel-api`.
3. WAF / edge throttling:
   - strict limits on `/api/exam/session/start`, `/api/exam/session/submit`, `/api/forms`, `/api/panel/auth/login`
   - bot rules + geo/pattern rate controls.

## Required Env Inputs for Consolidated Audit
Set these in shell before running topology audit script:

1. `WWW_BASE_URL`
2. `EXAM_API_BASE_URL`
3. `PANEL_API_BASE_URL`
4. `OPS_API_BASE_URL`
5. `AWS_REGION`
6. `AURORA_CLUSTER_ID` or `RDS_INSTANCE_ID`
7. `ELASTICACHE_REPLICATION_GROUP_ID`
8. `SQS_QUEUE_URL`
9. `S3_BUCKET_NAME`
10. `CLOUDFRONT_DISTRIBUTION_ID`

## Consolidated Commands (Time-saving)
Run these two command groups only:

1. Code quality batch
```bash
npm run p0:quick
```

2. P0-9 infra + boundary audit batch
```bash
npm run p0:topology:audit -- --http --aws
```

If the second command returns `overall_ready_for_p0_9: true`, infra DoD is operationally verified.

3. Fastest autodiscover mode (recommended)
```bash
npm run p0:topology:autodiscover
```
This command discovers likely AWS resource IDs (RDS/Aurora, Redis, SQS, S3, CloudFront) and runs the full `--http --aws` audit in one shot.
