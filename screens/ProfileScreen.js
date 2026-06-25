// screens/ProfileScreen.js — Quản lý & cập nhật thông tin người dùng (REST API)
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import {
  updateAccount, getUserDoc, setUserDoc, signOut,
} from '../firebaseRest';
import {
  registerForPushNotificationsAsync, sendLocalNotification,
} from '../notifications';

export default function ProfileScreen({ session, onSession, onSignOut }) {
  const uid = session.localId;

  const [email, setEmail] = useState(session.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState(null);

  // Tải thông tin Firestore (sđt, địa chỉ)
  useEffect(() => {
    (async () => {
      try {
        const d = await getUserDoc(session.idToken, uid);
        if (d) {
          setPhone(d.phone || '');
          setAddress(d.address || '');
          if (d.email) setEmail(d.email);
        }
      } catch (e) {
        console.log('load profile error', e.message);
      }
    })();
  }, [session.idToken, uid]);

  // Đăng ký nhận push notification
  useEffect(() => {
    (async () => {
      const { token, error } = await registerForPushNotificationsAsync();
      setPushToken(token || error);
    })();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      let current = session;

      // 1. Cập nhật email / mật khẩu qua Auth REST (nếu có thay đổi)
      const emailChanged = email.trim() && email.trim() !== session.email;
      if (emailChanged || newPassword) {
        if (newPassword && newPassword.length < 6) {
          throw new Error('WEAK_PASSWORD');
        }
        current = await updateAccount({
          idToken: session.idToken,
          email: emailChanged ? email.trim() : undefined,
          password: newPassword || undefined,
        });
        onSession(current); // cập nhật idToken mới lên App
      }

      // 2. Cập nhật sđt + địa chỉ vào Firestore
      await setUserDoc(current.idToken, uid, {
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      setNewPassword('');
      Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng.');
    } catch (e) {
      Alert.alert('Lỗi', mapError(e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Thông tin người dùng</Text>
      <Text style={styles.uid}>UID: {uid}</Text>

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
          onPress={async () => {
            try {
              await sendLocalNotification('Xin chào 👋', 'Đây là thông báo demo từ app!');
            } catch (e) {
              Alert.alert('Không gửi được thông báo', e.message);
            }
          }}
        >
          <Text style={styles.buttonText}>Gửi thông báo thử</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#dc2626', marginTop: 20 }]}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function mapError(msg = '') {
  if (msg.includes('WEAK_PASSWORD')) return 'Mật khẩu mới tối thiểu 6 ký tự.';
  if (msg.includes('EMAIL_EXISTS')) return 'Email mới đã được dùng bởi tài khoản khác.';
  if (msg.includes('INVALID_EMAIL')) return 'Email không hợp lệ.';
  if (msg.includes('TOKEN_EXPIRED') || msg.includes('CREDENTIAL_TOO_OLD') || msg.includes('INVALID_ID_TOKEN'))
    return 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.';
  if (msg.includes('PERMISSION_DENIED'))
    return 'Firestore từ chối ghi — kiểm tra Security Rules.';
  return msg || 'Có lỗi xảy ra.';
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
