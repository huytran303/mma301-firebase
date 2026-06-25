# mma301-firebase (Expo + Snack)

Ứng dụng React Native (Expo) dùng **Firebase** (qua **REST API**) để:

1. **Đăng nhập + quản lý người dùng** — Firebase Authentication (Email/Password).
   Người dùng cập nhật được: **email, số điện thoại, mật khẩu, địa chỉ**.
2. **Push Notification (FCM)** qua `expo-notifications`.

> ⚠️ Vì sao dùng REST API thay vì package `firebase`?
> Snack (snackager) **không bundle được** package `firebase` (firebase dùng trường
> `exports` mà Snack chưa hỗ trợ). Nên app gọi thẳng Firebase REST API bằng `fetch`
> → chạy được trên Snack mà vẫn dùng Firebase thật.

## Cấu trúc

```
App.js                 # Khôi phục phiên + điều hướng Auth <-> Profile
firebaseConfig.js      # API key + projectId
firebaseRest.js        # Gọi Auth + Firestore qua REST, lưu phiên bằng AsyncStorage
notifications.js       # Push / local notification
screens/
  AuthScreen.js        # Đăng nhập / Đăng ký
  ProfileScreen.js     # Cập nhật email, sđt, mật khẩu, địa chỉ + push
```

## Cấu hình Firebase (BẮT BUỘC)

Project: **fir-mma-ac196** (đã điền sẵn trong `firebaseConfig.js`).

1. **Authentication** → Sign-in method → bật **Email/Password**. ✅ (đã bật)
2. **Firestore Database** → bấm **Create database** → chọn location → **Start in test mode**
   (hoặc dán Rules bên dưới). ⚠️ **Bước này bắt buộc** — hiện database chưa được tạo.

Rules gợi ý (mỗi user chỉ đọc/ghi document của mình):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Đưa lên Snack (lấy link nộp)

Cách 1 — Import git:
- https://snack.expo.dev → **Import git repository** → `https://github.com/huytran303/mma301-firebase.git`

Cách 2 — Paste tay (chắc chắn nhất):
1. Mở Snack mới, chọn SDK **54**.
2. Tạo & dán 6 file: `App.js`, `firebaseConfig.js`, `firebaseRest.js`, `notifications.js`,
   `screens/AuthScreen.js`, `screens/ProfileScreen.js`.
3. Trong `package.json` của Snack thêm dependencies:
   `@react-native-async-storage/async-storage`, `expo-notifications`, `expo-constants`
   (bấm "Add dependency", Snack tự chọn version hợp SDK).
4. **Save** → copy link để nộp.

## Lưu ý Push Notification

- **Local notification** (nút "Gửi thông báo thử") chạy được ngay trên Expo Go.
- **Remote push thật qua FCM** chỉ chạy đầy đủ khi **EAS build** app riêng (giới hạn của Expo Go/Snack).

## Đã verify

- [x] Auth REST: đăng ký, đăng nhập, đổi email, đổi mật khẩu (test end-to-end PASS)
- [x] Firestore REST: ghi/đọc sđt + địa chỉ (chạy được sau khi tạo Firestore database)
- [x] Lưu phiên đăng nhập bằng AsyncStorage + tự refresh token
- [x] Push / local notification
