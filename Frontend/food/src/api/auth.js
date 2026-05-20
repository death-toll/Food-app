import axiosInstance from "../services/axiosInstance";
import apiCache from "../services/apiCache";

const BASE = "/api/auth";

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login  { email, password } → { token, tokenType }
 */
export const login = (email, password) =>
    axiosInstance.post(`${BASE}/login`, { email, password }).then((r) => r.data);

// ── Current user ──────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me  (requires Bearer token)
 * → { userId, email, name, role }
 * Cached for 5 seconds to prevent repeated calls
 */
export const getMe = () =>
    // Short cache to avoid repeated /me calls during route changes / StrictMode re-renders.
    apiCache.withCache('auth/me', () => axiosInstance.get(`${BASE}/me`).then((r) => r.data));

// ── Registration (two-step with OTP) ─────────────────────────────────────────

/**
 * POST /api/auth/register
 * { age, name, street, city, state, email, password, role }
 * → { message }  — sends OTP to email
 */
export const register = (payload) =>
    axiosInstance.post(`${BASE}/register`, payload).then((r) => r.data);

/**
 * POST /api/auth/register/verify-otp
 * { email, otp }
 * → { userId, email, name, role }
 */
export const verifyRegistrationOtp = (email, otp) =>
    axiosInstance.post(`${BASE}/register/verify-otp`, { email, otp }).then((r) => r.data);

/**
 * POST /api/auth/register/resend-otp
 * { email }
 * → { message }
 */
export const resendRegistrationOtp = (email) =>
    axiosInstance.post(`${BASE}/register/resend-otp`, { email }).then((r) => r.data);

// ── Forgot / Reset password (three-step with OTP) ────────────────────────────

/**
 * POST /api/auth/forgot-password
 * { email }
 * → { message }  — sends OTP to email
 */
export const forgotPassword = (email) =>
    axiosInstance.post(`${BASE}/forgot-password`, { email }).then((r) => r.data);

/**
 * POST /api/auth/forgot-password/verify-otp
 * { email, otp }
 * → { message }
 */
export const verifyForgotPasswordOtp = (email, otp) =>
    axiosInstance.post(`${BASE}/forgot-password/verify-otp`, { email, otp }).then((r) => r.data);

/**
 * POST /api/auth/reset-password
 * { email, otp, newPassword }
 * → { message }
 */
export const resetPassword = (email, otp, newPassword) =>
    axiosInstance.post(`${BASE}/reset-password`, { email, otp, newPassword }).then((r) => r.data);

