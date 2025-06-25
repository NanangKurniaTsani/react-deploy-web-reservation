"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import ReservationCard from "./ReservationCard"
import { FaSpinner, FaCalendarAlt, FaCheckCircle, FaClock, FaTimes } from "react-icons/fa"
import { useBackButton } from "../hooks/UseBackButton"

const CustomerBookings = () => {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useBackButton(() => {
    if (showDetailModal) {
      setShowDetailModal(false)
      setSelectedBooking(null)
      return true
    }
    window.location.href = "/dashboard"
    return true
  })

  useEffect(() => {
    if (!currentUser) return

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("userEmail", "==", currentUser.email),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingsData = []
        snapshot.forEach((doc) => {
          bookingsData.push({
            id: doc.id,
            ...doc.data(),
          })
        })
        setBookings(bookingsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching bookings:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [currentUser])

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Menunggu Verifikasi"
      case "approved":
        return "Disetujui"
      case "rejected":
        return "Ditolak"
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return FaClock
      case "approved":
        return FaCheckCircle
      case "rejected":
        return FaTimes
      default:
        return FaCalendarAlt
    }
  }

  const formatDate = (date) => {
    if (!date) return "-"
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] mobile-loading">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mobile-text-2xl text-blue-500 mx-auto mb-4 mobile-mb-4" />
          <p className="text-gray-600 text-base mobile-text-base">Memuat reservasi Anda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 mobile-px-4 mobile-py-6">
      <div className="mb-6 sm:mb-8 mobile-mb-6">
        <h1 className="text-2xl sm:text-3xl mobile-text-2xl font-bold text-gray-900 mb-2">Reservasi Saya</h1>
        <p className="text-gray-600 text-base mobile-text-base">Kelola dan lihat status reservasi venue Anda</p>
      </div>

      <div className="space-y-4 sm:space-y-6 mobile-space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12 mobile-py-6">
            <FaCalendarAlt className="text-6xl mobile-text-2xl text-gray-300 mx-auto mb-4 mobile-mb-4" />
            <h3 className="text-xl mobile-text-lg font-semibold text-gray-900 mb-2">Belum Ada Reservasi</h3>
            <p className="text-gray-600 mb-6 mobile-mb-6 text-base mobile-text-base">
              Anda belum memiliki reservasi venue
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold mobile-button"
            >
              Buat Reservasi Pertama
            </button>
          </div>
        ) : (
          bookings.map((booking) => {
            const StatusIcon = getStatusIcon(booking.status)
            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-4 sm:p-6 mobile-p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 mobile-card"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 mobile-mb-4 gap-4 mobile-space-y-4 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 mobile-mb-3 gap-2 mobile-space-y-2 sm:space-y-0">
                      <h3 className="text-lg sm:text-xl mobile-text-lg font-bold text-gray-900 truncate">
                        {booking.eventName || "Event"}
                      </h3>
                      <div className="flex items-center space-x-2 mobile-space-x-2">
                        <span
                          className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm mobile-status-badge font-medium border flex items-center space-x-1 mobile-space-x-2 ${getStatusColor(booking.status)}`}
                        >
                          <StatusIcon className="text-xs sm:text-sm mobile-icon-xs" />
                          <span>{getStatusText(booking.status)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mobile-space-y-2">
                      <p className="text-gray-600 flex items-center text-sm sm:text-base mobile-text-sm">
                        <FaCalendarAlt className="mr-2 text-gray-400 flex-shrink-0 mobile-icon-sm" />
                        <span className="font-semibold mr-2">Venue:</span>
                        <span className="truncate">{booking.roomName || booking.venueName}</span>
                      </p>
                      <p className="text-gray-600 flex items-center text-sm sm:text-base mobile-text-sm">
                        <FaCalendarAlt className="mr-2 text-gray-400 flex-shrink-0 mobile-icon-sm" />
                        <span className="font-semibold mr-2">Tanggal:</span>
                        <span className="truncate">{formatDate(booking.eventDate || booking.date)}</span>
                      </p>
                      {booking.totalAmount && (
                        <p className="text-gray-600 flex items-center text-sm sm:text-base mobile-text-sm">
                          <span className="font-semibold mr-2">Total:</span>
                          <span className="font-bold text-blue-600">
                            Rp {booking.totalAmount.toLocaleString("id-ID")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.status === "rejected" && booking.rejectionReason && (
                  <div className="mb-4 mobile-mb-4 p-3 mobile-p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-red-700 font-semibold mb-1 text-sm mobile-text-sm">Alasan Penolakan:</div>
                    <div className="text-red-800 text-sm mobile-text-sm">{booking.rejectionReason}</div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 gap-3 mobile-space-y-3 sm:space-y-0">
                  <div className="text-xs sm:text-sm mobile-text-xs text-gray-500">
                    Dibuat: {formatDate(booking.createdAt)}
                  </div>
                  <button
                    onClick={() => handleViewDetail(booking)}
                    className="bg-blue-500 text-white px-4 py-2 mobile-px-4 mobile-py-2 rounded-xl hover:bg-blue-600 transition-colors font-semibold text-sm sm:text-base mobile-text-sm mobile-button"
                  >
                    Lihat Detail & Download
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-0 z-50 overflow-y-auto">
          <div className="w-full min-h-screen sm:min-h-0 sm:max-w-4xl sm:mx-4 sm:my-4">
            <ReservationCard
              booking={selectedBooking}
              onClose={() => {
                setShowDetailModal(false)
                setSelectedBooking(null)
              }}
              userRole="customer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerBookings