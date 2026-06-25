// notifications.js
// ----------------------------------------------------------------------------
// PUSH NOTIFICATION (FCM thông qua expo-notifications)
//
// LƯU Ý QUAN TRỌNG về Snack / Expo Go:
//  - Local notification (đặt lịch hiện thông báo): CHẠY ĐƯỢC ngay trên điện thoại.
//  - Remote push thật (server gửi xuống qua FCM): chỉ hoạt động đầy đủ khi
//    bạn EAS build app riêng. Trên Expo Go (SDK 53+) remote push bị giới hạn.
//    Trên web token push sẽ không lấy được.
// ----------------------------------------------------------------------------

import { Platform } from 'react-native';
import * as Device from 'expo-device';
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

// Xin quyền + lấy Expo Push Token (token này dùng để server gửi push tới máy)
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }

  if (!Device.isDevice) {
    return { token: null, error: 'Cần chạy trên thiết bị thật để nhận push.' };
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

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return { token: tokenData.data, error: null };
  } catch (e) {
    // Trên Expo Go/Snack thường rơi vào đây vì cần projectId của bản build.
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
