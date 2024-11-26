// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm3RwyAfeXZlVXDVWHu0aG67mfC9HocEU",
  authDomain: "reacteva-b9e91.firebaseapp.com",
  projectId: "reacteva-b9e91",
  storageBucket: "reacteva-b9e91.firebasestorage.app",
  messagingSenderId: "374204739332",
  appId: "1:374204739332:web:b444474457d4ea37f0ea51",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Inicializa Auth con persistencia en AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
