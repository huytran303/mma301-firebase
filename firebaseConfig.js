// firebaseConfig.js
// Chỉ chứa thông tin project. App dùng Firebase REST API (qua fetch) nên KHÔNG
// import package "firebase" — vì Snackager (bundler của Snack) không bundle được
// package firebase (do firebase dùng trường "exports" mà Snack chưa hỗ trợ).
//
// Project: fir-mma-ac196
export const FIREBASE_API_KEY = 'AIzaSyCftd2Jg2STvbRh4dYWnIqJZjnQ0NmRSDs';
export const FIREBASE_PROJECT_ID = 'fir-mma-ac196';
