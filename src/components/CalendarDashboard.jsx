"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import { FaCalendarAlt, FaSpinner, FaFilter } from "react-icons/fa"
import { showErrorAlert } from "../utils/sweetalert"
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
      "w-full h-12 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
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
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <FaCalendarAlt className="inline mr-3 text-blue-600" />
              Kalender Reservasi
            </h2>
            <p className="text-gray-600">
              {userRole === "admin" ? "Lihat semua reservasi yang disetujui" : "Lihat reservasi Anda"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
          >
            ← Sebelumnya
          </button>
          
          <div className="flex flex-col items-center mx-2 sm:mx-4">
            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {monthNames[currentMonth.getMonth()]}
            </h3>
            <span className="text-gray-600 text-sm sm:text-base">
              {currentMonth.getFullYear()}
            </span>
          </div>
          
          <button
            onClick={() => navigateMonth(1)}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
          >
            Selanjutnya →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
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
                    <span className="text-sm">
                      {date.getDate()}
                    </span>
                    {booking && (
                      <div className="w-2 h-2 bg-red-500 rounded-full ml-1"></div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">Tersedia</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-sm text-gray-600">
              Sudah Dipesan
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-sm text-gray-600">
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


export default CalendarDashboard