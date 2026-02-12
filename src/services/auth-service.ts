import { api } from "../lib/api";
import Cookies from "js-cookie";
import { UserResponse } from "../types/UserResponse";

export type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

const COOKIE_ACCESS_TOKEN = "access_token";
const COOKIE_REFRESH_TOKEN = "refresh_token";

export async function login(data: LoginRequest): Promise<void> {
  const { data: response } = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  const token = response.accessToken;

  Cookies.set(COOKIE_ACCESS_TOKEN, token, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const refreshToken = response.refreshToken;

  Cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
