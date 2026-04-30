import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: REEMPLAZA ESTO con tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "berryslr-dev.firebaseapp.com",
  projectId: "berryslr-dev",
  storageBucket: "berryslr-dev.appspot.com",
  messagingSenderId: "mimorzan@cef-sanfrancisco-lr.edu.ar",
  appId: "mimorzan@cef-sanfrancisco-lr.edu.ar"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// IMPORTANT: Cambia esto por tu correo real de Gmail para tener acceso de Jefe
export const BOSS_EMAIL = "tu-correo@gmail.com";

export const isBoss = (user) => user && user.email === BOSS_EMAIL;
