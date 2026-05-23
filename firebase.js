import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqnW6oICy_gZJcIi4r801Uv8C_jLC1CU4",
  authDomain: "acculedger-5e812.firebaseapp.com",
  projectId: "acculedger-5e812",
  storageBucket: "acculedger-5e812.firebasestorage.app",
  messagingSenderId: "105051868142",
  appId: "1:105051868142:web:4a93e94838d1ef97d79cff"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);