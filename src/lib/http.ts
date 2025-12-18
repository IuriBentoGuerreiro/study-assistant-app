import { api } from "@/src/lib/api";

export async function get<T>(url: string, params?: unknown): Promise<T> {
  const response = await api.get<T>(url, { params });
  return response.data;
}

export async function post<T, B = unknown>(
  url: string,
  body?: B
): Promise<T> {
  const response = await api.post<T>(url, body);
  return response.data;
}

export async function put<T, B = unknown>(
  url: string,
  body?: B
): Promise<T> {
  const response = await api.put<T>(url, body);
  return response.data;
}

export async function patch<T, B = unknown>(
  url: string,
  body?: B
): Promise<T> {
  const response = await api.patch<T>(url, body);
  return response.data;
}

export async function del<T>(url: string): Promise<T> {
  const response = await api.delete<T>(url);
  return response.data;
}
