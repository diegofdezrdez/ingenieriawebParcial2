// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCyVN0Oiw6eYYwHOXcg-2V_ZZ-cVGgYmc",
  authDomain: "parcial2-7579b.firebaseapp.com",
  projectId: "parcial2-7579b",
  storageBucket: "parcial2-7579b.firebasestorage.app",
  messagingSenderId: "1079136194504",
  appId: "1:1079136194504:web:0bbf8504b84932181afafd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();