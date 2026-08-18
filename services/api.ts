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
    return null;
  } catch (err) {
    console.error('Failed to auto-refresh auth tokens:', err);
    clearTokens();
    return null;
  }
}

async function getOrRefreshToken(): Promise<string | null> {
  const access = getAccessToken();
  if (!access) return null;

  // Simple token decoding check to see if expired
  try {
    const payload = JSON.parse(atob(access.split('.')[1]));
    const exp = payload.exp * 1000;
    // Refresh 30 seconds before actual expiration
    if (Date.now() < exp - 30000) {
      return access;
    }
  } catch {
    // If not a valid JWT, return token anyways, let server validate
  }

  // Token is expired or expiring soon, let's refresh
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch<T = any>(
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
      clearTokens(); // clear stale tokens first
      const newAccess = await performTokenRefresh();
      if (newAccess) {
        mergedHeaders.set('Authorization', `Bearer ${newAccess}`);
        res = await fetch(path, {
          ...restOptions,
          headers: mergedHeaders,
        });
      } else {
        // Refresh failed, force trigger logout/redirect by throwing error
        if (typeof window !== 'undefined') {
          // Dispatch a custom event to tell Zustand to log out
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
  } catch (err: any) {
    console.error(`Fetch error at ${path}:`, err);
    return {
      success: false,
      error: err?.message || 'Network connection failed',
    };
  }
}
