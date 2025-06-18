"use client"

import { FaTimes, FaDownload, FaCalendarAlt, FaUsers, FaMoneyBillWave } from "react-icons/fa"

const ReservationCard = ({ booking, onClose }) => {
  const formatDate = (date) => {
    if (!date) return "Tanggal tidak tersedia"

    try {
      if (date.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
      if (date instanceof Date) {
        return date.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
      return new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Tanggal tidak valid"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "approved":
        return "bg-emerald-100 text-emerald-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const handleDownload = () => {
    // Create a simple text file with booking details
    const bookingDetails = `
KARTU RESERVASI GRAND HOTEL
============================

Nama Acara: ${booking.eventName}
Ruangan: ${booking.roomName}
Tanggal Acara: ${formatDate(booking.eventDate)}
Jumlah Tamu: ${booking.guestCount} orang
Total Biaya: Rp ${booking.totalAmount?.toLocaleString("id-ID") || "0"}

Kontak:
Email: ${booking.userEmail}
Telepon: ${booking.phoneNumber || "Tidak tersedia"}

Status: ${getStatusText(booking.status)}
Tanggal Reservasi: ${formatDate(booking.createdAt)}
ID Reservasi: ${booking.id}

${booking.description ? `Deskripsi: ${booking.description}` : ""}
${booking.status === "rejected" && booking.rejectionReason ? `Alasan Penolakan: ${booking.rejectionReason}` : ""}

---
Terima kasih telah memilih Grand Hotel
Hubungi kami: info@grandhotel.com | (021) 123-4567
    `.trim()

    const blob = new Blob([bookingDetails], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kartu-reservasi-${booking.eventName.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Kartu Reservasi</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
            title="Download Kartu"
          >
            <FaDownload className="text-sm" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Hotel Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">GRAND HOTEL</h1>
          <p className="text-gray-600 text-sm">Jl. Sudirman No. 123, Jakarta Pusat</p>
          <p className="text-gray-600 text-sm">Telp: (021) 123-4567 | Email: info@grandhotel.com</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Detail Reservasi</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Acara:</span>
                <span className="font-medium text-gray-900">{booking.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Reservasi:</span>
                <span className="font-mono text-sm text-gray-900">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ruangan:</span>
                <span className="font-medium text-gray-900">{booking.roomName}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <FaCalendarAlt className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tanggal & Waktu Acara</p>
                <p className="font-medium text-gray-900">{formatDate(booking.eventDate)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-xl">
              <FaUsers className="text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Jumlah Tamu</p>
                <p className="font-medium text-gray-900">{booking.guestCount} orang</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
              <FaMoneyBillWave className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Biaya</p>
                <p className="font-bold text-purple-600 text-lg">
                  Rp {booking.totalAmount?.toLocaleString("id-ID") || "0"}
                </p>
              </div>
            </div>
          </div>

          {booking.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Deskripsi Acara</h4>
              <p className="text-gray-600 text-sm">{booking.description}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">Informasi Kontak</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">Email: {booking.userEmail}</p>
              {booking.phoneNumber && <p className="text-gray-600">Telepon: {booking.phoneNumber}</p>}
            </div>
          </div>

          {/* Booking Date */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>Reservasi dibuat pada: {formatDate(booking.createdAt)}</p>
          </div>

          {/* Status Messages */}
          {booking.status === "approved" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-700 text-sm">
                <span className="font-medium">✅ Reservasi Disetujui!</span>
                <br />
                Silakan lakukan pembayaran sesuai instruksi yang diberikan. Tunjukkan kartu ini saat check-in.
              </p>
            </div>
          )}

          {booking.status === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-700 text-sm">
                <span className="font-medium">⏳ Menunggu Verifikasi</span>
                <br />
                Reservasi Anda sedang dalam proses verifikasi. Kami akan menghubungi Anda segera.
              </p>
            </div>
          )}

          {booking.status === "rejected" && booking.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">
                <span className="font-medium">❌ Reservasi Ditolak</span>
                <br />
                Alasan: {booking.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
          <p>Terima kasih telah memilih Grand Hotel</p>
          <p>Untuk pertanyaan lebih lanjut, hubungi customer service kami</p>
        </div>
      </div>
    </div>
  )
}

export default ReservationCard
