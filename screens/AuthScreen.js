// screens/AuthScreen.js — Đăng nhập / Đăng ký (Firebase REST API)
import React, { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { signIn, signUp, setUserDoc } from '../firebaseRest';

export default function AuthScreen({ onSignedIn }) {
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
        const session = await signIn(email.trim(), password);
        onSignedIn(session);
      } else {
        const session = await signUp(email.trim(), password);
        // Lưu thông tin mở rộng vào Firestore
        await setUserDoc(session.idToken, session.localId, {
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        });
        onSignedIn(session);
      }
    } catch (e) {
      Alert.alert('Lỗi', mapError(e.message));
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

        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none"
          keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          secureTextEntry value={password} onChangeText={setPassword} />

        {!isLogin && (
          <>
            <TextInput style={styles.input} placeholder="Số điện thoại"
              keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Địa chỉ"
              value={address} onChangeText={setAddress} />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" />
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

function mapError(msg = '') {
  if (msg.includes('EMAIL_EXISTS')) return 'Email đã được sử dụng.';
  if (msg.includes('INVALID_LOGIN_CREDENTIALS') || msg.includes('INVALID_PASSWORD') || msg.includes('EMAIL_NOT_FOUND'))
    return 'Sai email hoặc mật khẩu.';
  if (msg.includes('WEAK_PASSWORD')) return 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
  if (msg.includes('INVALID_EMAIL')) return 'Email không hợp lệ.';
  if (msg.includes('MISSING_PASSWORD')) return 'Vui lòng nhập mật khẩu.';
  return msg || 'Có lỗi xảy ra.';
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
