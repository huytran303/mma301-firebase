# Firebase App (Expo + Snack)

Ứng dụng React Native (Expo) dùng **Firebase** để:

1. **Đăng nhập + quản lý người dùng** — đăng nhập/đăng ký bằng Firebase Authentication (Email/Password). Người dùng có thể cập nhật: **email, số điện thoại, mật khẩu, địa chỉ**.
2. **Push Notification (FCM)** qua `expo-notifications`.

## Cấu trúc

```
App.js                 # Theo dõi trạng thái đăng nhập, điều hướng
firebaseConfig.js      # Khởi tạo Firebase (Auth + Firestore)  -> ĐIỀN CONFIG Ở ĐÂY
notifications.js       # Đăng ký push + gửi local notification
screens/
  AuthScreen.js        # Đăng nhập / Đăng ký
  ProfileScreen.js     # Cập nhật email, sđt, mật khẩu, địa chỉ + push
```

## Bước 1 — Tạo project Firebase

1. Vào https://console.firebase.google.com → **Add project**.
2. Thêm một **Web App** (biểu tượng `</>`) → copy đoạn `firebaseConfig`.
3. Dán config vào `firebaseConfig.js` (thay các giá trị `YOUR_...`).
4. **Authentication** → Sign-in method → bật **Email/Password**.
5. **Firestore Database** → Create database (chọn *test mode* khi đang học).

## Bước 2 — Chạy thử cục bộ (tùy chọn)

```bash
npm install
npx expo start
```

Quét QR bằng app **Expo Go** trên điện thoại.

## Bước 3 — Đưa lên Snack (nộp link online)

Cách nhanh nhất:

1. Vào https://snack.expo.dev
2. Tạo Snack mới → trong Snack, mở từng file và **dán nội dung** các file:
   `App.js`, `firebaseConfig.js`, `notifications.js`, `screens/AuthScreen.js`, `screens/ProfileScreen.js`.
3. Mở `package.json` của Snack và thêm dependencies:
   ```json
   "firebase": "*",
   "@react-native-async-storage/async-storage": "*",
   "expo-notifications": "*",
   "expo-device": "*"
   ```
   (Snack sẽ tự cài bản tương thích với SDK đang chọn.)
4. Nhớ dán **firebaseConfig** thật của bạn vào `firebaseConfig.js`.
5. Bấm **Save** → copy đường link Snack để **nộp**.

> Mẹo: bạn cũng có thể đẩy code lên GitHub rồi import vào Snack qua
> `https://snack.expo.dev/?platform=android` → "Import git repository".

## Lưu ý về Push Notification trên Snack / Expo Go

- **Local notification** (nút "Gửi thông báo thử") **chạy được ngay** trên điện thoại thật.
- **Remote push thật** (server gửi qua FCM): trên Expo Go (SDK 53+) bị giới hạn,
  chỉ hoạt động đầy đủ khi **EAS build** một bản app riêng. Lúc đó `expo-notifications`
  sẽ gửi/nhận push thông qua **FCM** ở phía Android.
- Màn hình Profile có hiển thị **Expo Push Token** (nếu lấy được) để dùng test gửi push.

## Tính năng đã làm

- [x] Đăng nhập / Đăng ký bằng email + mật khẩu (Firebase Auth)
- [x] Lưu phiên đăng nhập (AsyncStorage persistence)
- [x] Cập nhật **email** (có reauthenticate)
- [x] Cập nhật **mật khẩu** (có reauthenticate)
- [x] Cập nhật **số điện thoại** + **địa chỉ** (lưu Firestore)
- [x] Đăng xuất
- [x] Xin quyền + lấy push token + gửi local notification (FCM/expo-notifications)
