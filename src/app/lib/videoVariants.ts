interface VideoVariantAvailability {
  mobileWebm: boolean;
  mobileMp4: boolean;
}

const availabilityCache = new Map<string, Promise<VideoVariantAvailability>>();

async function assetExists(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function detectMobileVideoVariants(baseName: string) {
  const cached = availabilityCache.get(baseName);
  if (cached) return cached;

  const checkPromise = (async () => {
    const [mobileWebm, mobileMp4] = await Promise.all([
      assetExists(`/video/${baseName}-mobile.webm`),
      assetExists(`/video/${baseName}-mobile.mp4`),
    ]);

    return { mobileWebm, mobileMp4 };
  })();

  availabilityCache.set(baseName, checkPromise);
  return checkPromise;
}
