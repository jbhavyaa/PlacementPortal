import { User } from "@shared/schema";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
