const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

type ApiOptions = RequestInit & { auth?: boolean };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const h = new Headers(headers || {});
  if (!h.has("Content-Type") && rest.body) h.set("Content-Type", "application/json");
  if (!h.has("Accept")) h.set("Accept", "application/json");

  if (auth) {
    const token = getToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: h });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(" ") : null) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export type ApiUser = { id: number; name: string; email: string; avatar?: string | null; is_admin?: boolean };
export type ApiBook = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  category_id?: number;
  total_copies: number;
  available_copies: number;
  availability: string;
  is_featured: boolean;
};
export type ApiBorrowLog = {
  id: number;
  book_id: number;
  status: string;
  return_status: string;
  borrowed_at?: string;
  borrow_date?: string;
  borrow_time?: string;
  returned_at?: string | null;
  return_date?: string;
  return_time?: string;
  book?: {
    id: number;
    title: string;
    image?: string | null;
    category?: string | null;
    availability: string;
  } | null;
};

export async function login(email: string, password: string) {
  return api<{ token: string; user: ApiUser; message: string }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return api<{ token: string; user: ApiUser; message: string }>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logout() {
  return api<{ message: string }>("/logout", { method: "POST", auth: true });
}

export async function forgotPassword(email: string) {
  return api<{ message: string }>("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, password: string, password_confirmation: string) {
  return api<{ message: string }>("/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, password, password_confirmation }),
  });
}

export async function getProfile() {
  return api<{ data: ApiUser }>("/profile", { auth: true });
}

export async function updateProfile(payload: { name?: string; email?: string; avatar?: string | null; password?: string }) {
  return api<{ data: ApiUser; message: string }>("/profile", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function getCategories() {
  return api<{ data: Array<{ id: number; name: string; image?: string | null; books_count?: number }> }>("/categories");
}

export async function getBooks(params?: { search?: string; category?: string }) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.category) q.set("category", params.category);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return api<{ data: ApiBook[] }>(`/books${qs}`);
}

export async function getFeaturedBooks() {
  return api<{ data: ApiBook[] }>("/books/featured");
}

export async function getBorrowLogs() {
  return api<{ data: ApiBorrowLog[] }>("/borrow-logs", { auth: true });
}

export async function borrowBook(bookId: number) {
  return api<{ data: ApiBorrowLog; message: string }>(`/books/${bookId}/borrow`, {
    method: "POST",
    auth: true,
  });
}

export async function returnBook(bookId: number) {
  return api<{ data: ApiBorrowLog; message: string }>(`/books/${bookId}/return`, {
    method: "POST",
    auth: true,
  });
}

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  last_login_at?: string | null;
  borrow_logs_count: number;
  recent_borrows: Array<{
    id: number;
    book_id: number;
    book_title?: string | null;
    status: string;
    borrowed_at?: string | null;
    returned_at?: string | null;
  }>;
};

export type AdminBorrowLog = {
  id: number;
  status: string;
  borrowed_at?: string | null;
  returned_at?: string | null;
  user?: { id: number; name: string; email: string; last_login_at?: string | null } | null;
  book?: { id: number; title: string; category?: string | null; image?: string | null } | null;
};

export async function getAdminUsers() {
  return api<{ data: AdminUser[] }>("/admin/users", { auth: true });
}

export async function getAdminBorrowLogs() {
  return api<{ data: AdminBorrowLog[] }>("/admin/borrow-logs", { auth: true });
}
