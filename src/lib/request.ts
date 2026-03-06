export async function makeRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options)
  const body = await res.text()

  if (!res.ok) {
    let message = `Request failed: ${res.status}`

    try {
      const json = JSON.parse(body) as { error?: string; message?: string }
      message =
        json.error?.trim() || json.message?.trim() || message
    } catch {
      if (body.trim()) {
        message = `${message} ${body.trim().slice(0, 120)}`
      }
    }

    throw new Error(message)
  }

  try {
    return JSON.parse(body) as T
  } catch {
    throw new Error(`Invalid JSON response from ${url}`)
  }
}
