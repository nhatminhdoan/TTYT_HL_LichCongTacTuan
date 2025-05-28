// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmCx-xEj9VUwjMvRpUOx0-CIqce45Hep0",
  authDomain: "lichcongtac-ttythl.firebaseapp.com",
  projectId: "lichcongtac-ttythl",
  storageBucket: "lichcongtac-ttythl.firebasestorage.app",
  messagingSenderId: "897066542493",
  appId: "1:897066542493:web:452ffa265b48419993bb74",
  measurementId: "G-M74BTF0Y3P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Export the initialized app
export default app;
// Export the analytics instance if needed
export { analytics };