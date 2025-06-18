import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {

  apiKey: "AIzaSyAuCEwtgKJqR_-_lPCDb5vhpBoP-FAdkfA",

  authDomain: "reservasihotel-593a2.firebaseapp.com",

  projectId: "reservasihotel-593a2",

  storageBucket: "reservasihotel-593a2.firebasestorage.app",

  messagingSenderId: "1030994778391",

  appId: "1:1030994778391:web:3ff413bfae9cfef19d3f52",

  measurementId: "G-GRVK241FT1"

};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

