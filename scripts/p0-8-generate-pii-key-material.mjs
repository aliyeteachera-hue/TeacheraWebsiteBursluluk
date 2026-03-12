import { randomBytes } from 'node:crypto';
import { GenerateDataKeyCommand, KMSClient } from '@aws-sdk/client-kms';

function read(name) {
  return String(process.env[name] || '').trim();
}

async function main() {
  const region = read('PII_KMS_REGION') || read('AWS_REGION') || read('AWS_DEFAULT_REGION');
  const keyId = read('PII_KMS_KEY_ID');
  if (!region || !keyId) {
    console.error('Missing PII_KMS_REGION/AWS_REGION or PII_KMS_KEY_ID');
    process.exit(1);
  }

  const kms = new KMSClient({ region });
  const envContext = read('PII_KMS_ENV_CONTEXT') || read('VERCEL_ENV') || read('NODE_ENV') || 'production';
  const output = await kms.send(
    new GenerateDataKeyCommand({
      KeyId: keyId,
      KeySpec: 'AES_256',
      EncryptionContext: {
        app: 'teachera',
        scope: 'pii',
        env: envContext,
      },
    }),
  );

  const encryptedDataKey = Buffer.from(output.CiphertextBlob || []).toString('base64');
  const lookupHmacKey = randomBytes(32).toString('base64url');

  console.log('PII_KMS_ENCRYPTED_DATA_KEY_B64=' + encryptedDataKey);
  console.log('PII_LOOKUP_HMAC_KEY=' + lookupHmacKey);
}

main().catch((error) => {
  console.error('[p0-8-generate-pii-key-material] failed', error);
  process.exit(1);
});
