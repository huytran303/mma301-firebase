// App.js — điều hướng theo trạng thái đăng nhập (quản lý session thủ công)
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { refreshSession } from './firebaseRest';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  // Khi mở app: làm mới phiên từ refreshToken đã lưu (nếu có)
  useEffect(() => {
    (async () => {
      try {
        const s = await refreshSession();
        setSession(s);
      } catch (e) {
        setSession(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {session ? (
        <ProfileScreen
          session={session}
          onSession={setSession}
          onSignOut={() => setSession(null)}
        />
      ) : (
        <AuthScreen onSignedIn={setSession} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
