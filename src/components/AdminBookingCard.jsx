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
    if (onApprove) await onApprove(booking.id)
    setLoading(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Mohon berikan alasan penolakan")
      return
    }
    setLoading(true)
    if (onReject) await onReject(booking.id, rejectionReason)
    setShowRejectModal(false)
    setRejectionReason("")
    setLoading(false)
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

  const formatTime = (time) => {
    if (!time) return "-"
    return time
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {booking.eventName || booking.serviceName || "Event"}
              </h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(booking.status)}`}
                >
                  {getStatusText(booking.status)}
                </span>
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center"
                  title="Lihat Detail & Download"
                >
                  <FaEye />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 flex items-center text-sm sm:text-base">
                <FaUser className="mr-2 text-gray-400 flex-shrink-0" />
                <span className="font-semibold mr-2">Email:</span>
                <span className="truncate">{booking.userEmail}</span>
              </p>
              <p className="text-gray-600 flex items-center text-sm sm:text-base">
                <FaBuilding className="mr-2 text-gray-400 flex-shrink-0" />
                <span className="font-semibold mr-2">{booking.type === "venue" ? "Venue" : "Layanan"}:</span>
                <span className="truncate">{booking.roomName || booking.venueName || booking.serviceName}</span>
              </p>
              {booking.contactPerson && (
                <p className="text-gray-600 flex items-center text-sm sm:text-base">
                  <FaUser className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold mr-2">Contact:</span>
                  <span className="truncate">{booking.contactPerson}</span>
                </p>
              )}
              {booking.phoneNumber && (
                <p className="text-gray-600 flex items-center text-sm sm:text-base">
                  <FaPhone className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold mr-2">Telepon:</span>
                  <span className="truncate">{booking.phoneNumber}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-2xl">
            <div className="flex items-center text-green-700 mb-2">
              <FaCalendar className="mr-2 sm:mr-3 text-green-600" />
              <span className="font-semibold text-sm sm:text-base">Tanggal Acara</span>
            </div>
            <div className="text-gray-900 font-medium text-sm sm:text-base">
              {formatDate(booking.eventDate || booking.date)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">
              {booking.timeSlot || formatTime(booking.startTime || booking.time)}
              {booking.endTime && ` - ${formatTime(booking.endTime)}`}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl">
            <div className="flex items-center text-blue-700 mb-2">
              <FaUsers className="mr-2 sm:mr-3 text-blue-600" />
              <span className="font-semibold text-sm sm:text-base">Jumlah Tamu</span>
            </div>
            <div className="text-gray-900 font-medium text-sm sm:text-base">
              {booking.guestCount || booking.guests || 0} {booking.type === "venue" ? "tamu" : "orang"}
            </div>
            {booking.setupType && <div className="text-xs sm:text-sm text-blue-600 mt-1">{booking.setupType}</div>}
          </div>

          <div className="bg-purple-50 p-4 rounded-2xl">
            <div className="flex items-center text-purple-700 mb-2">
              <FaMapMarkerAlt className="mr-2 sm:mr-3 text-purple-600" />
              <span className="font-semibold text-sm sm:text-base">Lokasi</span>
            </div>
            <div className="text-gray-900 font-medium text-sm sm:text-base">
              {booking.roomName || booking.venueName || booking.serviceName}
            </div>
            <div className="text-xs sm:text-sm text-purple-600 mt-1">King Royal Hotel</div>
          </div>
        </div>

        {booking.totalAmount && (
          <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-green-600 text-lg sm:text-xl mr-3" />
                <div>
                  <span className="text-green-800 font-semibold text-sm sm:text-base">Total Pembayaran</span>
                  {booking.paymentMethod && (
                    <p className="text-xs sm:text-sm text-green-600">{booking.paymentMethod.name}</p>
                  )}
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-700">
                Rp {booking.totalAmount.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        )}

        {booking.specialRequests && (
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
            <div className="text-gray-700 font-semibold mb-2 text-sm sm:text-base">Permintaan Khusus:</div>
            <div className="text-gray-800 leading-relaxed text-sm sm:text-base">{booking.specialRequests}</div>
          </div>
        )}

        {booking.status === "rejected" && booking.rejectionReason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="text-red-700 font-semibold mb-2 text-sm sm:text-base">Alasan Penolakan:</div>
            <div className="text-red-800 text-sm sm:text-base">{booking.rejectionReason}</div>
          </div>
        )}

        {booking.status === "pending" && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-emerald-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-sm sm:text-base"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              <span>Setujui</span>
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-sm sm:text-base"
            >
              <FaTimes />
              <span>Tolak</span>
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 gap-2">
          <div className="flex items-center">
            <FaClock className="mr-2" />
            <span>Dibuat: {formatDate(booking.createdAt)}</span>
          </div>
          <button
            onClick={() => setShowDetailModal(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto"
          >
            <FaDownload />
            <span>Lihat & Download</span>
          </button>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Tolak Reservasi</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Berikan alasan penolakan untuk reservasi ini:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              rows="4"
              placeholder="Masukkan alasan penolakan..."
              required
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 bg-red-500 text-white py-3 px-4 rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold text-sm sm:text-base"
              >
                {loading ? "Menolak..." : "Tolak Reservasi"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason("")
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-2xl hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="max-w-4xl w-full max-h-[95vh] overflow-y-auto">
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
    paymentMethod: PropTypes.object,
  }).isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
}

export default AdminBookingCard