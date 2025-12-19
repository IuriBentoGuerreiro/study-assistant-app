import { api } from "../lib/api";
import { UserResponse } from "../types/UserResponse";
import Cookies from "js-cookie";

export type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

const COOKIE_NAME = "access_token";

export async function login(data: LoginRequest): Promise<void> {
  const { data: response } = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  Cookies.set("access_token", response.accessToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

}

export function logout(): void {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
}

