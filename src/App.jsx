"use client"

import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Header from "./components/Header"
import Auth from "./components/Auth"
import HomePage from "./components/HomePage"
import CustomerDashboard from "./components/CustomerDashboard"
import AdminDashboard from "./components/AdminDashboard"
import MyBookings from "./components/MyBookings"
import BookingForm from "./components/BookingForm"
import { FaSpinner } from "react-icons/fa"
import CalendarDashboard from "./components/CalendarDashboard"

function AppContent() {
  const { currentUser, userRole, loading } = useAuth()
  const [currentView, setCurrentView] = useState("home")
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [navigationHistory, setNavigationHistory] = useState(["home"])

  useEffect(() => {
    if (currentUser && userRole) {
      if (currentView === "auth") {
        if (userRole === "admin") {
          handleNavigate("admin")
        } else {
          handleNavigate("home")
        }
      }
    } else if (!currentUser) {
      if (currentView !== "home" && currentView !== "auth") {
        handleNavigate("home")
      }
    }
  }, [currentUser, userRole])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  const handleNavigate = (view, data = null) => {
    console.log("Navigating to:", view) // Debug log

    if (view !== currentView) {
      setNavigationHistory((prev) => [...prev, view])
    }

    if (view === "booking" && data) {
      setSelectedRoom(data)
    }
    setCurrentView(view)
  }

  const handleBack = () => {
    console.log("handleBack called, current history:", navigationHistory) // Debug log

    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory]
      newHistory.pop()
      const previousView = newHistory[newHistory.length - 1]

      console.log("Going back to:", previousView) // Debug log

      setNavigationHistory(newHistory)
      setCurrentView(previousView)

      if (currentView === "booking") {
        setSelectedRoom(null)
      }
    } else {
      console.log("No history, going to home") // Debug log
      handleNavigate("home")
    }
  }

  const handleBookingSuccess = () => {
    handleNavigate("bookings")
    setSelectedRoom(null)
  }

  // Perbaiki handleAuthSuccess
  const handleAuthSuccess = () => {
    console.log("Auth success, user role:", userRole) // Debug log

    if (userRole === "admin") {
      handleNavigate("admin")
    } else {
      handleNavigate("home")
    }
  }

  // Tambahkan handleAuthBack
  const handleAuthBack = () => {
    console.log("Auth back clicked") // Debug log
    handleNavigate("home")
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "auth":
        return (
          <Auth
            onSuccess={handleAuthSuccess}
            onBack={handleAuthBack} // Tambahkan onBack prop
          />
        )
      case "home":
        return <HomePage onNavigate={handleNavigate} setCurrentView={handleNavigate} />
      case "customer":
        return <CustomerDashboard />
      case "admin":
        return userRole === "admin" ? (
          <AdminDashboard />
        ) : (
          <HomePage onNavigate={handleNavigate} setCurrentView={handleNavigate} />
        )
      case "bookings":
        return !currentUser ? <Auth onSuccess={handleAuthSuccess} onBack={handleAuthBack} /> : <MyBookings />
      case "booking":
        return !currentUser ? (
          <Auth onSuccess={handleAuthSuccess} onBack={handleAuthBack} />
        ) : (
          <BookingForm selectedRoom={selectedRoom} onSuccess={handleBookingSuccess} onCancel={handleBack} />
        )
      case "calendar":
        return !currentUser ? (
          <Auth onSuccess={handleAuthSuccess} onBack={handleAuthBack} />
        ) : (
          <CalendarDashboard userRole={userRole} />
        )
      case "profile":
        return !currentUser ? (
          <Auth onSuccess={handleAuthSuccess} onBack={handleAuthBack} />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Profil Pengguna</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <p className="text-gray-900">{currentUser.displayName || "Tidak tersedia"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{currentUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-gray-900">{userRole === "admin" ? "Administrator" : "Customer"}</p>
                </div>
                <button
                  onClick={() => handleNavigate("home")}
                  className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-colors mb-5"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return <HomePage onNavigate={handleNavigate} setCurrentView={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView !== "auth" && (
        <Header currentView={currentView} setCurrentView={handleNavigate} userRole={userRole} />
      )}
      <main className={currentView !== "auth" ? "pt-0" : ""}>{renderCurrentView()}</main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
