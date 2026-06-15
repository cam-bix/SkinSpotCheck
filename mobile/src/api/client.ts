const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:8000';

export type ScanResult = {
  id: number;
  result: 'Low concern' | 'Medium concern' | 'High concern' | 'Unable to analyze';
  confidence: number | null;
  disclaimer: string;
  model_version: string;
  created_at: string;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const body = await response.json();
      message = body.detail ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function register(email: string, password: string): Promise<string> {
  await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return login(email, password);
}

export async function login(email: string, password: string): Promise<string> {
  const token = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return token.access_token;
}

export async function scanImage(
  token: string,
  uri: string,
  fileName: string,
  mimeType: string,
): Promise<ScanResult> {
  const form = new FormData();
  form.append('image', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  return request<ScanResult>('/scan', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
}

export async function getScanHistory(token: string): Promise<ScanResult[]> {
  return request<ScanResult[]>('/scan/history', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
