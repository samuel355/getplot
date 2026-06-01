export async function clearCacheApi(key, usePattern = false) {
  try {
    await fetch('/api/cache/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, usePattern }),
    });
  } catch (e) {
    // best-effort; don't fail primary flow
    console.warn('clearCacheApi failed', e);
  }
}
