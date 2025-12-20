import { api } from "../lib/api";
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

  const token = response.accessToken;

  // ✅ Salva no cookie
  Cookies.set(COOKIE_NAME, token, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // ✅ SETA O AUTHORIZATION GLOBAL
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
