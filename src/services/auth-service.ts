import { api } from "../lib/api";
import Cookies from "js-cookie";
import { UserResponse } from "../types/UserResponse";

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

  Cookies.set(COOKIE_NAME, token, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const { data: responseMe } = await api.get<UserResponse>("/auth/me");

  sessionStorage.setItem("userId", String(responseMe.id));
}
