"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../config/firebase"
import {
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaEnvelope,
  FaLock,
  FaUser,
  FaGoogle,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa"
import toast from "react-hot-toast"
import icon_hotel from "../assets/icon_hotel.png"
import { useBackButton } from "../hooks/UseBackButton"

const Auth = ({ onSuccess = null, onBack = null }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (onSuccess) {
      onSuccess()
    }
  }

  useBackButton(() => {
    handleBack()
    return true
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
          role: "customer",
          createdAt: new Date(),
        })
      }

      toast.success("Login dengan Google berhasil!")
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Google login error:", error)
      let errorMessage = "Gagal login dengan Google"

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Login dibatalkan"
          break
        case "auth/popup-blocked":
          errorMessage = "Popup diblokir browser. Silakan izinkan popup"
          break
        case "auth/cancelled-popup-request":
          errorMessage = "Login dibatalkan"
          break
        default:
          errorMessage = error.message
      }

      toast.error(errorMessage)
    }
    setGoogleLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
        const user = userCredential.user

        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", user.uid), {
            name: user.displayName || formData.email.split("@")[0],
            email: user.email,
            role: "customer",
            createdAt: new Date(),
          })
        }

        toast.success("Login berhasil!")
        if (onSuccess) onSuccess()
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Password tidak cocok!")
          setLoading(false)
          return
        }

        if (formData.password.length < 6) {
          toast.error("Password minimal 6 karakter!")
          setLoading(false)
          return
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        const user = userCredential.user

        await updateProfile(user, {
          displayName: formData.name,
        })

        await setDoc(doc(db, "users", user.uid), {
          name: formData.name,
          email: formData.email,
          role: "customer",
          createdAt: new Date(),
        })

        toast.success("Registrasi berhasil!")
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error("Auth error:", error)
      let errorMessage = "Terjadi kesalahan"

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Email tidak terdaftar"
          break
        case "auth/wrong-password":
          errorMessage = "Password salah"
          break
        case "auth/email-already-in-use":
          errorMessage = "Email sudah terdaftar"
          break
        case "auth/weak-password":
          errorMessage = "Password terlalu lemah"
          break
        case "auth/invalid-email":
          errorMessage = "Format email tidak valid"
          break
        case "auth/too-many-requests":
          errorMessage = "Terlalu banyak percobaan. Coba lagi nanti"
          break
        default:
          errorMessage = error.message
      }

      toast.error(errorMessage)
    }
    setLoading(false)
  }

  return (
    <div className="auth-container auth-container-responsive min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="auth-wrapper auth-wrapper-container auth-wrapper-responsive w-full max-w-md">
        {/* Back Navigation */}
        <div className="auth-back-nav auth-back-nav-container auth-back-nav-responsive mb-4">
          <button
            onClick={handleBack}
            className="auth-back-btn auth-back-btn-responsive flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <div className="auth-back-icon auth-back-icon-responsive w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
              <FaArrowLeft className="text-sm" />
            </div>
            <span className="auth-back-text auth-back-text-responsive font-medium">Kembali ke Beranda</span>
          </button>
        </div>

        <div className="auth-header auth-header-container auth-header-responsive text-center mb-8">
          <div className="auth-logo auth-logo-container auth-logo-responsive flex items-center justify-center cursor-pointer mx-auto w-max">
            <div className="auth-logo-icon auth-logo-icon-responsive w-12 h-12 flex items-center justify-center">
              <img
                src={icon_hotel || "/placeholder.svg?height=48&width=48"}
                alt="Grand Hotel"
                className="auth-logo-image auth-logo-image-responsive h-full w-full object-contain"
              />
            </div>
          </div>
          <p className="auth-subtitle auth-subtitle-responsive text-gray-600 mt-2">
            {isLogin ? "Masuk ke akun Anda" : "Buat akun baru untuk memulai"}
          </p>
        </div>

        <div className="auth-card auth-card-container auth-card-responsive bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative">
          {/* Close button alternative */}
          <button
            onClick={handleBack}
            className="auth-close-btn auth-close-btn-responsive absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>

          <div className="auth-card-header auth-card-header-container auth-card-header-responsive mb-6">
            <h2 className="auth-card-title auth-card-title-responsive text-xl font-bold text-gray-900 mb-2">
              {isLogin ? "Masuk" : "Daftar"}
            </h2>
            <p className="auth-card-subtitle auth-card-subtitle-responsive text-gray-600 text-sm">
              {isLogin ? "Masukkan email dan password Anda" : "Lengkapi data untuk membuat akun baru"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form auth-form-container auth-form-responsive space-y-5">
            {!isLogin && (
              <div className="auth-form-group auth-form-group-name auth-form-group-responsive">
                <label className="auth-form-label auth-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="auth-form-label-icon auth-form-label-icon-responsive inline mr-2 text-gray-400" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="auth-form-input auth-form-input-name auth-form-input-responsive w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            )}

            <div className="auth-form-group auth-form-group-email auth-form-group-responsive">
              <label className="auth-form-label auth-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="auth-form-label-icon auth-form-label-icon-responsive inline mr-2 text-gray-400" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="auth-form-input auth-form-input-email auth-form-input-responsive w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="nama@email.com"
              />
            </div>

            <div className="auth-form-group auth-form-group-password auth-form-group-responsive">
              <label className="auth-form-label auth-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="auth-form-label-icon auth-form-label-icon-responsive inline mr-2 text-gray-400" />
                Password
              </label>
              <div className="auth-form-password auth-form-password-container auth-form-password-responsive relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="auth-form-input auth-form-input-password auth-form-input-responsive w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-form-password-toggle auth-form-password-toggle-responsive auth-touch-target absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash className="auth-form-password-icon auth-form-password-icon-responsive" />
                  ) : (
                    <FaEye className="auth-form-password-icon auth-form-password-icon-responsive" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="auth-form-group auth-form-group-confirm auth-form-group-responsive">
                <label className="auth-form-label auth-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                  <FaLock className="auth-form-label-icon auth-form-label-icon-responsive inline mr-2 text-gray-400" />
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="auth-form-input auth-form-input-confirm auth-form-input-responsive w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ulangi password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="auth-form-submit auth-form-submit-responsive auth-touch-target w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <FaSpinner className="auth-form-submit-spinner auth-form-submit-spinner-responsive animate-spin" />
                  <span className="auth-form-submit-text auth-form-submit-text-responsive">
                    {isLogin ? "Masuk..." : "Mendaftar..."}
                  </span>
                </>
              ) : (
                <span className="auth-form-submit-text auth-form-submit-text-responsive">
                  {isLogin ? "Masuk" : "Daftar"}
                </span>
              )}
            </button>
          </form>

          <div className="auth-divider auth-divider-container auth-divider-responsive relative my-6">
            <div className="auth-divider-line auth-divider-line-responsive absolute inset-0 flex items-center">
              <div className="auth-divider-border auth-divider-border-responsive w-full border-t border-gray-200" />
            </div>
            <div className="auth-divider-text auth-divider-text-container auth-divider-text-responsive relative flex justify-center text-sm">
              <span className="auth-divider-label auth-divider-label-responsive px-4 bg-white text-gray-500">atau</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="auth-google-btn auth-google-btn-container auth-google-btn-responsive auth-touch-target w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center space-x-3 mb-6"
          >
            {googleLoading ? (
              <FaSpinner className="auth-google-spinner auth-google-spinner-responsive animate-spin text-blue-500" />
            ) : (
              <FaGoogle className="auth-google-icon auth-google-icon-responsive text-red-500" />
            )}
            <span className="auth-google-text auth-google-text-responsive">
              {googleLoading ? "Memproses..." : `${isLogin ? "Masuk" : "Daftar"} dengan Google`}
            </span>
          </button>

          <div className="auth-switch auth-switch-container auth-switch-responsive text-center">
            <p className="auth-switch-text auth-switch-text-responsive text-gray-600 text-sm">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setFormData({
                    email: "",
                    password: "",
                    name: "",
                    confirmPassword: "",
                  })
                }}
                className="auth-switch-btn auth-switch-btn-responsive text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-footer auth-footer-container auth-footer-responsive text-center mt-6">
          <p className="auth-footer-text auth-footer-text-responsive text-gray-500 text-sm">
            © 2024 Grand Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

Auth.propTypes = {
  onSuccess: PropTypes.func,
  onBack: PropTypes.func,
}

export default Auth
