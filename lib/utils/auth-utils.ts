// Token storage key
const TOKEN_KEY = "sql_assistant_auth_token"

// Set JWT token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

// Get JWT token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

// Remove JWT token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// Add token to API request headers
export const addAuthHeader = (headers: HeadersInit = {}): HeadersInit => {
  const token = getAuthToken()
  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return headers
}

// Parse JWT token (simplified version)
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token)
  if (!decoded || !decoded.exp) return true

  // Check if expiration time is past current time
  const currentTime = Date.now() / 1000
  return decoded.exp < currentTime
}
