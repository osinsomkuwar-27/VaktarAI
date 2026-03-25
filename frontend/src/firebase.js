import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPBF3NqpVbke06n-aa910CAQhodubuhC0",
  authDomain: "vaktarai-a37e8.firebaseapp.com",
  projectId: "vaktarai-a37e8",
  storageBucket: "vaktarai-a37e8.firebasestorage.app",
  messagingSenderId: "265638951520",
  appId: "1:265638951520:web:a2cc2a26ad0022d83ba105"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;