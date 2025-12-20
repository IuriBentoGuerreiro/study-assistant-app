import { api } from "./api";

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}
    