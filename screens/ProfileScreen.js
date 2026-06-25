// screens/ProfileScreen.js — Quản lý & cập nhật thông tin người dùng
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import {
  signOut, updateEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import {
  registerForPushNotificationsAsync, sendLocalNotification,
} from '../notifications';

export default function ProfileScreen() {
  const user = auth.currentUser;

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState(null);

  // Tải thông tin Firestore
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setPhone(d.phone || '');
          setAddress(d.address || '');
        }
      } catch (e) {
        console.log('load profile error', e);
      }
    })();
  }, []);

  // Đăng ký nhận push notification
  useEffect(() => {
    (async () => {
      const { token, error } = await registerForPushNotificationsAsync();
      if (token) setPushToken(token);
      else setPushToken(error);
    })();
  }, []);

  // Đăng nhập lại (bắt buộc trước khi đổi email/mật khẩu nhạy cảm)
  const reauth = async () => {
    if (!currentPassword) throw new Error('Nhập mật khẩu hiện tại để xác thực lại.');
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Cập nhật email (nếu đổi) — cần reauth
      if (email.trim() && email.trim() !== user.email) {
        await reauth();
        await updateEmail(user, email.trim());
      }
      // 2. Cập nhật mật khẩu (nếu nhập) — cần reauth
      if (newPassword) {
        if (newPassword.length < 6) throw new Error('Mật khẩu mới tối thiểu 6 ký tự.');
        await reauth();
        await updatePassword(user, newPassword);
      }
      // 3. Cập nhật sđt + địa chỉ vào Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        { email: email.trim(), phone: phone.trim(), address: address.trim() },
        { merge: true }
      );

      setNewPassword('');
      setCurrentPassword('');
      Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng.');
    } catch (e) {
      Alert.alert('Lỗi', mapError(e.code) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Thông tin người dùng</Text>
      <Text style={styles.uid}>UID: {user?.uid}</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone}
        keyboardType="phone-pad" placeholder="Nhập số điện thoại" />

      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress}
        placeholder="Nhập địa chỉ" />

      <Text style={styles.label}>Mật khẩu mới (để trống nếu không đổi)</Text>
      <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword}
        secureTextEntry placeholder="Mật khẩu mới" />

      <Text style={styles.label}>Mật khẩu hiện tại (bắt buộc khi đổi email/mật khẩu)</Text>
      <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword}
        secureTextEntry placeholder="Mật khẩu hiện tại" />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Lưu thay đổi</Text>}
      </TouchableOpacity>

      {/* ----- Khu vực Push Notification ----- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Push Notification (FCM)</Text>
        <Text style={styles.token} numberOfLines={3}>
          {pushToken ? String(pushToken) : 'Đang lấy token...'}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#059669', marginTop: 10 }]}
          onPress={() => sendLocalNotification('Xin chào 👋', 'Đây là thông báo demo từ app!')}
        >
          <Text style={styles.buttonText}>Gửi thông báo thử</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#dc2626', marginTop: 20 }]}
        onPress={() => signOut(auth)}
      >
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function mapError(code) {
  const m = {
    'auth/requires-recent-login': 'Cần đăng nhập lại — hãy nhập đúng mật khẩu hiện tại.',
    'auth/wrong-password': 'Mật khẩu hiện tại không đúng.',
    'auth/invalid-credential': 'Mật khẩu hiện tại không đúng.',
    'auth/email-already-in-use': 'Email mới đã được dùng bởi tài khoản khác.',
    'auth/invalid-email': 'Email không hợp lệ.',
  };
  return m[code];
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: '800', color: '#111' },
  uid: { fontSize: 11, color: '#888', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#d0d5dd', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15,
  },
  button: {
    backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10,
    alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: {
    marginTop: 24, padding: 16, borderRadius: 12,
    backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0369a1', marginBottom: 8 },
  token: { fontSize: 11, color: '#475569' },
});
