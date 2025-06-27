"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { signOut } from "firebase/auth"
import { auth } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import { FaUser, FaSignOutAlt, FaHome, FaChartBar, FaCalendarAlt } from "react-icons/fa"
import toast from "react-hot-toast"
import icon_hotel from "../assets/icon_hotel.png"
import { useBackButton } from "../hooks/UseBackButton"

const Header = ({ currentView, setCurrentView, userRole = "customer" }) => {
  const { currentUser } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  useBackButton(() => {
    if (currentView !== "home") {
      setCurrentView("home")
      return true
    }
    return false
  })

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logout berhasil!", { duration: 1000 })
      setCurrentView("home")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Gagal logout", { duration: 1000 })
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img
                src={icon_hotel || "/placeholder.svg"}
                alt="King Royal Hotel"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">King Royal Hotel</h1>
              <p className="text-xs text-gray-600 hidden sm:block">Venue Management System</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-2">
              {userRole === "admin" && (
                <>
                  <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setCurrentView("home")}
                      className={`relative px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                        currentView === "home" ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FaHome className="text-sm" />
                      <span>Beranda</span>
                    </button>
                    <button
                      onClick={() => setCurrentView("admin")}
                      className={`relative px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                        currentView === "admin" ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FaChartBar className="text-sm" />
                      <span>Admin</span>
                    </button>
                    <button
                      onClick={() => setCurrentView("calendar")}
                      className={`relative px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                        currentView === "calendar" ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FaCalendarAlt className="text-sm" />
                      <span>Kalender</span>
                    </button>
                  </div>

                  <div className="sm:hidden flex items-center bg-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setCurrentView("home")}
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${
                        currentView === "home" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FaHome className="text-xs" />
                    </button>
                    <button
                      onClick={() => setCurrentView("admin")}
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${
                        currentView === "admin" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FaChartBar className="text-xs" />
                    </button>
                    <button
                      onClick={() => setCurrentView("calendar")}
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${
                        currentView === "calendar" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FaCalendarAlt className="text-xs" />
                    </button>
                  </div>
                </>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                      {currentUser.displayName || currentUser.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">{userRole}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setCurrentView("profile")
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                    >
                      <FaUser className="text-gray-400" />
                      <span>Profil</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                    >
                      <FaSignOutAlt className="text-red-400" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView("auth")}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm"
            >
              Masuk
            </button>
          )}
        </div>
      </div>

      {showUserMenu && <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />}
    </header>
  )
}

Header.propTypes = {
  currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  userRole: PropTypes.string,
}

export default Header
