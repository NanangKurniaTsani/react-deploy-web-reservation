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
      <div className="customer-bookings-loading customer-bookings-loading-container customer-bookings-loading-responsive flex items-center justify-center min-h-[400px] mobile-loading">
        <div className="customer-bookings-loading-content customer-bookings-loading-content-responsive text-center">
          <FaSpinner className="customer-bookings-loading-spinner customer-bookings-loading-spinner-responsive animate-spin text-4xl mobile-text-2xl text-blue-500 mx-auto mb-4 mobile-mb-4" />
          <p className="customer-bookings-loading-text customer-bookings-loading-text-responsive text-gray-600 text-base mobile-text-base">
            Memuat reservasi Anda...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-bookings customer-bookings-container customer-bookings-responsive container mx-auto px-4 py-6 sm:py-8 mobile-px-4 mobile-py-6">
      <div className="customer-bookings-header customer-bookings-header-container customer-bookings-header-responsive mb-6 sm:mb-8 mobile-mb-6">
        <h1 className="customer-bookings-title customer-bookings-title-responsive text-2xl sm:text-3xl mobile-text-2xl font-bold text-gray-900 mb-2">
          Reservasi Saya
        </h1>
        <p className="customer-bookings-subtitle customer-bookings-subtitle-responsive text-gray-600 text-base mobile-text-base">
          Kelola dan lihat status reservasi venue Anda
        </p>
      </div>

      <div className="customer-bookings-list customer-bookings-list-container customer-bookings-list-responsive space-y-4 sm:space-y-6 mobile-space-y-4">
        {bookings.length === 0 ? (
          <div className="customer-bookings-empty customer-bookings-empty-container customer-bookings-empty-responsive text-center py-12 mobile-py-6">
            <FaCalendarAlt className="customer-bookings-empty-icon customer-bookings-empty-icon-responsive text-6xl mobile-text-2xl text-gray-300 mx-auto mb-4 mobile-mb-4" />
            <h3 className="customer-bookings-empty-title customer-bookings-empty-title-responsive text-xl mobile-text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Reservasi
            </h3>
            <p className="customer-bookings-empty-text customer-bookings-empty-text-responsive text-gray-600 mb-6 mobile-mb-6 text-base mobile-text-base">
              Anda belum memiliki reservasi venue
            </p>
            <button
              onClick={() => window.location.reload()}
              className="customer-bookings-empty-btn customer-bookings-empty-btn-responsive bg-blue-500 text-white px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold mobile-button"
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
                className="customer-bookings-item customer-bookings-item-card customer-bookings-item-responsive bg-white rounded-2xl p-4 sm:p-6 mobile-p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 mobile-card"
              >
                <div className="customer-bookings-item-header customer-bookings-item-header-responsive flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 mobile-mb-4 gap-4 mobile-space-y-4 sm:space-y-0">
                  <div className="customer-bookings-item-info customer-bookings-item-info-responsive flex-1 min-w-0">
                    <div className="customer-bookings-item-title-section customer-bookings-item-title-section-responsive flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 mobile-mb-3 gap-2 mobile-space-y-2 sm:space-y-0">
                      <h3 className="customer-bookings-item-title customer-bookings-item-title-responsive text-lg sm:text-xl mobile-text-lg font-bold text-gray-900 truncate">
                        {booking.eventName || "Event"}
                      </h3>
                      <div className="customer-bookings-item-status customer-bookings-item-status-responsive flex items-center space-x-2 mobile-space-x-2">
                        <span
                          className={`customer-bookings-status-badge customer-bookings-status-badge-responsive px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm mobile-status-badge font-medium border flex items-center space-x-1 mobile-space-x-2 ${getStatusColor(booking.status)}`}
                        >
                          <StatusIcon className="customer-bookings-status-icon customer-bookings-status-icon-responsive text-xs sm:text-sm mobile-icon-xs" />
                          <span>{getStatusText(booking.status)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="customer-bookings-item-details customer-bookings-item-details-responsive space-y-2 mobile-space-y-2">
                      <p className="customer-bookings-item-detail customer-bookings-item-detail-responsive text-gray-600 flex items-center text-sm sm:text-base mobile-text-sm">
                        <FaCalendarAlt className="customer-bookings-item-detail-icon customer-bookings-item-detail-icon-responsive mr-2 text-gray-400 flex-shrink-0 mobile-icon-sm" />
                        <span className="customer-bookings-item-detail-label customer-bookings-item-detail-label-responsive font-semibold mr-2">
                          Venue:
                        </span>
                        <span className="customer-bookings-item-detail-value customer-bookings-item-detail-value-responsive truncate">
                          {booking.roomName || booking.venueName}
                        </span>
                      </p>
                      <p className="customer-bookings-item-detail customer-bookings-item-detail-responsive text-gray-600 flex items-center text-sm sm:text-base mobile-text-sm">
                        <FaCalendarAlt className="customer-bookings-item-detail-icon customer-bookings-item-detail-icon-responsive mr-2 text-gray-400 flex-shrink-0 mobile-icon-sm" />
                        <span className="customer-bookings-item-detail-label customer-bookings-item-detail-label-responsive font-semibold mr-2">
                          Tanggal:
                        </span>
                        <span className="customer-bookings-item-detail-value customer-bookings-item-detail-value-responsive truncate">
                          {formatDate(booking.eventDate || booking.date)}
                        </span>
                      </p>
                      {booking.totalAmount && (
                        <p className="customer-bookings-item-detail customer-bookings-item-detail-responsive text-gray-600 flex items-center text-sm sm:text-base mobile-text-sm">
                          <span className="customer-bookings-item-detail-label customer-bookings-item-detail-label-responsive font-semibold mr-2">
                            Total:
                          </span>
                          <span className="customer-bookings-item-detail-value customer-bookings-item-detail-value-responsive font-bold text-blue-600">
                            Rp {booking.totalAmount.toLocaleString("id-ID")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.status === "rejected" && booking.rejectionReason && (
                  <div className="customer-bookings-rejection customer-bookings-rejection-container customer-bookings-rejection-responsive mb-4 mobile-mb-4 p-3 mobile-p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="customer-bookings-rejection-label customer-bookings-rejection-label-responsive text-red-700 font-semibold mb-1 text-sm mobile-text-sm">
                      Alasan Penolakan:
                    </div>
                    <div className="customer-bookings-rejection-text customer-bookings-rejection-text-responsive text-red-800 text-sm mobile-text-sm">
                      {booking.rejectionReason}
                    </div>
                  </div>
                )}

                <div className="customer-bookings-item-footer customer-bookings-item-footer-responsive flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 gap-3 mobile-space-y-3 sm:space-y-0">
                  <div className="customer-bookings-item-created customer-bookings-item-created-responsive text-xs sm:text-sm mobile-text-xs text-gray-500">
                    Dibuat: {formatDate(booking.createdAt)}
                  </div>
                  <button
                    onClick={() => handleViewDetail(booking)}
                    className="customer-bookings-item-btn customer-bookings-item-btn-responsive bg-blue-500 text-white px-4 py-2 mobile-px-4 mobile-py-2 rounded-xl hover:bg-blue-600 transition-colors font-semibold text-sm sm:text-base mobile-text-sm mobile-button"
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
        <div className="customer-bookings-modal customer-bookings-modal-overlay customer-bookings-modal-responsive fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-0 z-50 overflow-y-auto">
          <div className="customer-bookings-modal-content customer-bookings-modal-content-responsive w-full min-h-screen sm:min-h-0 sm:max-w-4xl sm:mx-4 sm:my-4">
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
