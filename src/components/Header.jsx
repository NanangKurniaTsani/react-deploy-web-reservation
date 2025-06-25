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
      toast.success("Logout berhasil!", { duration: 2000 })
      setCurrentView("home")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Gagal logout", { duration: 2000 })
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 mobile-safe-area-top">
      <div className="mobile-header">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
              <img
                src={icon_hotel || "/placeholder.svg"}
                alt="King Royal Hotel"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg mobile-text-sm font-bold text-gray-900 truncate">King Royal Hotel</h1>
              <p className="text-xs mobile-text-xs text-gray-600 hidden sm:block">Venue Management System</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              {userRole === "admin" && (
                <div className="hidden sm:flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setCurrentView("home")}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                      currentView === "home" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FaHome className="text-xs sm:text-sm" />
                    <span>Beranda</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("admin")}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                      currentView === "admin" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FaChartBar className="text-xs sm:text-sm" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("calendar")}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                      currentView === "calendar" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FaCalendarAlt className="text-xs sm:text-sm" />
                    <span>Kalender</span>
                  </button>
                </div>
              )}

              <div className="relative ml-2 sm:ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-2 p-1 sm:p-2 mobile-p-2 rounded-xl hover:bg-gray-100 transition-colors mobile-touch-target"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-xs sm:text-sm mobile-text-xs" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm mobile-text-sm font-medium text-gray-900 truncate max-w-24">
                      {currentUser.displayName || currentUser.email?.split("@")[0]}
                    </p>
                    <p className="text-xs mobile-text-xs text-gray-600 capitalize">{userRole}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 mobile-py-2 z-50">
                    <button
                      onClick={() => {
                        setCurrentView("profile")
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 mobile-px-4 mobile-py-2 text-sm mobile-text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 mobile-space-x-2 mobile-touch-target"
                    >
                      <FaUser className="text-gray-400 mobile-icon-sm" />
                      <span>Profil</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 mobile-px-4 mobile-py-2 text-sm mobile-text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 mobile-space-x-2 mobile-touch-target"
                    >
                      <FaSignOutAlt className="text-red-400 mobile-icon-sm" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView("auth")}
              className="bg-blue-500 text-white px-3 sm:px-4 mobile-px-4 py-2 mobile-py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm mobile-text-sm mobile-button"
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