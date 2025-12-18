import { cookies } from "next/headers";
import { api } from "../lib/api";
import { UserResponse } from "../types/UserResponse";
import { NextResponse } from "next/server";

export type LoginRequest = {
  username: string;
  password: string;
};

export async function login(data: LoginRequest) {
    const response = NextResponse.json({ ok: true });

    response.cookies.set("next_test", "funcionou", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  
  await api.post<void>("/auth/login", data);
}

export async function logout() {
  await api.post<void>("/auth/logout");
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>("/auth/me");
 
      const response = NextResponse.json({ ok: true });

    response.cookies.set("next_test", "funcionou", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return data;
}
