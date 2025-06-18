"use client"

import { useState } from "react"
import HomePage from "./HomePage"
import BookingForm from "./BookingForm"
import MyBookings from "./MyBookings"
import { FaArrowLeft } from "react-icons/fa"

const CustomerDashboard = () => {
  const [currentView, setCurrentView] = useState("home")
  const [selectedRoom, setSelectedRoom] = useState(null)

  const handleNavigation = (view, data = null) => {
    setCurrentView(view)
    if (data) {
      setSelectedRoom(data)
    }
  }

  const handleBack = () => {
    setCurrentView("home")
    setSelectedRoom(null)
  }

  const renderHeader = () => {
    if (currentView === "home") return null

    const titles = {
      reservations: "Buat Reservasi",
      mybookings: "Reservasi Saya",
      services: "Layanan Hotel",
      dining: "Restaurant & Bar",
      spa: "Spa & Wellness",
      facilities: "Fasilitas Hotel",
    }

    return (
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{titles[currentView] || "Serenity Resort"}</h1>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return <HomePage onNavigate={handleNavigation} />

      case "reservations":
        return (
          <div className="container mx-auto px-4 py-6">
            <BookingForm selectedRoom={selectedRoom} />
          </div>
        )

      case "mybookings":
        return (
          <div className="container mx-auto px-4 py-6">
            <MyBookings />
          </div>
        )

      case "services":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🛎️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Layanan Hotel</h3>
              <p className="text-gray-500">Fitur layanan hotel akan segera hadir.</p>
            </div>
          </div>
        )

      case "dining":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Restaurant & Bar</h3>
              <p className="text-gray-500">Informasi dining akan segera hadir.</p>
            </div>
          </div>
        )

      case "spa":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">💆</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Spa & Wellness</h3>
              <p className="text-gray-500">Layanan spa akan segera hadir.</p>
            </div>
          </div>
        )

      case "facilities":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🏊</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Fasilitas Hotel</h3>
              <p className="text-gray-500">Informasi fasilitas akan segera hadir.</p>
            </div>
          </div>
        )

      default:
        return <HomePage onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      {renderContent()}
    </div>
  )
}

export default CustomerDashboard
