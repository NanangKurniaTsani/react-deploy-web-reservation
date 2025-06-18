// Script untuk membuat user admin
// Jalankan script ini setelah setup Firebase

import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  // Masukkan konfigurasi Firebase Anda di sini
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createAdminUser() {
  try {
    // Ganti dengan UID user yang ingin dijadikan admin
    const adminUID = "iiqHrP9iwpYPG58DlnGXqVTC5y03"

    await setDoc(doc(db, "users", adminUID), {
      email: "@adminhotel@gmail.com",
      name: "Hotel Administrator",
      role: "admin",
      createdAt: new Date(),
    })

    console.log("Admin user berhasil dibuat!")
    console.log("Email: nanangtsanie09@gmail.com")
    console.log("Role: admin")
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

// Uncomment baris di bawah untuk menjalankan
 createAdminUser()

console.log("Script untuk membuat admin user")
console.log("1. Daftar akun baru di aplikasi")
console.log("2. Salin UID user dari Firebase Console")
console.log("3. Ganti 'USER_UID_HERE' dengan UID tersebut")
console.log("4. Uncomment baris terakhir dan jalankan script")
