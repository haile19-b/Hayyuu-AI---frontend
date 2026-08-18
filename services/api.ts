interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

// Helpers to get/set tokens safely on the client side
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hayyuu_access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hayyuu_refresh_token');
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hayyuu_access_token', access);
  localStorage.setItem('hayyuu_refresh_token', refresh);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hayyuu_access_token');
  localStorage.removeItem('hayyuu_refresh_token');
}

async function performTokenRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
      throw new Error('Refresh token invalid or expired');
    }

    const data = await res.json();
    if (data.success && data.response?.accessToken && data.response?.refreshToken) {
      setTokens(data.response.accessToken, data.response.refreshToken);
      return data.response.accessToken;
    }
    clearTokens();
    return null;
  } catch (err) {
    console.error('Failed to auto-refresh auth tokens:', err);
    clearTokens();
    return null;
  }
}

export async function getOrRefreshToken(): Promise<string | null> {
  const access = getAccessToken();
  const refresh = getRefreshToken();

  // If no refresh token, we cannot do anything
  if (!refresh) {
    return null;
  }

  // If we have an access token, check if it's still valid
  if (access) {
    try {
      const payload = JSON.parse(atob(access.split('.')[1]));
      const exp = payload.exp * 1000;
      // Refresh 30 seconds before actual expiration
      if (Date.now() < exp - 30000) {
        return access;
      }
    } catch {
      // If access token is malformed, try to refresh using the refresh token
    }
  }

  // Access token is missing, expired, or invalid. Request a refresh.
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<{ success: boolean; response?: T; message?: string; error?: string }> {
  const { skipAuth, headers, ...restOptions } = options;
  const mergedHeaders = new Headers(headers);

  if (!mergedHeaders.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    mergedHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = await getOrRefreshToken();
    if (token) {
      mergedHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    let res = await fetch(path, {
      ...restOptions,
      headers: mergedHeaders,
    });

    // Check if unauthorized, try one last refresh if not skipped
    if (res.status === 401 && !skipAuth) {
      if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccess = await refreshPromise;
      if (newAccess) {
        mergedHeaders.set('Authorization', `Bearer ${newAccess}`);
        res = await fetch(path, {
          ...restOptions,
          headers: mergedHeaders,
        });

        // If retried request also returns 401, clear tokens and trigger logout
        if (res.status === 401) {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('hayyuu-unauthorized'));
          }
        }
      } else {
        // Refresh failed, force trigger logout/redirect
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('hayyuu-unauthorized'));
        }
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      try {
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          error: errorJson.error || errorJson.message || `API request failed with HTTP ${res.status}`,
        };
      } catch {
        return {
          success: false,
          error: errorText || `API request failed with HTTP ${res.status}`,
        };
      }
    }

    return await res.json();
  } catch (err: unknown) {
    console.error(`Fetch error at ${path}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'Network connection failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
