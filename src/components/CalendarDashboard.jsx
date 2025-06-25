"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import { FaCalendarAlt, FaSpinner, FaFilter } from "react-icons/fa"
import { showErrorAlert } from "../utils/sweetAlert"
import { useBackButton } from "../hooks/UseBackButton"

const CalendarDashboard = ({ userRole = "customer" }) => {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [venues, setVenues] = useState([])
  const [selectedVenue, setSelectedVenue] = useState("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useBackButton(() => {
    window.location.href = "/dashboard"
    return true
  })

  useEffect(() => {
    fetchData()
  }, [currentUser, selectedVenue])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchBookings(), fetchVenues()])
    } catch (error) {
      console.error("Error fetching data:", error)
      showErrorAlert("Gagal Memuat Data", "Terjadi kesalahan saat memuat data kalender")
    }
    setLoading(false)
  }

  const fetchBookings = async () => {
    try {
      let q = collection(db, "bookings")
      if (userRole === "customer" && currentUser) {
        q = query(q, where("userId", "==", currentUser.uid))
      }

      const querySnapshot = await getDocs(q)
      const bookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setBookings(
        bookingsData.filter(
          (booking) => booking.status === "approved" && (selectedVenue === "all" || booking.venueId === selectedVenue),
        ),
      )
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const fetchVenues = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "venues"))
      const venuesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setVenues(venuesData)
    } catch (error) {
      console.error("Error fetching venues:", error)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const getBookingForDate = (date) => {
    if (!date) return null
    return bookings.find((booking) => {
      const bookingDate = booking.eventDate?.toDate
        ? booking.eventDate.toDate()
        : new Date(booking.eventDate || booking.checkIn)
      return bookingDate.toDateString() === date.toDateString()
    })
  }

  const getDayStatus = (date) => {
    if (!date) return "empty"
    const today = new Date()
    const booking = getBookingForDate(date)
    if (date < today) return "past"
    if (booking) return "booked"
    return "available"
  }

  const getDayClasses = (status) => {
    const baseClasses =
      "calendar-day w-full h-12 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
    switch (status) {
      case "empty":
        return `${baseClasses} invisible`
      case "past":
        return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`
      case "booked":
        return `${baseClasses} bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200`
      case "available":
        return `${baseClasses} bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200`
      default:
        return baseClasses
    }
  }

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  if (loading) {
    return (
      <div className="calendar-loading flex items-center justify-center py-12 mobile-loading">
        <FaSpinner className="animate-spin text-4xl mobile-text-2xl text-blue-500" />
      </div>
    )
  }

  return (
    <div className="calendar-dashboard space-y-6 mobile-space-y-6">
      <div className="calendar-header bg-white rounded-2xl p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mobile-space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl mobile-text-xl font-bold text-gray-900 mb-2 mobile-mb-4">
              <FaCalendarAlt className="inline mr-3 text-blue-600 mobile-icon-base" />
              Kalender Reservasi
            </h2>
            <p className="text-gray-600 mobile-text-sm">
              {userRole === "admin" ? "Lihat semua reservasi yang disetujui" : "Lihat reservasi Anda"}
            </p>
          </div>
          <div className="venue-filter flex items-center space-x-2 mobile-space-x-2">
            <FaFilter className="text-gray-400 mobile-icon-sm" />
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="px-4 py-2 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="calendar-container bg-white rounded-2xl p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-card">
        <div className="calendar-nav flex items-center justify-between mb-6 mobile-mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="nav-button px-4 py-2 mobile-button-small bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors mobile-touch-target"
          >
            ← Sebelumnya
          </button>
          <h3 className="month-title text-xl mobile-text-lg font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="nav-button px-4 py-2 mobile-button-small bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors mobile-touch-target"
          >
            Selanjutnya →
          </button>
        </div>

        <div className="calendar-grid grid grid-cols-7 gap-2 mobile-grid-7 mb-4 mobile-mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="day-header text-center font-semibold text-gray-600 py-2 mobile-py-2 mobile-text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid grid grid-cols-7 gap-2 mobile-grid-7">
          {getDaysInMonth(currentMonth).map((date, index) => {
            const status = getDayStatus(date)
            const booking = getBookingForDate(date)
            return (
              <div
                key={index}
                className={getDayClasses(status)}
                title={booking ? `${booking.eventName} - ${booking.venueName}` : ""}
              >
                {date && (
                  <>
                    <span className="day-number mobile-text-sm">{date.getDate()}</span>
                    {booking && <div className="booking-indicator w-2 h-2 bg-red-500 rounded-full ml-1"></div>}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="calendar-legend flex flex-wrap items-center justify-center gap-6 mobile-grid-3 mt-6 mobile-mt-4 pt-6 mobile-pt-4 border-t border-gray-200">
          <div className="legend-item flex items-center space-x-2 mobile-space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-sm mobile-text-xs text-gray-600">Tersedia</span>
          </div>
          <div className="legend-item flex items-center space-x-2 mobile-space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-sm mobile-text-xs text-gray-600">Sudah Dipesan</span>
          </div>
          <div className="legend-item flex items-center space-x-2 mobile-space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-sm mobile-text-xs text-gray-600">Tanggal Lalu</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarDashboard