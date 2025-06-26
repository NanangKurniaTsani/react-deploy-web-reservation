"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import { FaCalendarAlt, FaSpinner, FaFilter } from "react-icons/fa"
import { showErrorAlert } from "../utils/sweetAlert"
import PropTypes from "prop-types"
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
      
      const uniqueVenues = venuesData.reduce((acc, venue) => {
        const existingVenue = acc.find(v => v.id === venue.id || v.name === venue.name)
        if (!existingVenue && venue.isActive !== false) {
          acc.push(venue)
        }
        return acc
      }, [])
      
      uniqueVenues.sort((a, b) => a.name.localeCompare(b.name))
      
      setVenues(uniqueVenues)
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
      "calendar-day calendar-day-base calendar-day-responsive w-full h-12 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer calendar-touch-target"
    switch (status) {
      case "empty":
        return `${baseClasses} calendar-day-empty invisible`
      case "past":
        return `${baseClasses} calendar-day-past bg-gray-100 text-gray-400 cursor-not-allowed`
      case "booked":
        return `${baseClasses} calendar-day-booked bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200`
      case "available":
        return `${baseClasses} calendar-day-available bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200`
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
      <div className="calendar-loading calendar-loading-container calendar-loading-responsive flex items-center justify-center py-12 mobile-loading">
        <FaSpinner className="calendar-loading-spinner animate-spin text-4xl mobile-text-2xl text-blue-500" />
      </div>
    )
  }

  return (
    <div className="calendar-dashboard calendar-dashboard-container calendar-dashboard-responsive space-y-6 mobile-space-y-6">
      <div className="calendar-header calendar-header-card calendar-header-responsive bg-white rounded-2xl p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-card">
        <div className="calendar-header-content calendar-header-flex calendar-header-mobile flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mobile-space-y-4 sm:space-y-0">
          <div className="calendar-header-info calendar-header-text-section">
            <h2 className="calendar-title calendar-title-responsive text-2xl mobile-text-xl font-bold text-gray-900 mb-2 mobile-mb-4">
              <FaCalendarAlt className="calendar-icon calendar-icon-responsive inline mr-3 text-blue-600 mobile-icon-base" />
              Kalender Reservasi
            </h2>
            <p className="calendar-subtitle calendar-subtitle-responsive text-gray-600 mobile-text-sm">
              {userRole === "admin" ? "Lihat semua reservasi yang disetujui" : "Lihat reservasi Anda"}
            </p>
          </div>
         <div className="venue-filter venue-filter-container venue-filter-responsive flex items-center space-x-2 mobile-space-x-2">
  <FaFilter className="venue-filter-icon venue-filter-icon-responsive text-gray-400 mobile-icon-sm" />
  <select
    value={selectedVenue}
    onChange={(e) => setSelectedVenue(e.target.value)}
    className="venue-filter-select venue-filter-select-responsive px-4 py-2 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="" disabled hidden>
      Semua Venue
    </option>
    <option value="all">Tampilkan Semua</option>
    {venues.map((venue) => (
      <option key={venue.id} value={venue.id}>
        {venue.name}
      </option>
    ))}
  </select>
</div>
        </div>
      </div>

      <div className="calendar-container calendar-main-container calendar-main-responsive bg-white rounded-2xl p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-card">
        <div className="calendar-nav calendar-nav-container calendar-nav-responsive flex items-center justify-between mb-6 mobile-mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="nav-button nav-button-prev nav-button-responsive px-4 py-2 mobile-button-small bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors mobile-touch-target"
          >
            ← Sebelumnya
          </button>
          <h3 className="month-title month-title-responsive text-xl mobile-text-lg font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="nav-button nav-button-next nav-button-responsive px-4 py-2 mobile-button-small bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors mobile-touch-target"
          >
            Selanjutnya →
          </button>
        </div>

        <div className="calendar-grid calendar-header-grid calendar-header-grid-responsive grid grid-cols-7 gap-2 mobile-grid-7 mb-4 mobile-mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="day-header day-header-cell day-header-responsive text-center font-semibold text-gray-600 py-2 mobile-py-2 mobile-text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid calendar-days-grid calendar-days-grid-responsive grid grid-cols-7 gap-2 mobile-grid-7">
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
                    <span className="day-number day-number-text day-number-responsive mobile-text-sm">
                      {date.getDate()}
                    </span>
                    {booking && (
                      <div className="booking-indicator booking-indicator-dot booking-indicator-responsive w-2 h-2 bg-red-500 rounded-full ml-1"></div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="calendar-legend calendar-legend-container calendar-legend-responsive flex flex-wrap items-center justify-center gap-6 mobile-grid-3 mt-6 mobile-mt-4 pt-6 mobile-pt-4 border-t border-gray-200">
          <div className="legend-item legend-item-available legend-item-responsive flex items-center space-x-2 mobile-space-x-2">
            <div className="legend-color legend-color-available legend-color-responsive w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="legend-text legend-text-responsive text-sm mobile-text-xs text-gray-600">Tersedia</span>
          </div>
          <div className="legend-item legend-item-booked legend-item-responsive flex items-center space-x-2 mobile-space-x-2">
            <div className="legend-color legend-color-booked legend-color-responsive w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="legend-text legend-text-responsive text-sm mobile-text-xs text-gray-600">
              Sudah Dipesan
            </span>
          </div>
          <div className="legend-item legend-item-past legend-item-responsive flex items-center space-x-2 mobile-space-x-2">
            <div className="legend-color legend-color-past legend-color-responsive w-4 h-4 bg-gray-100 rounded"></div>
            <span className="legend-text legend-text-responsive text-sm mobile-text-xs text-gray-600">
              Tanggal Lalu
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
CalendarDashboard.propTypes = {
  userRole: PropTypes.oneOf(["admin", "customer"]),
}

CalendarDashboard.defaultProps = {
  userRole: "customer",
}

export default CalendarDashboard