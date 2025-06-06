// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCc3GkcofUbP0WE_e3vsN3SEQczzS4dZTc",
  authDomain: "lichcongtactuan-b1bfc.firebaseapp.com",
  projectId: "lichcongtactuan-b1bfc",
  storageBucket: "lichcongtactuan-b1bfc.appspot.com", // Sửa lại đuôi là .app**spot**.com
  messagingSenderId: "699872680553",
  appId: "1:699872680553:web:ac186a374b4e2e497d20f8",
  measurementId: "G-5ZFH7PREKQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };