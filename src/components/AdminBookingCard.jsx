"use client"

import { useState } from "react"
import { FaCalendar, FaUsers, FaMapMarkerAlt, FaCheck, FaTimes, FaSpinner } from "react-icons/fa"

const AdminBookingCard = ({ booking, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700"
      case "approved":
        return "bg-emerald-100 text-emerald-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
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
    await onApprove(booking.id)
    setLoading(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Mohon berikan alasan penolakan")
      return
    }
    setLoading(true)
    await onReject(booking.id, rejectionReason)
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{booking.eventName || "Event"}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Email:</strong> {booking.userEmail}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Kamar:</strong> {booking.roomName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendar className="mr-2 text-gray-400" />
            <div>
              <div>{formatDate(booking.eventDate)}</div>
              <div className="text-xs">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="mr-2 text-gray-400" />
            <span>{booking.guestCount || 0} tamu</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-gray-400" />
            <span>{booking.roomName}</span>
          </div>
        </div>

        {booking.totalAmount && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl">
            <div className="text-sm text-gray-600">Total Pembayaran</div>
            <div className="text-lg font-bold text-blue-600">Rp {booking.totalAmount.toLocaleString("id-ID")}</div>
          </div>
        )}

        {booking.specialRequests && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Permintaan Khusus:</div>
            <div className="text-sm text-gray-800">{booking.specialRequests}</div>
          </div>
        )}

        {booking.status === "rejected" && booking.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl">
            <div className="text-sm text-red-600 mb-1">Alasan Penolakan:</div>
            <div className="text-sm text-red-800">{booking.rejectionReason}</div>
          </div>
        )}

        {booking.status === "pending" && (
          <div className="flex space-x-3">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              <span>Setujui</span>
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <FaTimes />
              <span>Tolak</span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          Dibuat: {formatDate(booking.createdAt)}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tolak Reservasi</h3>
            <p className="text-sm text-gray-600 mb-4">Berikan alasan penolakan untuk reservasi ini:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
              placeholder="Masukkan alasan penolakan..."
              required
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Menolak..." : "Tolak Reservasi"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason("")
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminBookingCard
