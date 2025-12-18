import { api } from "../lib/api";
import { UserResponse } from "../types/UserResponse";

export type LoginRequest = {
  username: string;
  password: string;
};

export async function login(data: LoginRequest) {
  await api.post<void>("/auth/login", data);
}

export async function logout() {
  await api.post<void>("/auth/logout");
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>("/auth/me");
  return data;
}
