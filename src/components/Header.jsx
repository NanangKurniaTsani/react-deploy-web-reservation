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
    <header className="header header-container header-responsive bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 mobile-safe-area-top">
      <div className="header-content header-content-container header-content-responsive mobile-header px-4">
        <div className="header-inner header-inner-container header-inner-responsive flex justify-between items-center h-14 sm:h-16">
          <div className="header-brand header-brand-container header-brand-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-3 min-w-0 flex-1">
            <div className="header-logo header-logo-container header-logo-responsive w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
              <img
                src={icon_hotel || "/placeholder.svg"}
                alt="King Royal Hotel"
                className="header-logo-image header-logo-image-responsive h-full w-full object-contain"
              />
            </div>
            <div className="header-brand-text header-brand-text-container header-brand-text-responsive min-w-0">
              <h1 className="header-title header-title-responsive text-sm sm:text-lg mobile-text-sm font-bold text-gray-900 truncate">
                King Royal Hotel
              </h1>
              <p className="header-subtitle header-subtitle-responsive text-xs mobile-text-xs text-gray-600 hidden sm:block">
                Venue Management System
              </p>
            </div>
          </div>

          {currentUser ? (
            <div className="header-user header-user-container header-user-responsive flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Navigation untuk Admin */}
              {userRole === "admin" && (
                <div className="header-nav header-nav-container header-nav-responsive hidden sm:flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setCurrentView("home")}
                    className={`header-nav-btn header-nav-btn-home header-nav-btn-responsive px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                      currentView === "home" ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaHome className="header-nav-icon header-nav-icon-responsive text-xs sm:text-sm" />
                    <span>Beranda</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("admin")}
                    className={`header-nav-btn header-nav-btn-admin header-nav-btn-responsive px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                      currentView === "admin" ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaChartBar className="header-nav-icon header-nav-icon-responsive text-xs sm:text-sm" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("calendar")}
                    className={`header-nav-btn header-nav-btn-calendar header-nav-btn-responsive px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                      currentView === "calendar" ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaCalendarAlt className="header-nav-icon header-nav-icon-responsive text-xs sm:text-sm" />
                    <span>Kalender</span>
                  </button>
                </div>
              )}

              {/* Mobile Navigation untuk Admin - Modified to be smaller and shifted right */}
              {userRole === "admin" && (
                <div className="header-mobile-nav header-mobile-nav-container header-mobile-nav-responsive sm:hidden flex space-x-1 bg-gray-100 p-1 rounded-lg ml-2">
                  <button
                    onClick={() => setCurrentView("home")}
                    className={`header-mobile-nav-btn header-mobile-nav-btn-home header-mobile-nav-btn-responsive p-1 rounded-md text-xs font-medium flex items-center ${
                      currentView === "home" ? "bg-blue-500 text-white" : "text-gray-600"
                    }`}
                  >
                    <FaHome className="text-xs" />
                  </button>
                  <button
                    onClick={() => setCurrentView("admin")}
                    className={`header-mobile-nav-btn header-mobile-nav-btn-admin header-mobile-nav-btn-responsive p-1 rounded-md text-xs font-medium flex items-center ${
                      currentView === "admin" ? "bg-blue-500 text-white" : "text-gray-600"
                    }`}
                  >
                    <FaChartBar className="text-xs" />
                  </button>
                  <button
                    onClick={() => setCurrentView("calendar")}
                    className={`header-mobile-nav-btn header-mobile-nav-btn-calendar header-mobile-nav-btn-responsive p-1 rounded-md text-xs font-medium flex items-center ${
                      currentView === "calendar" ? "bg-blue-500 text-white" : "text-gray-600"
                    }`}
                  >
                    <FaCalendarAlt className="text-xs" />
                  </button>
                </div>
              )}

              <div className="header-user-menu header-user-menu-container header-user-menu-responsive relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="header-user-btn header-user-btn-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-2 p-1 sm:p-2 mobile-p-2 rounded-xl hover:bg-gray-100 transition-colors mobile-touch-target"
                >
                  <div className="header-user-avatar header-user-avatar-responsive w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FaUser className="header-user-avatar-icon header-user-avatar-icon-responsive text-white text-xs sm:text-sm mobile-text-xs" />
                  </div>
                  <div className="header-user-info header-user-info-responsive hidden sm:block text-left">
                    <p className="header-user-name header-user-name-responsive text-sm mobile-text-sm font-medium text-gray-900 truncate max-w-24">
                      {currentUser.displayName || currentUser.email?.split("@")[0]}
                    </p>
                    <p className="header-user-role header-user-role-responsive text-xs mobile-text-xs text-gray-600 capitalize">
                      {userRole}
                    </p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="header-user-dropdown header-user-dropdown-container header-user-dropdown-responsive absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 mobile-py-2 z-50">
                    <button
                      onClick={() => {
                        setCurrentView("profile")
                        setShowUserMenu(false)
                      }}
                      className="header-user-dropdown-item header-user-dropdown-item-profile header-user-dropdown-item-responsive w-full text-left px-4 py-2 mobile-px-4 mobile-py-2 text-sm mobile-text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 mobile-space-x-2 mobile-touch-target"
                    >
                      <FaUser className="header-user-dropdown-icon header-user-dropdown-icon-responsive text-gray-400 mobile-icon-sm" />
                      <span>Profil</span>
                    </button>
                    <hr className="header-user-dropdown-divider header-user-dropdown-divider-responsive my-1" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="header-user-dropdown-item header-user-dropdown-item-logout header-user-dropdown-item-responsive w-full text-left px-4 py-2 mobile-px-4 mobile-py-2 text-sm mobile-text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 mobile-space-x-2 mobile-touch-target"
                    >
                      <FaSignOutAlt className="header-user-dropdown-icon header-user-dropdown-icon-responsive text-red-400 mobile-icon-sm" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView("auth")}
              className="header-login header-login-btn header-login-responsive bg-blue-500 text-white px-3 sm:px-4 mobile-px-4 py-2 mobile-py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm mobile-text-sm mobile-button"
            >
              Masuk
            </button>
          )}
        </div>
      </div>

      {showUserMenu && (
        <div
          className="header-overlay header-overlay-responsive fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}

Header.propTypes = {
  currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  userRole: PropTypes.string,
}

export default Header