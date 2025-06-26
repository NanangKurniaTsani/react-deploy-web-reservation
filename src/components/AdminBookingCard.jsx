"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { useBackButton } from "../hooks/UseBackButton.js"
import {
  FaCalendar,
  FaUsers,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaMoneyBillWave,
  FaClock,
  FaEye,
  FaDownload,
  FaPhone,
  FaUser,
  FaBuilding,
} from "react-icons/fa"
import ReservationCard from "./ReservationCard"

const AdminBookingCard = ({ booking, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(false)

  useBackButton(() => {
    if (showDetailModal) {
      setShowDetailModal(false)
    } else if (showRejectModal) {
      setShowRejectModal(false)
    }
  })

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
        return "Menunggu"
      case "approved":
        return "Disetujui"
      case "rejected":
        return "Ditolak"
      default:
        return "Unknown"
    }
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      if (onApprove) await onApprove(booking.id)
    } catch (error) {
      console.error("Error approving booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Mohon berikan alasan penolakan")
      return
    }
    setLoading(true)
    try {
      if (onReject) await onReject(booking.id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason("")
    } catch (error) {
      console.error("Error rejecting booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return "-"
    try {
      const d = date.toDate ? date.toDate() : new Date(date)
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error ("Tanggal tidak valid",error)
    }
  }

  const formatTime = (time) => {
    if (!time) return "-"
    return time
  }

  return (
    <>
      <div className="admin-booking-card admin-booking-card-container admin-booking-card-responsive bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div className="admin-booking-header admin-booking-header-container admin-booking-header-responsive flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
          <div className="admin-booking-info admin-booking-info-container admin-booking-info-responsive flex-1 min-w-0">
            <div className="admin-booking-title-section admin-booking-title-responsive flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
              <h3 className="admin-booking-title admin-booking-title-text admin-booking-title-responsive text-lg sm:text-xl font-bold text-gray-900 truncate">
                {booking.eventName || booking.serviceName || "Event"}
              </h3>
              <div className="admin-booking-actions admin-booking-actions-container admin-booking-actions-responsive flex items-center space-x-2">
                <span
                  className={`admin-booking-status admin-booking-status-badge admin-booking-status-responsive px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(booking.status)}`}
                >
                  {getStatusText(booking.status)}
                </span>
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="admin-booking-detail-btn admin-booking-detail-btn-responsive admin-touch-target w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center"
                  title="Lihat Detail & Download"
                >
                  <FaEye className="admin-booking-icon admin-booking-icon-responsive" />
                </button>
              </div>
            </div>
            <div className="admin-booking-details admin-booking-details-container admin-booking-details-responsive space-y-2">
              <p className="admin-booking-detail-item admin-booking-detail-responsive text-gray-600 flex items-center text-sm sm:text-base">
                <FaUser className="admin-booking-detail-icon admin-booking-detail-icon-responsive mr-2 text-gray-400 flex-shrink-0" />
                <span className="admin-booking-detail-label admin-booking-detail-label-responsive font-semibold mr-2">
                  Email:
                </span>
                <span className="admin-booking-detail-value admin-booking-detail-value-responsive truncate">
                  {booking.userEmail}
                </span>
              </p>
              <p className="admin-booking-detail-item admin-booking-detail-responsive text-gray-600 flex items-center text-sm sm:text-base">
                <FaBuilding className="admin-booking-detail-icon admin-booking-detail-icon-responsive mr-2 text-gray-400 flex-shrink-0" />
                <span className="admin-booking-detail-label admin-booking-detail-label-responsive font-semibold mr-2">
                  {booking.type === "venue" ? "Venue" : "Layanan"}:
                </span>
                <span className="admin-booking-detail-value admin-booking-detail-value-responsive truncate">
                  {booking.roomName || booking.venueName || booking.serviceName}
                </span>
              </p>
              {booking.contactPerson && (
                <p className="admin-booking-detail-item admin-booking-detail-responsive text-gray-600 flex items-center text-sm sm:text-base">
                  <FaUser className="admin-booking-detail-icon admin-booking-detail-icon-responsive mr-2 text-gray-400 flex-shrink-0" />
                  <span className="admin-booking-detail-label admin-booking-detail-label-responsive font-semibold mr-2">
                    Contact:
                  </span>
                  <span className="admin-booking-detail-value admin-booking-detail-value-responsive truncate">
                    {booking.contactPerson}
                  </span>
                </p>
              )}
              {booking.phoneNumber && (
                <p className="admin-booking-detail-item admin-booking-detail-responsive text-gray-600 flex items-center text-sm sm:text-base">
                  <FaPhone className="admin-booking-detail-icon admin-booking-detail-icon-responsive mr-2 text-gray-400 flex-shrink-0" />
                  <span className="admin-booking-detail-label admin-booking-detail-label-responsive font-semibold mr-2">
                    Telepon:
                  </span>
                  <span className="admin-booking-detail-value admin-booking-detail-value-responsive truncate">
                    {booking.phoneNumber}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="admin-booking-stats admin-booking-stats-container admin-booking-stats-responsive grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="admin-booking-stat admin-booking-stat-date admin-booking-stat-responsive bg-green-50 p-4 rounded-2xl">
            <div className="admin-booking-stat-header admin-booking-stat-header-responsive flex items-center text-green-700 mb-2">
              <FaCalendar className="admin-booking-stat-icon admin-booking-stat-icon-responsive mr-2 sm:mr-3 text-green-600" />
              <span className="admin-booking-stat-label admin-booking-stat-label-responsive font-semibold text-sm sm:text-base">
                Tanggal Acara
              </span>
            </div>
            <div className="admin-booking-stat-value admin-booking-stat-value-responsive text-gray-900 font-medium text-sm sm:text-base">
              {formatDate(booking.eventDate || booking.date)}
            </div>
            <div className="admin-booking-stat-sub admin-booking-stat-sub-responsive text-xs sm:text-sm text-gray-600 mt-1">
              {booking.timeSlot || formatTime(booking.startTime || booking.time)}
              {booking.endTime && ` - ${formatTime(booking.endTime)}`}
            </div>
          </div>

          <div className="admin-booking-stat admin-booking-stat-guests admin-booking-stat-responsive bg-blue-50 p-4 rounded-2xl">
            <div className="admin-booking-stat-header admin-booking-stat-header-responsive flex items-center text-blue-700 mb-2">
              <FaUsers className="admin-booking-stat-icon admin-booking-stat-icon-responsive mr-2 sm:mr-3 text-blue-600" />
              <span className="admin-booking-stat-label admin-booking-stat-label-responsive font-semibold text-sm sm:text-base">
                Jumlah Tamu
              </span>
            </div>
            <div className="admin-booking-stat-value admin-booking-stat-value-responsive text-gray-900 font-medium text-sm sm:text-base">
              {booking.guestCount || booking.guests || 0} {booking.type === "venue" ? "tamu" : "orang"}
            </div>
            {booking.setupType && (
              <div className="admin-booking-stat-sub admin-booking-stat-sub-responsive text-xs sm:text-sm text-blue-600 mt-1">
                {booking.setupType}
              </div>
            )}
          </div>

          <div className="admin-booking-stat admin-booking-stat-location admin-booking-stat-responsive bg-purple-50 p-4 rounded-2xl">
            <div className="admin-booking-stat-header admin-booking-stat-header-responsive flex items-center text-purple-700 mb-2">
              <FaMapMarkerAlt className="admin-booking-stat-icon admin-booking-stat-icon-responsive mr-2 sm:mr-3 text-purple-600" />
              <span className="admin-booking-stat-label admin-booking-stat-label-responsive font-semibold text-sm sm:text-base">
                Lokasi
              </span>
            </div>
            <div className="admin-booking-stat-value admin-booking-stat-value-responsive text-gray-900 font-medium text-sm sm:text-base">
              {booking.roomName || booking.venueName || booking.serviceName}
            </div>
            <div className="admin-booking-stat-sub admin-booking-stat-sub-responsive text-xs sm:text-sm text-purple-600 mt-1">
              King Royal Hotel - Brebes
            </div>
          </div>
        </div>

        {booking.totalAmount && (
          <div className="admin-booking-payment admin-booking-payment-container admin-booking-payment-responsive mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="admin-booking-payment-content admin-booking-payment-content-responsive flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="admin-booking-payment-info admin-booking-payment-info-responsive flex items-center">
                <FaMoneyBillWave className="admin-booking-payment-icon admin-booking-payment-icon-responsive text-green-600 text-lg sm:text-xl mr-3" />
                <div className="admin-booking-payment-details admin-booking-payment-details-responsive">
                  <span className="admin-booking-payment-label admin-booking-payment-label-responsive text-green-800 font-semibold text-sm sm:text-base">
                    Total Pembayaran
                  </span>
                  {booking.paymentMethod && (
                    <p className="admin-booking-payment-method admin-booking-payment-method-responsive text-xs sm:text-sm text-green-600">
                      {booking.paymentMethod.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="admin-booking-payment-amount admin-booking-payment-amount-responsive text-xl sm:text-2xl font-bold text-green-700">
                Rp {booking.totalAmount.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        )}

        {booking.specialRequests && (
          <div className="admin-booking-requests admin-booking-requests-container admin-booking-requests-responsive mb-6 p-4 bg-gray-50 rounded-2xl">
            <div className="admin-booking-requests-label admin-booking-requests-label-responsive text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Permintaan Khusus:
            </div>
            <div className="admin-booking-requests-text admin-booking-requests-text-responsive text-gray-800 leading-relaxed text-sm sm:text-base">
              {booking.specialRequests}
            </div>
          </div>
        )}

        {booking.status === "rejected" && booking.rejectionReason && (
          <div className="admin-booking-rejection admin-booking-rejection-container admin-booking-rejection-responsive mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="admin-booking-rejection-label admin-booking-rejection-label-responsive text-red-700 font-semibold mb-2 text-sm sm:text-base">
              Alasan Penolakan:
            </div>
            <div className="admin-booking-rejection-text admin-booking-rejection-text-responsive text-red-800 text-sm sm:text-base">
              {booking.rejectionReason}
            </div>
          </div>
        )}

        {booking.status === "pending" && (
          <div className="admin-booking-buttons admin-booking-buttons-container admin-booking-buttons-responsive flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="admin-booking-approve-btn admin-booking-approve-btn-responsive admin-touch-target flex-1 bg-emerald-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-sm sm:text-base"
            >
              {loading ? (
                <FaSpinner className="admin-booking-spinner admin-booking-spinner-responsive animate-spin" />
              ) : (
                <FaCheck className="admin-booking-check-icon admin-booking-check-icon-responsive" />
              )}
              <span>Setujui</span>
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="admin-booking-reject-btn admin-booking-reject-btn-responsive admin-touch-target flex-1 bg-red-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-sm sm:text-base"
            >
              <FaTimes className="admin-booking-times-icon admin-booking-times-icon-responsive" />
              <span>Tolak</span>
            </button>
          </div>
        )}

        <div className="admin-booking-footer admin-booking-footer-container admin-booking-footer-responsive pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 gap-2">
          <div className="admin-booking-created admin-booking-created-responsive flex items-center">
            <FaClock className="admin-booking-clock-icon admin-booking-clock-icon-responsive mr-2" />
            <span>Dibuat: {formatDate(booking.createdAt)}</span>
          </div>
          <button
            onClick={() => setShowDetailModal(true)}
            className="admin-booking-download-btn admin-booking-download-btn-responsive admin-touch-target flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto"
          >
            <FaDownload className="admin-booking-download-icon admin-booking-download-icon-responsive" />
            <span>Lihat & Download</span>
          </button>
        </div>
      </div>

      {showRejectModal && (
        <div className="admin-booking-modal admin-booking-modal-overlay admin-booking-modal-responsive fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="admin-booking-modal-content admin-booking-modal-content-responsive bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md">
            <h3 className="admin-booking-modal-title admin-booking-modal-title-responsive text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Tolak Reservasi
            </h3>
            <p className="admin-booking-modal-text admin-booking-modal-text-responsive text-gray-600 mb-6 text-sm sm:text-base">
              Berikan alasan penolakan untuk reservasi ini:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="admin-booking-modal-textarea admin-booking-modal-textarea-responsive w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              rows="4"
              placeholder="Masukkan alasan penolakan..."
              required
            />
            <div className="admin-booking-modal-buttons admin-booking-modal-buttons-responsive flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="admin-booking-modal-reject-btn admin-booking-modal-reject-btn-responsive admin-touch-target flex-1 bg-red-500 text-white py-3 px-4 rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold text-sm sm:text-base"
              >
                {loading ? "Menolak..." : "Tolak Reservasi"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason("")
                }}
                className="admin-booking-modal-cancel-btn admin-booking-modal-cancel-btn-responsive admin-touch-target flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-2xl hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="admin-booking-detail-modal admin-booking-detail-modal-overlay admin-booking-detail-modal-responsive fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="admin-booking-detail-modal-content admin-booking-detail-modal-content-responsive max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <ReservationCard booking={booking} onClose={() => setShowDetailModal(false)} userRole="admin" />
          </div>
        </div>
      )}
    </>
  )
}

AdminBookingCard.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string,
    eventName: PropTypes.string,
    serviceName: PropTypes.string,
    userEmail: PropTypes.string,
    roomName: PropTypes.string,
    venueName: PropTypes.string,
    status: PropTypes.string.isRequired,
    eventDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    date: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    startTime: PropTypes.string,
    time: PropTypes.string,
    endTime: PropTypes.string,
    timeSlot: PropTypes.string,
    guestCount: PropTypes.number,
    guests: PropTypes.number,
    totalAmount: PropTypes.number,
    specialRequests: PropTypes.string,
    rejectionReason: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    contactPerson: PropTypes.string,
    phoneNumber: PropTypes.string,
    organization: PropTypes.string,
    setupType: PropTypes.string,
    paymentMethod: PropTypes.shape({
      name: PropTypes.string,
      accountNumber: PropTypes.string,
      accountName: PropTypes.string,
    }),
  }).isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
}

export default AdminBookingCard
