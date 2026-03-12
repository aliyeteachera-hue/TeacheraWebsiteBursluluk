import { execFileSync, spawnSync } from 'node:child_process';

function trim(value) {
  return String(value || '').trim();
}

function readEnv(name, fallback = '') {
  return trim(process.env[name] || fallback);
}

function tryExecJson(cmd, args) {
  try {
    const out = execFileSync(cmd, [...args, '--output', 'json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function pickByKeyword(values, keyword = 'teachera') {
  if (!Array.isArray(values) || values.length === 0) return '';
  const lowered = keyword.toLowerCase();
  const preferred = values.find((item) => String(item || '').toLowerCase().includes(lowered));
  return trim(preferred || values[0] || '');
}

function ensureHttpBase(urlOrHost, fallback) {
  const raw = trim(urlOrHost);
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, '');
  return `https://${raw.replace(/\/$/, '')}`;
}

function main() {
  const region = readEnv('AWS_REGION', readEnv('AWS_DEFAULT_REGION', 'eu-north-1'));
  const envPatch = {
    AWS_REGION: region,
    AWS_DEFAULT_REGION: region,
  };

  const wwwBase = ensureHttpBase(readEnv('WWW_BASE_URL', readEnv('VITE_SITE_URL', 'https://teachera.com.tr')), 'https://teachera.com.tr');
  envPatch.WWW_BASE_URL = wwwBase;
  envPatch.EXAM_API_BASE_URL = ensureHttpBase(readEnv('EXAM_API_BASE_URL', 'https://exam-api.teachera.com.tr'), 'https://exam-api.teachera.com.tr');
  envPatch.PANEL_API_BASE_URL = ensureHttpBase(readEnv('PANEL_API_BASE_URL', 'https://panel-api.teachera.com.tr'), 'https://panel-api.teachera.com.tr');
  envPatch.OPS_API_BASE_URL = ensureHttpBase(readEnv('OPS_API_BASE_URL', 'https://ops-api.teachera.com.tr'), 'https://ops-api.teachera.com.tr');

  if (!readEnv('AURORA_CLUSTER_ID') && !readEnv('RDS_INSTANCE_ID')) {
    const clusterResp = tryExecJson('aws', ['rds', 'describe-db-clusters', '--region', region]);
    const clusterIds = (clusterResp?.DBClusters || [])
      .map((item) => trim(item?.DBClusterIdentifier))
      .filter(Boolean);
    if (clusterIds.length > 0) {
      envPatch.AURORA_CLUSTER_ID = pickByKeyword(clusterIds);
    } else {
      const instancesResp = tryExecJson('aws', ['rds', 'describe-db-instances', '--region', region]);
      const instanceIds = (instancesResp?.DBInstances || [])
        .filter((item) => {
          const engine = trim(item?.Engine).toLowerCase();
          return engine.includes('postgres');
        })
        .map((item) => trim(item?.DBInstanceIdentifier))
        .filter(Boolean);
      if (instanceIds.length > 0) {
        envPatch.RDS_INSTANCE_ID = pickByKeyword(instanceIds);
      }
    }
  }

  if (!readEnv('ELASTICACHE_REPLICATION_GROUP_ID')) {
    const redisResp = tryExecJson('aws', ['elasticache', 'describe-replication-groups', '--region', region]);
    const groups = (redisResp?.ReplicationGroups || [])
      .map((item) => trim(item?.ReplicationGroupId))
      .filter(Boolean);
    if (groups.length > 0) {
      envPatch.ELASTICACHE_REPLICATION_GROUP_ID = pickByKeyword(groups);
    }
  }

  if (!readEnv('SQS_QUEUE_URL')) {
    const sqsResp = tryExecJson('aws', ['sqs', 'list-queues', '--region', region]);
    const queueUrls = (sqsResp?.QueueUrls || []).map((item) => trim(item)).filter(Boolean);
    if (queueUrls.length > 0) {
      envPatch.SQS_QUEUE_URL = pickByKeyword(queueUrls);
    }
  }

  if (!readEnv('S3_BUCKET_NAME')) {
    const s3Resp = tryExecJson('aws', ['s3api', 'list-buckets', '--region', region]);
    const bucketNames = (s3Resp?.Buckets || [])
      .map((item) => trim(item?.Name))
      .filter(Boolean);
    if (bucketNames.length > 0) {
      envPatch.S3_BUCKET_NAME = pickByKeyword(bucketNames);
    }
  }

  if (!readEnv('CLOUDFRONT_DISTRIBUTION_ID')) {
    const cfResp = tryExecJson('aws', ['cloudfront', 'list-distributions']);
    const distributions = (cfResp?.DistributionList?.Items || []);
    const withAlias = distributions
      .map((item) => ({
        id: trim(item?.Id),
        aliases: (item?.Aliases?.Items || []).map((alias) => trim(alias)).filter(Boolean),
      }))
      .filter((item) => item.id);
    const teacheraMatch = withAlias.find((item) =>
      item.aliases.some((alias) => alias.includes('teachera.com.tr')),
    );
    const picked = teacheraMatch?.id || withAlias[0]?.id || '';
    if (picked) {
      envPatch.CLOUDFRONT_DISTRIBUTION_ID = picked;
    }
  }

  const mergedEnv = {
    ...process.env,
    ...envPatch,
  };

  console.log('[p0-9-autodiscover] Using environment:');
  console.log(
    JSON.stringify(
      {
        AWS_REGION: mergedEnv.AWS_REGION,
        WWW_BASE_URL: mergedEnv.WWW_BASE_URL,
        EXAM_API_BASE_URL: mergedEnv.EXAM_API_BASE_URL,
        PANEL_API_BASE_URL: mergedEnv.PANEL_API_BASE_URL,
        OPS_API_BASE_URL: mergedEnv.OPS_API_BASE_URL,
        AURORA_CLUSTER_ID: trim(mergedEnv.AURORA_CLUSTER_ID || ''),
        RDS_INSTANCE_ID: trim(mergedEnv.RDS_INSTANCE_ID || ''),
        ELASTICACHE_REPLICATION_GROUP_ID: trim(mergedEnv.ELASTICACHE_REPLICATION_GROUP_ID || ''),
        SQS_QUEUE_URL: trim(mergedEnv.SQS_QUEUE_URL || ''),
        S3_BUCKET_NAME: trim(mergedEnv.S3_BUCKET_NAME || ''),
        CLOUDFRONT_DISTRIBUTION_ID: trim(mergedEnv.CLOUDFRONT_DISTRIBUTION_ID || ''),
      },
      null,
      2,
    ),
  );

  const result = spawnSync(
    process.execPath,
    ['scripts/p0-9-topology-audit.mjs', '--http', '--aws'],
    {
      env: mergedEnv,
      stdio: 'inherit',
    },
  );

  process.exit(result.status || 0);
}

main();
