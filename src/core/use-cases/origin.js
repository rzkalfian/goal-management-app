export function isSameOrigin(request, configuredUrl) {
  try {
    const expected = new URL(configuredUrl || request.url);
    if (!configuredUrl && request.headers.get("host")) expected.host = request.headers.get("host");
    return request.headers.get("origin") === expected.origin;
  } catch { return false; }
}