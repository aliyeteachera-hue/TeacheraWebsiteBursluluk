import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const enableHttpChecks = args.has('--http');
const enableAwsChecks = args.has('--aws');

const STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  WARN: 'WARN',
  SKIP: 'SKIP',
};

function trim(value) {
  return String(value || '').trim();
}

function readEnv(...names) {
  for (const name of names) {
    const value = trim(process.env[name]);
    if (value) return value;
  }
  return '';
}

function parseHost(urlValue) {
  try {
    return new URL(urlValue).host.toLowerCase();
  } catch {
    return '';
  }
}

function bool(value) {
  return value ? STATUS.PASS : STATUS.FAIL;
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function summarize(checks) {
  const counts = {
    pass: 0,
    fail: 0,
    warn: 0,
    skip: 0,
  };
  for (const check of checks) {
    if (check.status === STATUS.PASS) counts.pass += 1;
    if (check.status === STATUS.FAIL) counts.fail += 1;
    if (check.status === STATUS.WARN) counts.warn += 1;
    if (check.status === STATUS.SKIP) counts.skip += 1;
  }
  return counts;
}

function pushCheck(checks, id, status, detail, evidence = {}) {
  checks.push({
    id,
    status,
    detail,
    evidence,
  });
}

function runAwsJson(region, argsList) {
  const output = execFileSync('aws', [...argsList, '--region', region, '--output', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(output);
}

async function runHttpCheck(checks, id, url, okStatuses = [200]) {
  if (!enableHttpChecks) {
    pushCheck(checks, id, STATUS.SKIP, 'HTTP checks disabled (use --http).', { url });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const pass = okStatuses.includes(response.status);
    pushCheck(
      checks,
      id,
      pass ? STATUS.PASS : STATUS.FAIL,
      pass ? `HTTP ${response.status}` : `Unexpected HTTP ${response.status}`,
      { url, status: response.status, expected: okStatuses },
    );
  } catch (error) {
    pushCheck(checks, id, STATUS.FAIL, `HTTP request failed: ${error.message || String(error)}`, { url });
  }
}

function runTopologyBoundaryChecks(checks) {
  const wwwBase = readEnv('WWW_BASE_URL', 'VITE_SITE_URL', 'PUBLIC_WWW_BASE_URL') || 'https://teachera.com.tr';
  const examApiBase = readEnv('EXAM_API_BASE_URL') || wwwBase;
  const panelApiBase = readEnv('PANEL_API_BASE_URL') || wwwBase;
  const opsApiBase = readEnv('OPS_API_BASE_URL') || examApiBase;

  const hosts = {
    www: parseHost(wwwBase),
    exam_api: parseHost(examApiBase),
    panel_api: parseHost(panelApiBase),
    ops_api: parseHost(opsApiBase),
  };
  const distinctHosts = new Set(Object.values(hosts).filter(Boolean));

  pushCheck(
    checks,
    'runtime_boundaries_distinct_hosts',
    distinctHosts.size >= 3 ? STATUS.PASS : STATUS.FAIL,
    distinctHosts.size >= 3
      ? `Runtime concerns split across ${distinctHosts.size} hosts.`
      : `Only ${distinctHosts.size} distinct host(s). Need >=3 for proper www/exam/panel/ops separation.`,
    { bases: { wwwBase, examApiBase, panelApiBase, opsApiBase }, hosts: hosts },
  );

  const examGatewayLike = /\.execute-api\./.test(hosts.exam_api) || hosts.exam_api.includes('api.');
  pushCheck(
    checks,
    'api_gateway_boundary',
    examGatewayLike ? STATUS.PASS : STATUS.WARN,
    examGatewayLike
      ? 'Exam/API boundary appears to be behind dedicated API host/gateway.'
      : 'Exam/API host does not look gateway-separated (expected api/gateway host).',
    { exam_api_host: hosts.exam_api },
  );

  return { wwwBase, examApiBase, panelApiBase, opsApiBase };
}

function runAwsChecks(checks) {
  if (!enableAwsChecks) {
    pushCheck(checks, 'aws_checks', STATUS.SKIP, 'AWS checks disabled (use --aws).');
    return;
  }

  const region = readEnv('AWS_REGION', 'AWS_DEFAULT_REGION', 'P0_AWS_REGION');
  if (!region) {
    pushCheck(checks, 'aws_region', STATUS.FAIL, 'AWS region is missing (AWS_REGION).');
    return;
  }

  try {
    execFileSync('aws', ['sts', 'get-caller-identity', '--region', region], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    pushCheck(checks, 'aws_identity', STATUS.PASS, 'AWS credentials are valid for audit.');
  } catch (error) {
    pushCheck(checks, 'aws_identity', STATUS.FAIL, `AWS auth failed: ${error.message || String(error)}`);
    return;
  }

  const clusterId = readEnv('AURORA_CLUSTER_ID', 'P0_AURORA_CLUSTER_ID');
  const instanceId = readEnv('RDS_INSTANCE_ID', 'P0_RDS_INSTANCE_ID');
  if (clusterId) {
    try {
      const clusterResp = runAwsJson(region, [
        'rds',
        'describe-db-clusters',
        '--db-cluster-identifier',
        clusterId,
      ]);
      const cluster = clusterResp.DBClusters?.[0];
      if (!cluster) {
        pushCheck(checks, 'postgres_cluster_exists', STATUS.FAIL, `Aurora cluster not found: ${clusterId}`);
      } else {
        pushCheck(checks, 'postgres_cluster_exists', STATUS.PASS, `Aurora cluster found: ${clusterId}`);
        pushCheck(
          checks,
          'postgres_backup_pitr',
          cluster.BackupRetentionPeriod >= 7 ? STATUS.PASS : STATUS.FAIL,
          `BackupRetentionPeriod=${cluster.BackupRetentionPeriod} (expected >=7).`,
        );
        pushCheck(
          checks,
          'postgres_encryption_at_rest',
          bool(Boolean(cluster.StorageEncrypted)),
          `StorageEncrypted=${Boolean(cluster.StorageEncrypted)}`,
        );
        pushCheck(
          checks,
          'postgres_deletion_protection',
          bool(Boolean(cluster.DeletionProtection)),
          `DeletionProtection=${Boolean(cluster.DeletionProtection)}`,
        );
        pushCheck(
          checks,
          'postgres_ha_members',
          (cluster.DBClusterMembers || []).length >= 2 ? STATUS.PASS : STATUS.FAIL,
          `DBClusterMembers=${(cluster.DBClusterMembers || []).length} (expected >=2).`,
        );
      }
    } catch (error) {
      pushCheck(checks, 'postgres_cluster_exists', STATUS.FAIL, `Aurora audit failed: ${error.message || String(error)}`);
    }
  } else if (instanceId) {
    try {
      const instanceResp = runAwsJson(region, [
        'rds',
        'describe-db-instances',
        '--db-instance-identifier',
        instanceId,
      ]);
      const instance = instanceResp.DBInstances?.[0];
      if (!instance) {
        pushCheck(checks, 'postgres_instance_exists', STATUS.FAIL, `RDS instance not found: ${instanceId}`);
      } else {
        pushCheck(checks, 'postgres_instance_exists', STATUS.PASS, `RDS instance found: ${instanceId}`);
        pushCheck(
          checks,
          'postgres_ha_multi_az',
          bool(Boolean(instance.MultiAZ)),
          `MultiAZ=${Boolean(instance.MultiAZ)}`,
        );
        pushCheck(
          checks,
          'postgres_backup_pitr',
          instance.BackupRetentionPeriod >= 7 ? STATUS.PASS : STATUS.FAIL,
          `BackupRetentionPeriod=${instance.BackupRetentionPeriod} (expected >=7).`,
        );
        pushCheck(
          checks,
          'postgres_encryption_at_rest',
          bool(Boolean(instance.StorageEncrypted)),
          `StorageEncrypted=${Boolean(instance.StorageEncrypted)}`,
        );
        pushCheck(
          checks,
          'postgres_deletion_protection',
          bool(Boolean(instance.DeletionProtection)),
          `DeletionProtection=${Boolean(instance.DeletionProtection)}`,
        );
      }
    } catch (error) {
      pushCheck(checks, 'postgres_instance_exists', STATUS.FAIL, `RDS audit failed: ${error.message || String(error)}`);
    }
  } else {
    pushCheck(checks, 'postgres_resource_declared', STATUS.FAIL, 'Missing AURORA_CLUSTER_ID or RDS_INSTANCE_ID env.');
  }

  const redisGroupId = readEnv('ELASTICACHE_REPLICATION_GROUP_ID', 'P0_REDIS_REPLICATION_GROUP_ID');
  if (redisGroupId) {
    try {
      const redisResp = runAwsJson(region, [
        'elasticache',
        'describe-replication-groups',
        '--replication-group-id',
        redisGroupId,
      ]);
      const group = redisResp.ReplicationGroups?.[0];
      if (!group) {
        pushCheck(checks, 'redis_group_exists', STATUS.FAIL, `Redis replication group not found: ${redisGroupId}`);
      } else {
        pushCheck(checks, 'redis_group_exists', STATUS.PASS, `Redis replication group found: ${redisGroupId}`);
        pushCheck(
          checks,
          'redis_ha_failover',
          group.AutomaticFailover === 'enabled' ? STATUS.PASS : STATUS.FAIL,
          `AutomaticFailover=${group.AutomaticFailover}`,
        );
        pushCheck(
          checks,
          'redis_encryption_at_rest',
          bool(Boolean(group.AtRestEncryptionEnabled)),
          `AtRestEncryptionEnabled=${Boolean(group.AtRestEncryptionEnabled)}`,
        );
        pushCheck(
          checks,
          'redis_encryption_in_transit',
          bool(Boolean(group.TransitEncryptionEnabled)),
          `TransitEncryptionEnabled=${Boolean(group.TransitEncryptionEnabled)}`,
        );
      }
    } catch (error) {
      pushCheck(checks, 'redis_group_exists', STATUS.FAIL, `Redis audit failed: ${error.message || String(error)}`);
    }
  } else {
    pushCheck(checks, 'redis_group_declared', STATUS.FAIL, 'Missing ELASTICACHE_REPLICATION_GROUP_ID env.');
  }

  const queueUrl = readEnv('SQS_QUEUE_URL', 'P0_SQS_QUEUE_URL');
  if (queueUrl) {
    try {
      const sqsResp = runAwsJson(region, [
        'sqs',
        'get-queue-attributes',
        '--queue-url',
        queueUrl,
        '--attribute-names',
        'All',
      ]);
      const attrs = sqsResp.Attributes || {};
      pushCheck(checks, 'queue_exists', STATUS.PASS, 'SQS queue reachable.');
      pushCheck(
        checks,
        'queue_dlq_policy',
        attrs.RedrivePolicy ? STATUS.PASS : STATUS.FAIL,
        attrs.RedrivePolicy ? 'RedrivePolicy present.' : 'RedrivePolicy missing.',
      );
      pushCheck(
        checks,
        'queue_encryption',
        attrs.KmsMasterKeyId ? STATUS.PASS : STATUS.WARN,
        attrs.KmsMasterKeyId ? 'Queue KMS key configured.' : 'Queue KMS key missing.',
      );
      pushCheck(
        checks,
        'queue_visibility_timeout',
        toInt(attrs.VisibilityTimeout, 0) >= 30 ? STATUS.PASS : STATUS.WARN,
        `VisibilityTimeout=${attrs.VisibilityTimeout || 'unset'}`,
      );
    } catch (error) {
      pushCheck(checks, 'queue_exists', STATUS.FAIL, `SQS audit failed: ${error.message || String(error)}`);
    }
  } else {
    pushCheck(checks, 'queue_declared', STATUS.FAIL, 'Missing SQS_QUEUE_URL env.');
  }

  const bucket = readEnv('S3_BUCKET_NAME', 'P0_S3_BUCKET_NAME');
  if (bucket) {
    try {
      const verResp = runAwsJson(region, ['s3api', 'get-bucket-versioning', '--bucket', bucket]);
      const encResp = runAwsJson(region, ['s3api', 'get-bucket-encryption', '--bucket', bucket]);
      pushCheck(checks, 'object_store_exists', STATUS.PASS, `S3 bucket reachable: ${bucket}`);
      pushCheck(
        checks,
        'object_store_versioning',
        verResp.Status === 'Enabled' ? STATUS.PASS : STATUS.WARN,
        `Versioning=${verResp.Status || 'Disabled'}`,
      );
      pushCheck(
        checks,
        'object_store_encryption',
        Array.isArray(encResp.ServerSideEncryptionConfiguration?.Rules)
          && encResp.ServerSideEncryptionConfiguration.Rules.length > 0
          ? STATUS.PASS
          : STATUS.FAIL,
        'S3 default encryption policy check.',
      );
    } catch (error) {
      pushCheck(checks, 'object_store_exists', STATUS.FAIL, `S3 audit failed: ${error.message || String(error)}`);
    }
  } else {
    pushCheck(checks, 'object_store_declared', STATUS.FAIL, 'Missing S3_BUCKET_NAME env.');
  }

  const cdnDistributionId = readEnv('CLOUDFRONT_DISTRIBUTION_ID', 'P0_CLOUDFRONT_DISTRIBUTION_ID');
  if (cdnDistributionId) {
    try {
      const cdnResp = runAwsJson(region, [
        'cloudfront',
        'get-distribution',
        '--id',
        cdnDistributionId,
      ]);
      const distribution = cdnResp.Distribution;
      pushCheck(
        checks,
        'cdn_distribution_enabled',
        distribution?.DistributionConfig?.Enabled ? STATUS.PASS : STATUS.FAIL,
        `CloudFront enabled=${Boolean(distribution?.DistributionConfig?.Enabled)}`,
      );
    } catch (error) {
      pushCheck(checks, 'cdn_distribution_enabled', STATUS.FAIL, `CloudFront audit failed: ${error.message || String(error)}`);
    }
  } else {
    pushCheck(checks, 'cdn_distribution_declared', STATUS.FAIL, 'Missing CLOUDFRONT_DISTRIBUTION_ID env.');
  }
}

function runDocsChecks(checks) {
  const topologyDocPath = 'guidelines/p0-9-target-topology-10k-15k.md';
  if (!existsSync(topologyDocPath)) {
    pushCheck(checks, 'autoscaling_doc_exists', STATUS.FAIL, `Missing ${topologyDocPath}`);
    return;
  }

  const content = readFileSync(topologyDocPath, 'utf8');
  pushCheck(checks, 'autoscaling_doc_exists', STATUS.PASS, `${topologyDocPath} present.`);
  pushCheck(
    checks,
    'autoscaling_doc_keywords',
    /autoscaling/i.test(content) && /min/i.test(content) && /max/i.test(content)
      ? STATUS.PASS
      : STATUS.FAIL,
    'Autoscaling matrix keywords check.',
  );
  pushCheck(
    checks,
    'backup_pitr_doc_keywords',
    /PITR/i.test(content) && /backup/i.test(content)
      ? STATUS.PASS
      : STATUS.FAIL,
    'Backup/PITR documentation keywords check.',
  );
}

async function main() {
  const checks = [];
  const boundaries = runTopologyBoundaryChecks(checks);

  await runHttpCheck(checks, 'www_root_http', boundaries.wwwBase, [200, 301, 302, 308]);
  await runHttpCheck(checks, 'exam_health_http', `${boundaries.examApiBase.replace(/\/$/, '')}/api/health`, [200]);
  await runHttpCheck(checks, 'panel_auth_http', `${boundaries.panelApiBase.replace(/\/$/, '')}/api/panel/auth/me`, [200, 401, 403]);
  await runHttpCheck(checks, 'ops_health_http', `${boundaries.opsApiBase.replace(/\/$/, '')}/api/health`, [200]);

  runAwsChecks(checks);
  runDocsChecks(checks);

  const totals = summarize(checks);
  const output = {
    timestamp: new Date().toISOString(),
    mode: {
      http: enableHttpChecks,
      aws: enableAwsChecks,
    },
    totals,
    overall_ready_for_p0_9: totals.fail === 0,
    checks,
  };

  console.log(JSON.stringify(output, null, 2));
  if (totals.fail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[p0-9-topology-audit] failed:', error);
  process.exit(1);
});
