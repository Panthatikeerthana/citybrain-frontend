import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import { apiFetch, removeStoredToken, setStoredToken } from './api';

export class AuthError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const authService = {
  /**
   * Register a new user account with backend Spring Boot.
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        termsAccepted: data.termsAccepted ?? true,
      }),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message = json?.message || 'Registration failed. Please check your information.';
      throw new AuthError(message, response.status, json?.fieldErrors);
    }

    if (json?.token) {
      setStoredToken(json.token);
    }

    return json as AuthResponse;
  },

  /**
   * Authenticate email and password with backend Spring Boot.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message = json?.message || 'Invalid email or password.';
      throw new AuthError(message, response.status, json?.fieldErrors);
    }

    if (json?.token) {
      setStoredToken(json.token);
    }

    return json as AuthResponse;
  },

  /**
   * Fetch authenticated user details using current Bearer token.
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiFetch('/auth/me', {
      method: 'GET',
    });

    if (!response.ok) {
      removeStoredToken();
      throw new AuthError('Session expired or unauthorized.', response.status);
    }

    const user = await response.json();
    return user as User;
  },

  /**
   * Logout user from session and clear local session storage.
   */
  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      removeStoredToken();
    }
  },
};
