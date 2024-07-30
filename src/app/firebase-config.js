import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBY_M945Xtdg_a4uHHFNxSCeC8A5RFO9-Q",
  authDomain: "mita-2bc93.firebaseapp.com",
  projectId: "mita-2bc93",
  storageBucket: "mita-2bc93.appspot.com",
  messagingSenderId: "298570300608",
  appId: "1:298570300608:web:790cac43d6fb930a0a0125",
  measurementId: "G-33WTRQBYDQ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
