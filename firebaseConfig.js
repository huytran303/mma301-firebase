// firebaseConfig.js
// ----------------------------------------------------------------------------
// CẤU HÌNH FIREBASE
// 1. Vào https://console.firebase.google.com -> tạo project
// 2. Thêm 1 "Web App" (biểu tượng </>) -> copy đoạn firebaseConfig dán vào đây
// 3. Vào Authentication -> Sign-in method -> bật "Email/Password"
// 4. Vào Firestore Database -> Create database (chế độ test cho lúc học)
// ----------------------------------------------------------------------------

import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 👇 CONFIG (suy ra từ google-services.json của project fir-mma-ac196)
// Lưu ý: appId hiện là Android ID. Để chuẩn nhất cho Web SDK, vào Firebase Console
// -> Project settings -> mục "Your apps" -> Add app (Web </>) để lấy appId dạng
// "1:77983149618:web:...". Auth + Firestore vẫn hoạt động với cấu hình hiện tại.
const firebaseConfig = {
  apiKey: 'AIzaSyCftd2Jg2STvbRh4dYWnIqJZjnQ0NmRSDs',
  authDomain: 'fir-mma-ac196.firebaseapp.com',
  projectId: 'fir-mma-ac196',
  storageBucket: 'fir-mma-ac196.firebasestorage.app',
  messagingSenderId: '77983149618',
  appId: '1:77983149618:android:c19c607daf2fca44c1962b',
};

const app = initializeApp(firebaseConfig);

// Auth có lưu phiên đăng nhập (persistence) bằng AsyncStorage.
// Trong môi trường React Native (Snack/Expo) getReactNativePersistence tồn tại;
// bọc try/catch để fallback an toàn nếu chạy ở môi trường không hỗ trợ.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // initializeAuth đã được gọi trước đó hoặc môi trường không có RN persistence
  _auth = getAuth(app);
}
export const auth = _auth;

// Firestore để lưu thông tin mở rộng của người dùng (sđt, địa chỉ...)
export const db = getFirestore(app);

export default app;
