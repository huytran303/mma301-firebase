// firebaseRest.js
// Lớp gọi Firebase qua REST API (không cần package "firebase").
//  - Authentication: Identity Toolkit REST API
//  - Firestore: Firestore REST API
// Phiên đăng nhập (idToken/refreshToken) lưu bằng AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_API_KEY, FIREBASE_PROJECT_ID } from './firebaseConfig';

const AUTH = 'https://identitytoolkit.googleapis.com/v1/accounts';
const SECURE_TOKEN = 'https://securetoken.googleapis.com/v1/token';
const FS = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const SESSION_KEY = 'fb_session';

// ---------- Authentication ----------
async function authPost(action, body) {
  const res = await fetch(`${AUTH}:${action}?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'AUTH_REQUEST_FAILED');
  return data;
}

export async function signUp(email, password) {
  const d = await authPost('signUp', { email, password, returnSecureToken: true });
  await saveSession(d);
  return d;
}

export async function signIn(email, password) {
  const d = await authPost('signInWithPassword', { email, password, returnSecureToken: true });
  await saveSession(d);
  return d;
}

// Cập nhật email và/hoặc mật khẩu. Trả về session mới (có idToken mới).
export async function updateAccount({ idToken, email, password }) {
  const body = { idToken, returnSecureToken: true };
  if (email) body.email = email;
  if (password) body.password = password;
  const d = await authPost('update', body);
  const session = await getSession();
  const merged = {
    ...session,
    idToken: d.idToken || session?.idToken,
    refreshToken: d.refreshToken || session?.refreshToken,
    email: d.email || email || session?.email,
    localId: d.localId || session?.localId,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(merged));
  return merged;
}

// ---------- Quản lý phiên ----------
async function saveSession(d) {
  const session = {
    idToken: d.idToken,
    refreshToken: d.refreshToken,
    localId: d.localId,
    email: d.email,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function getSession() {
  const s = await AsyncStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

export async function signOut() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// Làm mới idToken (idToken hết hạn sau ~1 giờ). Dùng khi mở lại app.
export async function refreshSession() {
  const s = await getSession();
  if (!s?.refreshToken) return null;
  const res = await fetch(`${SECURE_TOKEN}?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${s.refreshToken}`,
  });
  const d = await res.json();
  if (!res.ok) {
    await signOut();
    return null;
  }
  const session = {
    idToken: d.id_token,
    refreshToken: d.refresh_token,
    localId: d.user_id,
    email: s.email,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// ---------- Firestore REST (lưu sđt + địa chỉ) ----------
export async function getUserDoc(idToken, uid) {
  const res = await fetch(`${FS}/users/${uid}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'FIRESTORE_READ_FAILED');
  return fromFields(data.fields);
}

// PATCH có updateMask = merge (không ghi đè field khác)
export async function setUserDoc(idToken, uid, obj) {
  const mask = Object.keys(obj)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');
  const res = await fetch(`${FS}/users/${uid}?${mask}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFields(obj) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'FIRESTORE_WRITE_FAILED');
  return data;
}

function toFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = { stringValue: String(v ?? '') };
  }
  return fields;
}

function fromFields(fields) {
  const o = {};
  if (!fields) return o;
  for (const [k, v] of Object.entries(fields)) {
    o[k] = v.stringValue ?? v.integerValue ?? '';
  }
  return o;
}
