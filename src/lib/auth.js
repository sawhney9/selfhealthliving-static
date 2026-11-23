// Sign-in for the website, mirroring the SelfHealth app (SupabaseService.swift):
// email + password, Google, Apple, password reset, and the TOTP second factor
// for people who turned on 2FA in the app.
import { supabase } from './supabaseClient.js';

export const APPLE_ENABLED = import.meta.env.PUBLIC_APPLE_WEB_SIGNIN === 'true';

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Calls back with the session now and on every change; returns an unsubscribe. */
export function watchSession(callback) {
  getSession().then(callback);
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

/** Only allow same-site paths as a post-login destination. */
export function safeNext(next, fallback = '/account/') {
  return typeof next === 'string' && /^\/(?!\/)/.test(next) ? next : fallback;
}

export function loginUrl(next = location.pathname) {
  return `/login/?next=${encodeURIComponent(next)}`;
}

export async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** Returns true when the account is ready, false when email confirmation is pending. */
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { full_name: name } : undefined,
      emailRedirectTo: `${location.origin}/account/`,
    },
  });
  if (error) throw error;
  return Boolean(data.session);
}

export async function signInWithProvider(provider, next) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${location.origin}/login/?next=${encodeURIComponent(safeNext(next))}` },
  });
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/account/reset/`,
  });
  if (error) throw error;
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** True when the user has 2FA on and this session hasn't passed it yet. */
export async function needsSecondFactor() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return false;
  return data.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
}

export async function verifySecondFactor(code) {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  const factor = data.totp.find((f) => f.status === 'verified');
  if (!factor) throw new Error('No authenticator app is set up for this account.');
  const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (verifyError) throw verifyError;
}

/** Friendly text for the errors people actually hit. */
export function authMessage(error) {
  const msg = error?.message || '';
  if (/invalid login credentials/i.test(msg)) return 'That email and password don’t match. Try again or reset your password.';
  if (/already registered/i.test(msg)) return 'An account with this email already exists. Sign in instead.';
  if (/password should be/i.test(msg)) return msg;
  if (/email not confirmed/i.test(msg)) return 'Confirm your email first. Check your inbox for the link.';
  if (/invalid totp|invalid code|expired/i.test(msg)) return 'That code didn’t work. Enter the current 6-digit code.';
  if (/rate limit/i.test(msg)) return 'Too many attempts. Wait a minute and try again.';
  return msg || 'Something went wrong. Try again.';
}
