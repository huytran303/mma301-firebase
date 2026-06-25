// notifications.js
// PUSH NOTIFICATION (FCM thông qua expo-notifications)
//
// LƯU Ý về Snack / Expo Go:
//  - Local notification (nút "Gửi thông báo thử"): CHẠY ĐƯỢC ngay trên điện thoại.
//  - Remote push thật (server gửi qua FCM): chỉ hoạt động đầy đủ khi EAS build app
//    riêng. Trên Expo Go (SDK 53+) / web token push bị giới hạn.

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Khi app đang mở mà có thông báo -> vẫn hiển thị banner + âm thanh
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Xin quyền + lấy Expo Push Token (server dùng token này để gửi push tới máy)
export async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return { token: null, error: 'Người dùng từ chối quyền thông báo.' };
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return { token: tokenData.data, error: null };
  } catch (e) {
    // Trên Expo Go/Snack thường rơi vào đây (cần EAS build để lấy token thật).
    return { token: null, error: 'Không lấy được push token (cần EAS build): ' + e.message };
  }
}

// Gửi 1 local notification ngay để DEMO (chạy được cả trên Expo Go/Snack)
export async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { seconds: 2 },
  });
}
