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
import ServiceBookingForm from "./components/ServiceBookingForm"
import { FaSpinner } from "react-icons/fa"

function AppContent() {
  const { currentUser, userRole, loading } = useAuth()
  const [currentView, setCurrentView] = useState("home")
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Auto redirect after login
  useEffect(() => {
    if (currentUser && userRole) {
      // If user just logged in and we're on auth page, redirect to appropriate dashboard
      if (currentView === "auth") {
        if (userRole === "admin") {
          setCurrentView("admin")
        } else {
          setCurrentView("home") // Customer goes to home page to browse rooms
        }
      }
    } else if (!currentUser) {
      // If user logged out, go back to home
      if (currentView !== "home" && currentView !== "auth") {
        setCurrentView("home")
      }
    }
  }, [currentUser, userRole, currentView])

  // Show loading spinner while checking auth state
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

  // Handle booking form navigation
  const handleBookRoom = (room) => {
    if (!currentUser) {
      setCurrentView("auth")
      return
    }
    setSelectedRoom(room)
    setCurrentView("booking")
  }

  const handleBookingSuccess = () => {
    setCurrentView("bookings")
    setSelectedRoom(null)
  }

  const handleAuthSuccess = () => {
    // This will be handled by useEffect above
    // Just a placeholder for now
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case "auth":
        return <Auth onSuccess={handleAuthSuccess} />

      case "home":
        return <HomePage onBookRoom={handleBookRoom} />

      case "customer":
        return <CustomerDashboard />

      case "admin":
        if (userRole === "admin") {
          return <AdminDashboard />
        }
        // If not admin, redirect to home
        setCurrentView("home")
        return <HomePage onBookRoom={handleBookRoom} />

      case "services":
        if (!currentUser) {
          setCurrentView("auth")
          return <Auth onSuccess={handleAuthSuccess} />
        }
        return <ServiceBookingForm />

      case "bookings":
        if (!currentUser) {
          setCurrentView("auth")
          return <Auth onSuccess={handleAuthSuccess} />
        }
        return <MyBookings />

      case "booking":
        if (!currentUser) {
          setCurrentView("auth")
          return <Auth onSuccess={handleAuthSuccess} />
        }
        return (
          <BookingForm
            selectedRoom={selectedRoom}
            onSuccess={handleBookingSuccess}
            onCancel={() => {
              setCurrentView("home")
              setSelectedRoom(null)
            }}
          />
        )

      case "profile":
        if (!currentUser) {
          setCurrentView("auth")
          return <Auth onSuccess={handleAuthSuccess} />
        }
        return (
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
                  onClick={() => setCurrentView("home")}
                  className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return <HomePage onBookRoom={handleBookRoom} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - only show if not in auth view */}
      {currentView !== "auth" && (
        <Header currentView={currentView} setCurrentView={setCurrentView} userRole={userRole} />
      )}

      {/* Main Content */}
      <main className={currentView !== "auth" ? "pt-0" : ""}>{renderCurrentView()}</main>

      {/* Toast Notifications */}
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
