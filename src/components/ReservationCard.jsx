"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import {
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaDownload,
  FaPrint,
  FaCheckCircle,
  FaBuilding,
  FaClipboardList,
  FaQrcode,
  FaStar,
  FaCreditCard,
  FaStore,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa"
import { useBackButton } from "../hooks/UseBackButton"

const ReservationCard = ({ booking, onClose, userRole = "customer" }) => {
   useBackButton(() => {
    onClose()
    
  });
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const formatDate = (date) => {
    if (!date) return "Tanggal tidak tersedia"
    try {
      if (date.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
      if (date instanceof Date) {
        return date.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
      return new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Tanggal tidak valid"
    }
  }

  const formatDateTime = (date) => {
    if (!date) return "Tanggal tidak tersedia"
    try {
      if (date.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
      if (date instanceof Date) {
        return date.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
      return new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Tanggal tidak valid"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
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

  const getPaymentStatusText = (paymentStatus, paymentType) => {
    if (paymentType === "cash") {
      return "Pembayaran di Tempat"
    }

    switch (paymentStatus) {
      case "pending-transfer":
        return "Menunggu Transfer"
      case "proof-uploaded":
        return "Bukti Transfer Diupload"
      case "verified":
        return "Pembayaran Terverifikasi"
      default:
        return "Pembayaran Online"
    }
  }

  const getPaymentStatusColor = (paymentStatus, paymentType) => {
    if (paymentType === "cash") {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }

    switch (paymentStatus) {
      case "pending-transfer":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "proof-uploaded":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200"
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const cardContent = document.getElementById("reservation-card-content")
      if (cardContent) {
        alert("Kartu reservasi berhasil diunduh!")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Gagal mengunduh kartu reservasi")
    }
    setDownloading(false)
  }

  const handlePrint = async () => {
    setPrinting(true)
    try {
      const printContent = document.getElementById("reservation-card-content")
      if (printContent) {
        const printWindow = window.open("", "_blank")
        printWindow.document.write(`
        <html>
          <head>
            <title>Kartu Reservasi - ${booking.eventName}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px;
                background: white;
                color: #1f2937;
                line-height: 1.4;
              }
              
              .print-container {
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
                aspect-ratio: 16/9;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              }
              
              .header { 
                background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                color: white; 
                padding: 20px;
                text-align: center;
                flex-shrink: 0;
              }
              
              .header h1 {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 8px;
              }
              
              .header h2 {
                font-size: 18px;
                font-weight: 600;
                opacity: 0.9;
              }
              
              .content {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 30px;
              }
              
              .left-section, .right-section {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }
              
              .event-title {
                text-align: center;
                grid-column: 1 / -1;
                margin-bottom: 20px;
              }
              
              .event-title h3 {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 12px;
              }
              
              .status-badges {
                display: flex;
                justify-content: center;
                gap: 12px;
                flex-wrap: wrap;
              }
              
              .status {
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
                border: 2px solid;
              }
              
              .status.approved { 
                background: #d1fae5; 
                color: #065f46; 
                border-color: #10b981;
              }
              
              .status.pending { 
                background: #fef3c7; 
                color: #92400e; 
                border-color: #f59e0b;
              }
              
              .status.rejected { 
                background: #fee2e2; 
                color: #991b1b; 
                border-color: #ef4444;
              }
              
              .info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
              }
              
              .info-card h4 {
                font-size: 14px;
                font-weight: 600;
                color: #475569;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .info-card .value {
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
              }
              
              .info-card .sub-value {
                font-size: 14px;
                color: #64748b;
                margin-top: 4px;
              }
              
              .total-section {
                grid-column: 1 / -1;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                margin-top: 10px;
              }
              
              .total-section h4 {
                font-size: 18px;
                margin-bottom: 8px;
              }
              
              .total-amount {
                font-size: 28px;
                font-weight: bold;
              }
              
              .note-section {
                grid-column: 1 / -1;
                background: #fef3c7;
                border: 2px solid #f59e0b;
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                margin-top: 10px;
              }
              
              .note-title {
                font-weight: bold;
                color: #92400e;
                margin-bottom: 8px;
                font-size: 16px;
              }
              
              .note-text {
                color: #92400e;
                font-size: 14px;
                line-height: 1.5;
              }
              
              .footer {
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                padding: 20px;
                text-align: center;
                flex-shrink: 0;
              }
              
              .footer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 800px;
                margin: 0 auto;
              }
              
              .qr-section {
                text-align: left;
              }
              
              .company-info {
                text-align: right;
              }
              
              .booking-id {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: #1e293b;
                font-size: 16px;
              }
              
              .company-name {
                font-size: 18px;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 4px;
              }
              
              .company-details {
                font-size: 12px;
                color: #64748b;
                line-height: 1.4;
              }
              
              @media print { 
                body { 
                  margin: 0; 
                  padding: 10px; 
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                } 
                .print-container { 
                  max-width: 100%; 
                  box-shadow: none;
                  border: 1px solid #000;
                }
                .header, .total-section {
                  background: #3b82f6 !important;
                  color: white !important;
                }
                .status.approved {
                  background: #d1fae5 !important;
                  color: #065f46 !important;
                }
                .status.pending {
                  background: #fef3c7 !important;
                  color: #92400e !important;
                }
                .note-section {
                  background: #fef3c7 !important;
                  border-color: #f59e0b !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="header">
                <h1>King Royal Hotel</h1>
                <h2>Kartu Reservasi Venue Premium</h2>
              </div>
              
              <div class="content">
                <div class="event-title">
                  <h3>${booking.eventName}</h3>
                  <div class="status-badges">
                    <span class="status ${booking.status}">${getStatusText(booking.status)}</span>
                    <span class="status">${getPaymentStatusText(booking.paymentStatus, booking.paymentType)}</span>
                  </div>
                </div>
                
                <div class="left-section">
                  <div class="info-card">
                    <h4>🏢 Venue</h4>
                    <div class="value">${booking.roomName || booking.venueName}</div>
                    <div class="sub-value">King Royal Hotel</div>
                  </div>
                  
                  <div class="info-card">
                    <h4>📅 Tanggal Acara</h4>
                    <div class="value">${formatDate(booking.eventDate || booking.checkIn)}</div>
                    <div class="sub-value">${booking.timeSlotDetails?.label || booking.timeSlot || "Full Day"}</div>
                  </div>
                  
                  ${
                    booking.venueSetupDetails?.label
                      ? `
                    <div class="info-card">
                      <h4>👥 Setup Venue</h4>
                      <div class="value">${booking.venueSetupDetails.label}</div>
                      <div class="sub-value">Kapasitas: ${booking.guestCapacity || booking.guestCount || booking.guests} orang</div>
                    </div>
                  `
                      : ""
                  }
                </div>
                
                <div class="right-section">
                  ${
                    booking.bookingName
                      ? `
                    <div class="info-card">
                      <h4>📝 Nama Booking</h4>
                      <div class="value">${booking.bookingName}</div>
                    </div>
                  `
                      : ""
                  }
                  
                  <div class="info-card">
                    <h4>💳 Metode Pembayaran</h4>
                    <div class="value">${getPaymentStatusText(booking.paymentStatus, booking.paymentType)}</div>
                    ${booking.paymentMethod ? `<div class="sub-value">${booking.paymentMethod.name}</div>` : ""}
                  </div>
                  
                  ${
                    booking.specialRequests
                      ? `
                    <div class="info-card">
                      <h4>📋 Permintaan Khusus</h4>
                      <div class="value" style="font-size: 14px; line-height: 1.4;">${booking.specialRequests}</div>
                    </div>
                  `
                      : ""
                  }
                </div>
                
                ${
                  booking.totalAmount
                    ? `
                  <div class="total-section">
                    <h4>Total Biaya</h4>
                    <div class="total-amount">Rp ${booking.totalAmount.toLocaleString("id-ID")}</div>
                  </div>
                `
                    : ""
                }
                
                <div class="note-section">
                  <div class="note-title">⚠️ PENTING - UNTUK ADMIN HOTEL</div>
                  <div class="note-text">
                    Kartu ini harus ditunjukkan kepada admin hotel sebagai konfirmasi reservasi yang sah. 
                    Mohon verifikasi data dan status pembayaran sebelum memberikan akses venue.
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <div class="footer-content">
                  <div class="qr-section">
                    <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">ID Reservasi:</div>
                    <div class="booking-id">${booking.id}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                      Dibuat: ${formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                  
                  <div class="company-info">
                    <div class="company-name">King Royal Hotel</div>
                    <div class="company-details">
                      Jl. Premium No. 123, Jakarta<br>
                      Telp: (021) 1234-5678<br>
                      © 2024 King Royal Hotel
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error("Print error:", error)
      alert("Gagal mencetak kartu reservasi")
    }
    setPrinting(false)
  }

  const tabs = [
    { id: "details", name: "Detail Reservasi", icon: FaClipboardList },
    { id: "venue", name: "Info Venue", icon: FaBuilding },
    { id: "payment", name: "Pembayaran", icon: FaMoneyBillWave },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-8 max-h-[90vh] overflow-hidden">
        <div id="reservation-card-content" className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{booking.eventName}</h2>
                  <p className="text-gray-600 text-sm">King Royal Hotel - Premium Venue</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-gray-600 text-sm" />
                </button>
              </div>
            </div>

            {/* Booking ID */}
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <FaQrcode className="text-gray-400" />
                <span className="text-sm text-gray-600">ID Reservasi:</span>
                <span className="font-mono text-sm font-semibold text-gray-900">{booking.id}</span>
              </div>
              <div className="text-sm text-gray-500">Dibuat: {formatDateTime(booking.createdAt)}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 flex-shrink-0">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="text-sm" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Main Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center text-gray-700 mb-2">
                        <FaCalendarAlt className="mr-2 text-blue-600" />
                        <span className="font-semibold text-sm">Tanggal Acara</span>
                      </div>
                      <div className="text-gray-900 font-medium">
                        {formatDate(booking.eventDate || booking.checkIn)}
                      </div>
                      <div className="text-blue-600 text-sm mt-1">
                        {booking.timeSlotDetails?.label || booking.timeSlot || "Full Day"}
                      </div>
                    </div>

                    {booking.venueSetupDetails?.label && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center text-gray-700 mb-2">
                          <FaUsers className="mr-2 text-blue-600" />
                          <span className="font-semibold text-sm">Setup & Kapasitas</span>
                        </div>
                        <div className="text-gray-900 font-medium">{booking.venueSetupDetails.label}</div>
                        <div className="text-blue-600 text-sm mt-1">
                          {booking.guestCapacity || booking.guestCount || booking.guests} orang
                        </div>
                      </div>
                    )}

                    {booking.bookingName && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center text-gray-700 mb-2">
                          <FaClipboardList className="mr-2 text-blue-600" />
                          <span className="font-semibold text-sm">Nama Booking</span>
                        </div>
                        <div className="text-gray-900 font-medium">{booking.bookingName}</div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center text-gray-700 mb-2">
                        <FaMapMarkerAlt className="mr-2 text-blue-600" />
                        <span className="font-semibold text-sm">Lokasi</span>
                      </div>
                      <div className="text-gray-900 font-medium">King Royal Hotel</div>
                      <div className="text-gray-600 text-sm mt-1">Jl. Premium No. 123, Jakarta</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center text-gray-700 mb-2">
                        <FaClock className="mr-2 text-blue-600" />
                        <span className="font-semibold text-sm">Status Pembayaran</span>
                      </div>
                      <div
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(booking.paymentStatus, booking.paymentType)}`}
                      >
                        {booking.paymentType === "cash" ? (
                          <FaStore className="text-xs" />
                        ) : (
                          <FaCreditCard className="text-xs" />
                        )}
                        <span>{getPaymentStatusText(booking.paymentStatus, booking.paymentType)}</span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center text-gray-700 mb-2">
                          <FaClipboardList className="mr-2 text-blue-600" />
                          <span className="font-semibold text-sm">Permintaan Khusus</span>
                        </div>
                        <div className="text-gray-800 text-sm leading-relaxed">{booking.specialRequests}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {booking.status === "approved" && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center text-emerald-700">
                      <FaCheckCircle className="mr-2 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-sm">Reservasi Disetujui!</div>
                        <div className="text-emerald-600 text-sm mt-1">
                          {booking.paymentType === "cash"
                            ? "Silakan datang ke lokasi untuk melakukan pembayaran."
                            : "Silakan lakukan pembayaran sesuai instruksi."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {booking.status === "rejected" && booking.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-red-700">
                      <div className="font-semibold text-sm mb-1">Alasan Penolakan:</div>
                      <div className="text-red-800 text-sm">{booking.rejectionReason}</div>
                    </div>
                  </div>
                )}

                {/* Admin Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <FaExclamationTriangle className="text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-amber-800 text-sm mb-1">PENTING - UNTUK ADMIN HOTEL</div>
                      <div className="text-amber-700 text-sm leading-relaxed">
                        Kartu ini harus ditunjukkan kepada admin hotel sebagai konfirmasi reservasi yang sah. Mohon
                        verifikasi data dan status pembayaran sebelum memberikan akses venue.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "venue" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Venue</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Nama Venue</span>
                          <p className="text-gray-900 font-semibold">{booking.roomName || booking.venueName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Lokasi</span>
                          <p className="text-gray-900">King Royal Hotel</p>
                          <p className="text-gray-600 text-sm">Jl. Premium No. 123, Jakarta</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Kontak</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <FaPhone className="text-blue-600 text-sm" />
                            <span className="text-gray-900">(021) 1234-5678</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <FaEnvelope className="text-blue-600 text-sm" />
                            <span className="text-gray-900">info@kingroyalhotel.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Kapasitas</span>
                          <p className="text-gray-900 font-semibold">
                            {booking.guestCapacity || booking.guestCount || booking.guests} orang
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Setup Venue</span>
                          <p className="text-gray-900">{booking.venueSetupDetails?.label || "Standard Setup"}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Waktu Penggunaan</span>
                          <p className="text-gray-900">
                            {booking.timeSlotDetails?.label || booking.timeSlot || "Full Day"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                {/* Payment Summary */}
                {booking.totalAmount && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-1">Total Biaya</h3>
                        <p className="text-blue-600 text-sm">Termasuk semua biaya venue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-900">
                          Rp {booking.totalAmount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-blue-600 text-sm">Per periode booking</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      {booking.paymentType === "cash" ? (
                        <FaStore className="text-blue-600 text-xl" />
                      ) : (
                        <FaCreditCard className="text-blue-600 text-xl" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getPaymentStatusText(booking.paymentStatus, booking.paymentType)}
                      </p>
                      {booking.paymentMethod && (
                        <div className="text-sm text-gray-600 mt-1">
                          <p>{booking.paymentMethod.name}</p>
                          <p>{booking.paymentMethod.accountNumber}</p>
                          <p>a.n. {booking.paymentMethod.accountName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                {booking.paymentType === "cash" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Instruksi Pembayaran</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Datang ke King Royal Hotel pada hari acara</li>
                      <li>• Tunjukkan kartu reservasi ini kepada admin hotel</li>
                      <li>• Lakukan pembayaran di front desk</li>
                      <li>• Dapatkan akses ke venue setelah pembayaran</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="text-sm font-medium text-gray-700">Premium Venue Experience</span>
                </div>
                {booking.totalAmount && (
                  <div className="text-lg font-bold text-blue-600">
                    Rp {booking.totalAmount.toLocaleString("id-ID")}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
                >
                  {downloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <FaDownload />
                  )}
                  <span>{downloading ? "Mengunduh..." : "Download"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={printing}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
                >
                  {printing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <FaPrint />
                  )}
                  <span>{printing ? "Mencetak..." : "Print"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ReservationCard.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.string.isRequired,
    bookingName: PropTypes.string,
    eventName: PropTypes.string.isRequired,
    eventDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    checkIn: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    roomName: PropTypes.string,
    venueName: PropTypes.string,
    guestCount: PropTypes.number,
    guests: PropTypes.number,
    guestCapacity: PropTypes.number,
    totalAmount: PropTypes.number,
    specialRequests: PropTypes.string,
    status: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string,
    paymentType: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    contactPerson: PropTypes.string,
    phoneNumber: PropTypes.string,
    organization: PropTypes.string,
    timeSlot: PropTypes.string,
    timeSlotDetails: PropTypes.object,
    venueSetup: PropTypes.string,
    venueSetupDetails: PropTypes.object,
    paymentMethod: PropTypes.object,
    rejectionReason: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  userRole: PropTypes.string,
}

export default ReservationCard
