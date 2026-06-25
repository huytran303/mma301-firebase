// screens/AuthScreen.js — Màn hình Đăng nhập / Đăng ký
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        // Lưu thông tin mở rộng vào Firestore
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      Alert.alert('Lỗi', mapError(e.code) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>🔥 Firebase App</Text>
        <Text style={styles.title}>{isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ"
              value={address}
              onChangeText={setAddress}
            />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switch}>
            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function mapError(code) {
  const m = {
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/email-already-in-use': 'Email đã được sử dụng.',
    'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự).',
    'auth/invalid-credential': 'Sai email hoặc mật khẩu.',
    'auth/user-not-found': 'Không tìm thấy tài khoản.',
    'auth/wrong-password': 'Sai mật khẩu.',
  };
  return m[code];
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 34, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#111' },
  input: {
    borderWidth: 1, borderColor: '#d0d5dd', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 15,
  },
  button: {
    backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switch: { color: '#2563EB', textAlign: 'center', marginTop: 18, fontSize: 14 },
});
