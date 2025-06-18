"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { FaEye, FaEyeSlash, FaSpinner, FaGoogle, FaEnvelope, FaLock, FaUser } from "react-icons/fa"
import toast from "react-hot-toast"

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  })

  const { login, signup, loginWithGoogle } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        toast.success("Berhasil masuk!")
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
        await signup(formData.email, formData.password, formData.displayName)
        toast.success("Akun berhasil dibuat!")
      }
    } catch (error) {
      console.error("Auth error:", error)
      if (error.code === "auth/user-not-found") {
        toast.error("Email tidak terdaftar")
      } else if (error.code === "auth/wrong-password") {
        toast.error("Password salah")
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Email sudah terdaftar")
      } else if (error.code === "auth/weak-password") {
        toast.error("Password terlalu lemah")
      } else if (error.code === "auth/invalid-email") {
        toast.error("Format email tidak valid")
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Email atau password salah")
      } else {
        toast.error(isLogin ? "Gagal masuk" : "Gagal membuat akun")
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success("Berhasil masuk dengan Google!")
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("Gagal masuk dengan Google")
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">GH</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}
          </h1>
          <p className="text-gray-600">{isLogin ? "Masuk ke akun Grand Hotel Anda" : "Bergabung dengan Grand Hotel"}</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Konfirmasi password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>{isLogin ? "Masuk..." : "Membuat Akun..."}</span>
                </>
              ) : (
                <span>{isLogin ? "Masuk" : "Buat Akun"}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">atau</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
          >
            <FaGoogle className="text-red-500" />
            <span>Masuk dengan Google</span>
          </button>

          {/* Switch Mode */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setFormData({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    displayName: "",
                  })
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Daftar sekarang" : "Masuk di sini"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
