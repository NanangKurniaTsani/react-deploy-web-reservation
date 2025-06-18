"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { FaUser, FaSignOutAlt, FaHome, FaCalendarAlt, FaCog, FaBars, FaTimes, FaConciergeBell } from "react-icons/fa"

const Header = ({ currentView, setCurrentView, userRole }) => {
  const { currentUser, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setCurrentView("home")
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Different navigation for admin vs customer
  const getNavItems = () => {
    if (!currentUser) {
      return [{ id: "home", label: "Beranda", icon: FaHome }]
    }

    if (userRole === "admin") {
      return [
        { id: "home", label: "Beranda", icon: FaHome },
        { id: "admin", label: "Admin Panel", icon: FaCog },
      ]
    }

    // Customer navigation
    return [
      { id: "home", label: "Beranda", icon: FaHome },
      { id: "services", label: "Pengajuan Layanan", icon: FaConciergeBell },
      { id: "bookings", label: "Riwayat Booking", icon: FaCalendarAlt },
    ]
  }

  const navItems = getNavItems()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView("home")}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">GH</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">Grand Hotel</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.displayName || currentUser.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-500">{userRole === "admin" ? "Administrator" : "Customer"}</p>
                </div>

                {/* Profile Button */}
                <button
                  onClick={() => setCurrentView("profile")}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <FaUser className="w-4 h-4 text-gray-600" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView("auth")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Masuk
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id)
                      setIsMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
