export async function request(path, options = {}) {
  const multipart = options.body instanceof FormData;
  const response = await fetch(path, {
    ...options,
    headers: { ...(!multipart && options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    body: options.body && !multipart ? JSON.stringify(options.body) : options.body,
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "Permintaan gagal. Silakan coba lagi.");
    error.status = response.status;
    throw error;
  }
  return result;
}