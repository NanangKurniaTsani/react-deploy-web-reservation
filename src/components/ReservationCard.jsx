"use client"

import { useState, useRef } from "react"
import PropTypes from "prop-types"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
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
  FaCreditCard,
  FaStore,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa"

const ReservationCard = ({ booking, onClose, userRole = "customer" }) => {
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const cardRef = useRef(null)
  const contentRef = useRef(null)

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
      console.error("Tanggal tidak valid",error)
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
      console.error("Tanggal tidak valid",error)
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

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const printContent = document.createElement("div")
      printContent.style.width = "800px"
      printContent.style.padding = "20px"
      printContent.style.backgroundColor = "white"
      printContent.style.fontFamily = "Arial, sans-serif"

      printContent.innerHTML = `
        <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">King Royal Hotel</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px;">Detail Reservasi</h2>
          </div>
          <div style="padding: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 20px;">${booking.eventName || "Event"}</h3>
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; padding: 5px 10px; border-radius: 20px; font-weight: bold; font-size: 12px; background: ${booking.status === "approved" ? "#d1fae5; color: #065f46" : booking.status === "pending" ? "#fef3c7; color: #92400e" : "#fee2e2; color: #991b1b"}">
                ${getStatusText(booking.status)}
              </span>
            </div>
            
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #666;">Tanggal Acara</h4>
              <p style="margin: 0; font-weight: bold;">${formatDate(booking.eventDate || booking.checkIn)}</p>
              <p style="margin: 5px 0 0 0; color: #666;">${booking.timeSlotDetails?.label || booking.timeSlot || "Full Day"}</p>
            </div>
            
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #666;">Venue</h4>
              <p style="margin: 0; font-weight: bold;">${booking.roomName || booking.venueName}</p>
              <p style="margin: 5px 0 0 0; color: #666;">King Royal Hotel - Brebes</p>
            </div>
            
            ${
              booking.totalAmount
                ? `
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #666;">Total Biaya</h4>
              <p style="margin: 0; font-weight: bold; color: #2563eb;">Rp ${booking.totalAmount.toLocaleString("id-ID")}</p>
            </div>
            `
                : ""
            }
            
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #666;">ID Reservasi</h4>
              <p style="margin: 0; font-family: monospace; font-weight: bold;">${booking.id}</p>
              <p style="margin: 5px 0 0 0; color: #666;">Dibuat: ${formatDateTime(booking.createdAt)}</p>
            </div>

            ${
              booking.guestCapacity || booking.guestCount || booking.guests
                ? `
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #666;">Kapasitas</h4>
              <p style="margin: 0; font-weight: bold;">${booking.guestCapacity || booking.guestCount || booking.guests} orang</p>
            </div>
            `
                : ""
            }

            ${
              booking.specialRequests
                ? `
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #666;">Permintaan Khusus</h4>
              <p style="margin: 0; color: #333;">${booking.specialRequests}</p>
            </div>
            `
                : ""
            }

            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold; color: #92400e;">PENTING - UNTUK ADMIN HOTEL</p>
              <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
                Kartu ini harus ditunjukkan kepada admin hotel sebagai konfirmasi reservasi yang sah. 
                Mohon verifikasi data dan status pembayaran sebelum memberikan akses venue.
              </p>
            </div>
          </div>
        </div>
      `

      document.body.appendChild(printContent)

      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      document.body.removeChild(printContent)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`reservasi-${booking.id}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Gagal mengunduh PDF")
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = async () => {
    setPrinting(true)
    try {
      const printWindow = window.open("", "_blank")
      printWindow.document.write(`
        <html>
          <head>
            <title>Reservasi ${booking.eventName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .print-container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(to right, #2563eb, #1d4ed8);
                color: white;
                padding: 20px;
                text-align: center;
              }
              .content {
                padding: 20px;
              }
              .info-card {
                margin-bottom: 15px;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 8px;
              }
              .status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 20px;
                font-weight: bold;
                margin-right: 10px;
                font-size: 12px;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .print-container { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="header">
                <h1>King Royal Hotel</h1>
                <h2>Detail Reservasi</h2>
              </div>
              <div class="content">
                <h3>${booking.eventName}</h3>
                <div>
                  <span class="status" style="background: ${booking.status === "approved" ? "#d1fae5" : booking.status === "pending" ? "#fef3c7" : "#fee2e2"}; 
                    color: ${booking.status === "approved" ? "#065f46" : booking.status === "pending" ? "#92400e" : "#991b1b"}">
                    ${getStatusText(booking.status)}
                  </span>
                </div>
                
                <div class="info-card">
                  <h4>Tanggal Acara</h4>
                  <p>${formatDate(booking.eventDate || booking.checkIn)}</p>
                  <p>${booking.timeSlotDetails?.label || booking.timeSlot || "Full Day"}</p>
                </div>
                
                <div class="info-card">
                  <h4>Venue</h4>
                  <p>${booking.roomName || booking.venueName}</p>
                  <p>King Royal Hotel - Brebes</p>
                </div>
                
                ${
                  booking.totalAmount
                    ? `
                <div class="info-card">
                  <h4>Total Biaya</h4>
                  <p>Rp ${booking.totalAmount.toLocaleString("id-ID")}</p>
                </div>
                `
                    : ""
                }
                
                <div class="info-card">
                  <h4>ID Reservasi</h4>
                  <p>${booking.id}</p>
                  <p>Dibuat: ${formatDateTime(booking.createdAt)}</p>
                </div>

                ${
                  booking.guestCapacity || booking.guestCount || booking.guests
                    ? `
                <div class="info-card">
                  <h4>Kapasitas</h4>
                  <p>${booking.guestCapacity || booking.guestCount || booking.guests} orang</p>
                </div>
                `
                    : ""
                }

                ${
                  booking.specialRequests
                    ? `
                <div class="info-card">
                  <h4>Permintaan Khusus</h4>
                  <p>${booking.specialRequests}</p>
                </div>
                `
                    : ""
                }
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    } catch (error) {
      console.error("Print error:", error)
      alert("Gagal mencetak")
    } finally {
      setPrinting(false)
    }
  }

  const tabs = [
    { id: "details", name: "Detail Reservasi", icon: FaClipboardList },
    { id: "venue", name: "Info Venue", icon: FaBuilding },
    { id: "payment", name: "Pembayaran", icon: FaMoneyBillWave },
  ]

  return (
    <div className="reservation-card reservation-card-overlay reservation-card-responsive fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="reservation-card-container reservation-card-container-responsive w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div
          ref={cardRef}
          className="reservation-card-content reservation-card-content-responsive flex-1 flex flex-col"
        >
          {/* Header - Tetap tidak scroll */}
          <div className="reservation-card-header reservation-card-header-responsive bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl flex-shrink-0">
            <div className="reservation-card-header-content reservation-card-header-content-responsive flex justify-between items-start">
              <div className="reservation-card-header-info reservation-card-header-info-responsive flex items-center space-x-4">
                <div className="reservation-card-header-icon reservation-card-header-icon-responsive bg-blue-500 p-3 rounded-lg">
                  <FaBuilding className="reservation-card-header-icon-inner reservation-card-header-icon-inner-responsive text-xl text-white" />
                </div>
                <div className="reservation-card-header-text reservation-card-header-text-responsive">
                  <h2 className="reservation-card-title reservation-card-title-responsive text-xl font-bold text-white">
                    {booking.eventName || "Event"}
                  </h2>
                  <p className="reservation-card-subtitle reservation-card-subtitle-responsive text-blue-100">
                    King Royal Hotel - Brebes
                  </p>
                </div>
              </div>
              <div className="reservation-card-header-actions reservation-card-header-actions-responsive flex items-center space-x-3">
                <div
                  className={`reservation-card-status reservation-card-status-responsive px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                >
                  {getStatusText(booking.status)}
                </div>
                <button
                  onClick={onClose}
                  className="reservation-card-close reservation-card-close-responsive text-gray-200 hover:text-white"
                >
                  <FaTimes className="reservation-card-close-icon reservation-card-close-icon-responsive text-xl" />
                </button>
              </div>
            </div>

            <div className="reservation-card-header-meta reservation-card-header-meta-responsive mt-4 flex justify-between items-center text-sm text-blue-100">
              <div className="reservation-card-id reservation-card-id-responsive flex items-center space-x-2">
                <FaQrcode className="reservation-card-id-icon reservation-card-id-icon-responsive" />
                <span className="reservation-card-id-label reservation-card-id-label-responsive">ID Reservasi:</span>
                <span className="reservation-card-id-value reservation-card-id-value-responsive font-mono font-bold text-white">
                  {booking.id}
                </span>
              </div>
              <div className="reservation-card-created reservation-card-created-responsive t-c- black">
                Dibuat: {formatDateTime(booking.createdAt)}
              </div>
            </div>
          </div>

          {/* Tab Navigation - Tetap tidak scroll */}
          <div className="reservation-card-tabs reservation-card-tabs-responsive bg-white border-b border-gray-200 flex-shrink-0">
            <div className="reservation-card-tabs-nav reservation-card-tabs-nav-responsive flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`reservation-card-tab reservation-card-tab-responsive flex-1 py-3 px-4 flex flex-col items-center justify-center text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="reservation-card-tab-icon reservation-card-tab-icon-responsive mb-1" />
                  <span className="reservation-card-tab-text reservation-card-tab-text-responsive">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div
            ref={contentRef}
            className="reservation-card-body reservation-card-body-responsive flex-1 overflow-y-auto p-6"
          >
            {activeTab === "details" && (
              <div className="reservation-card-details reservation-card-details-responsive space-y-6">
                <div className="reservation-card-details-grid reservation-card-details-grid-responsive grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="reservation-card-details-left reservation-card-details-left-responsive space-y-4">
                    <div className="reservation-card-info-card reservation-card-info-card-responsive bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="reservation-card-info-header reservation-card-info-header-responsive flex items-center text-gray-700 mb-2">
                        <FaCalendarAlt className="reservation-card-info-icon reservation-card-info-icon-responsive mr-2 text-blue-600" />
                        <span className="reservation-card-info-label reservation-card-info-label-responsive font-semibold">
                          Tanggal Acara
                        </span>
                      </div>
                      <div className="reservation-card-info-value reservation-card-info-value-responsive text-lg font-semibold text-gray-900">
                        {formatDate(booking.eventDate || booking.checkIn)}
                      </div>
                      <div className="reservation-card-info-sub reservation-card-info-sub-responsive text-gray-600">
                        {booking.timeSlotDetails?.label || booking.timeSlot || "Full Day"}
                      </div>
                    </div>

                    {booking.venueSetupDetails?.label && (
                      <div className="reservation-card-info-card reservation-card-info-card-responsive bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="reservation-card-info-header reservation-card-info-header-responsive flex items-center text-gray-700 mb-2">
                          <FaUsers className="reservation-card-info-icon reservation-card-info-icon-responsive mr-2 text-blue-600" />
                          <span className="reservation-card-info-label reservation-card-info-label-responsive font-semibold">
                            Setup & Kapasitas
                          </span>
                        </div>
                        <div className="reservation-card-info-value reservation-card-info-value-responsive text-lg font-semibold text-gray-900">
                          {booking.venueSetupDetails.label}
                        </div>
                        <div className="reservation-card-info-sub reservation-card-info-sub-responsive text-gray-600">
                          {booking.guestCapacity || booking.guestCount || booking.guests} orang
                        </div>
                      </div>
                    )}

                    {booking.bookingName && (
                      <div className="reservation-card-info-card reservation-card-info-card-responsive bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="reservation-card-info-header reservation-card-info-header-responsive flex items-center text-gray-700 mb-2">
                          <FaClipboardList className="reservation-card-info-icon reservation-card-info-icon-responsive mr-2 text-blue-600" />
                          <span className="reservation-card-info-label reservation-card-info-label-responsive font-semibold">
                            Nama Booking
                          </span>
                        </div>
                        <div className="reservation-card-info-value reservation-card-info-value-responsive text-lg font-semibold text-gray-900">
                          {booking.bookingName}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="reservation-card-details-right reservation-card-details-right-responsive space-y-4">
                    <div className="reservation-card-info-card reservation-card-info-card-responsive bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="reservation-card-info-header reservation-card-info-header-responsive flex items-center text-gray-700 mb-2">
                        <FaMapMarkerAlt className="reservation-card-info-icon reservation-card-info-icon-responsive mr-2 text-blue-600" />
                        <span className="reservation-card-info-label reservation-card-info-label-responsive font-semibold">
                          Lokasi
                        </span>
                      </div>
                      <div className="reservation-card-info-value reservation-card-info-value-responsive text-lg font-semibold text-gray-900">
                        King Royal Hotel
                      </div>
                      <div className="reservation-card-info-sub reservation-card-info-sub-responsive text-gray-600">
                        Jl. Jendral A.Yani No 134, Pangembon, Brebes, Kec.Brebes Kab. Brebes, Jawa Tengah
                      </div>
                    </div>

                    <div className="reservation-card-info-card reservation-card-info-card-responsive bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="reservation-card-info-header reservation-card-info-header-responsive flex items-center text-gray-700 mb-2">
                        <FaClock className="reservation-card-info-icon reservation-card-info-icon-responsive mr-2 text-blue-600" />
                        <span className="reservation-card-info-label reservation-card-info-label-responsive font-semibold">
                          Status Pembayaran
                        </span>
                      </div>
                      <div
                        className={`reservation-card-payment-status reservation-card-payment-status-responsive inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus, booking.paymentType)}`}
                      >
                        {booking.paymentType === "cash" ? (
                          <FaStore className="reservation-card-payment-icon reservation-card-payment-icon-responsive mr-2" />
                        ) : (
                          <FaCreditCard className="reservation-card-payment-icon reservation-card-payment-icon-responsive mr-2" />
                        )}
                        <span className="reservation-card-payment-text reservation-card-payment-text-responsive">
                          {getPaymentStatusText(booking.paymentStatus, booking.paymentType)}
                        </span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="reservation-card-info-card reservation-card-info-card-responsive bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="reservation-card-info-header reservation-card-info-header-responsive flex items-center text-gray-700 mb-2">
                          <FaClipboardList className="reservation-card-info-icon reservation-card-info-icon-responsive mr-2 text-blue-600" />
                          <span className="reservation-card-info-label reservation-card-info-label-responsive font-semibold">
                            Permintaan Khusus
                          </span>
                        </div>
                        <div className="reservation-card-info-value reservation-card-info-value-responsive text-gray-700 whitespace-pre-line">
                          {booking.specialRequests}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {booking.status === "approved" && (
                  <div className="reservation-card-approved reservation-card-approved-responsive bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                    <FaCheckCircle className="reservation-card-approved-icon reservation-card-approved-icon-responsive text-green-500 text-xl mr-3 mt-1" />
                    <div className="reservation-card-approved-content reservation-card-approved-content-responsive">
                      <div className="reservation-card-approved-title reservation-card-approved-title-responsive font-semibold text-green-800">
                        Reservasi Disetujui!
                      </div>
                      <div className="reservation-card-approved-text reservation-card-approved-text-responsive text-green-700">
                        {booking.paymentType === "cash"
                          ? "Silakan datang ke lokasi untuk melakukan pembayaran."
                          : "Silakan lakukan pembayaran sesuai instruksi."}
                      </div>
                    </div>
                  </div>
                )}

                {booking.status === "rejected" && booking.rejectionReason && (
                  <div className="reservation-card-rejected reservation-card-rejected-responsive bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="reservation-card-rejected-title reservation-card-rejected-title-responsive font-semibold text-red-800 mb-1">
                      Alasan Penolakan:
                    </div>
                    <div className="reservation-card-rejected-text reservation-card-rejected-text-responsive text-red-700">
                      {booking.rejectionReason}
                    </div>
                  </div>
                )}

                <div className="reservation-card-warning reservation-card-warning-responsive bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="reservation-card-warning-content reservation-card-warning-content-responsive flex items-start">
                    <FaExclamationTriangle className="reservation-card-warning-icon reservation-card-warning-icon-responsive text-yellow-500 text-xl mr-3 mt-1" />
                    <div className="reservation-card-warning-text reservation-card-warning-text-responsive">
                      <div className="reservation-card-warning-title reservation-card-warning-title-responsive font-semibold text-yellow-800">
                        PENTING - UNTUK ADMIN HOTEL
                      </div>
                      <div className="reservation-card-warning-desc reservation-card-warning-desc-responsive text-yellow-700">
                        Kartu ini harus ditunjukkan kepada admin hotel sebagai konfirmasi reservasi yang sah. Mohon
                        verifikasi data dan status pembayaran sebelum memberikan akses venue.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "venue" && (
              <div className="reservation-card-venue reservation-card-venue-responsive space-y-6">
                <div className="reservation-card-venue-info reservation-card-venue-info-responsive bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="reservation-card-venue-title reservation-card-venue-title-responsive text-lg font-semibold mb-4 text-gray-900">
                    Informasi Venue
                  </h3>
                  <div className="reservation-card-venue-grid reservation-card-venue-grid-responsive grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="reservation-card-venue-left reservation-card-venue-left-responsive space-y-4">
                      <div className="reservation-card-venue-item reservation-card-venue-item-responsive">
                        <div className="reservation-card-venue-label reservation-card-venue-label-responsive text-gray-600 mb-1 font-medium">
                          Nama Venue
                        </div>
                        <p className="reservation-card-venue-value reservation-card-venue-value-responsive font-semibold text-gray-900">
                          {booking.roomName || booking.venueName}
                        </p>
                      </div>
                      <div className="reservation-card-venue-item reservation-card-venue-item-responsive">
                        <div className="reservation-card-venue-label reservation-card-venue-label-responsive text-gray-600 mb-1 font-medium">
                          Lokasi
                        </div>
                        <p className="reservation-card-venue-value reservation-card-venue-value-responsive font-semibold text-gray-900">
                          King Royal Hotel
                        </p>
                        <p className="reservation-card-venue-address reservation-card-venue-address-responsive text-gray-600">
                          Jl. Jendral A.Yani No 134, Pangembon, Brebes, Kec.Brebes Kab. Brebes, Jawa Tengah
                        </p>
                      </div>
                      <div className="reservation-card-venue-item reservation-card-venue-item-responsive">
                        <div className="reservation-card-venue-label reservation-card-venue-label-responsive text-gray-600 mb-1 font-medium">
                          Kontak
                        </div>
                        <div className="reservation-card-venue-contact reservation-card-venue-contact-responsive flex items-center text-gray-700 mb-2">
                          <FaPhone className="reservation-card-venue-contact-icon reservation-card-venue-contact-icon-responsive mr-2 text-blue-600" />
                          <span className="reservation-card-venue-contact-text reservation-card-venue-contact-text-responsive">
                            (0283) 671234
                          </span>
                        </div>
                        <div className="reservation-card-venue-contact reservation-card-venue-contact-responsive flex items-center text-gray-700">
                          <FaEnvelope className="reservation-card-venue-contact-icon reservation-card-venue-contact-icon-responsive mr-2 text-blue-600" />
                          <span className="reservation-card-venue-contact-text reservation-card-venue-contact-text-responsive">
                            info@kingroyalhotel.com
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="reservation-card-venue-right reservation-card-venue-right-responsive space-y-4">
                      <div className="reservation-card-venue-item reservation-card-venue-item-responsive">
                        <div className="reservation-card-venue-label reservation-card-venue-label-responsive text-gray-600 mb-1 font-medium">
                          Kapasitas
                        </div>
                        <p className="reservation-card-venue-value reservation-card-venue-value-responsive font-semibold text-gray-900">
                          {booking.guestCapacity || booking.guestCount || booking.guests} orang
                        </p>
                      </div>
                      <div className="reservation-card-venue-item reservation-card-venue-item-responsive">
                        <div className="reservation-card-venue-label reservation-card-venue-label-responsive text-gray-600 mb-1 font-medium">
                          Setup Venue
                        </div>
                        <p className="reservation-card-venue-value reservation-card-venue-value-responsive font-semibold text-gray-900">
                          {booking.venueSetupDetails?.label || "Standard Setup"}
                        </p>
                      </div>
                      <div className="reservation-card-venue-item reservation-card-venue-item-responsive">
                        <div className="reservation-card-venue-label reservation-card-venue-label-responsive text-gray-600 mb-1 font-medium">
                          Waktu Penggunaan
                        </div>
                        <p className="reservation-card-venue-value reservation-card-venue-value-responsive font-semibold text-gray-900">
                          {booking.timeSlotDetails?.label || booking.timeSlot || "Full Day"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="reservation-card-payment reservation-card-payment-responsive space-y-6">
                {booking.totalAmount && (
                  <div className="reservation-card-payment-total reservation-card-payment-total-responsive bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
                    <div className="reservation-card-payment-total-content reservation-card-payment-total-content-responsive flex justify-between items-center">
                      <div className="reservation-card-payment-total-left reservation-card-payment-total-left-responsive">
                        <h3 className="reservation-card-payment-total-title reservation-card-payment-total-title-responsive font-semibold text-white">
                          Total Biaya
                        </h3>
                        <p className="reservation-card-payment-total-desc reservation-card-payment-total-desc-responsive text-blue-100">
                          Termasuk semua biaya venue
                        </p>
                      </div>
                      <div className="reservation-card-payment-total-right reservation-card-payment-total-right-responsive text-right">
                        <p className="reservation-card-payment-total-amount reservation-card-payment-total-amount-responsive text-2xl font-bold text-white">
                          Rp {booking.totalAmount.toLocaleString("id-ID")}
                        </p>
                        <p className="reservation-card-payment-total-period reservation-card-payment-total-period-responsive text-blue-100">
                          Per periode booking
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="reservation-card-payment-method reservation-card-payment-method-responsive bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="reservation-card-payment-method-title reservation-card-payment-method-title-responsive text-lg font-semibold mb-4 text-gray-900">
                    Metode Pembayaran
                  </h3>
                  <div className="reservation-card-payment-method-content reservation-card-payment-method-content-responsive flex items-start">
                    <div className="reservation-card-payment-method-icon reservation-card-payment-method-icon-responsive bg-white p-3 rounded-lg border border-gray-200 mr-4">
                      {booking.paymentType === "cash" ? (
                        <FaStore className="reservation-card-payment-method-icon-inner reservation-card-payment-method-icon-inner-responsive text-2xl text-blue-600" />
                      ) : (
                        <FaCreditCard className="reservation-card-payment-method-icon-inner reservation-card-payment-method-icon-inner-responsive text-2xl text-blue-600" />
                      )}
                    </div>
                    <div className="reservation-card-payment-method-info reservation-card-payment-method-info-responsive">
                      <p className="reservation-card-payment-method-name reservation-card-payment-method-name-responsive font-semibold text-gray-900">
                        {getPaymentStatusText(booking.paymentStatus, booking.paymentType)}
                      </p>
                      {booking.paymentMethod && (
                        <div className="reservation-card-payment-method-details reservation-card-payment-method-details-responsive mt-2 text-gray-700">
                          <p className="reservation-card-payment-method-bank reservation-card-payment-method-bank-responsive">
                            {booking.paymentMethod.name}
                          </p>
                          <p className="reservation-card-payment-method-account reservation-card-payment-method-account-responsive">
                            {booking.paymentMethod.accountNumber}
                          </p>
                          <p className="reservation-card-payment-method-holder reservation-card-payment-method-holder-responsive">
                            a.n. {booking.paymentMethod.accountName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {booking.paymentType === "cash" && (
                  <div className="reservation-card-payment-instructions reservation-card-payment-instructions-responsive bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="reservation-card-payment-instructions-title reservation-card-payment-instructions-title-responsive font-semibold mb-3 text-gray-900">
                      Instruksi Pembayaran
                    </h4>
                    <ul className="reservation-card-payment-instructions-list reservation-card-payment-instructions-list-responsive list-disc pl-5 space-y-2 text-gray-700">
                      <li className="reservation-card-payment-instructions-item reservation-card-payment-instructions-item-responsive">
                        Datang ke King Royal Hotel pada hari acara
                      </li>
                      <li className="reservation-card-payment-instructions-item reservation-card-payment-instructions-item-responsive">
                        Tunjukkan kartu reservasi ini kepada admin hotel
                      </li>
                      <li className="reservation-card-payment-instructions-item reservation-card-payment-instructions-item-responsive">
                        Lakukan pembayaran di front desk
                      </li>
                      <li className="reservation-card-payment-instructions-item reservation-card-payment-instructions-item-responsive">
                        Dapatkan akses ke venue setelah pembayaran
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Tetap tidak scroll */}
        <div className="reservation-card-footer reservation-card-footer-responsive bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="reservation-card-footer-content reservation-card-footer-content-responsive flex justify-between items-center">
            {booking.totalAmount && (
              <div className="reservation-card-footer-total reservation-card-footer-total-responsive text-xl font-bold text-blue-600">
                Rp {booking.totalAmount.toLocaleString("id-ID")}
              </div>
            )}

            <div className="reservation-card-footer-actions reservation-card-footer-actions-responsive flex space-x-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="reservation-card-footer-download reservation-card-footer-download-responsive flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {downloading ? (
                  <div className="reservation-card-footer-spinner reservation-card-footer-spinner-responsive animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2" />
                ) : (
                  <FaDownload className="reservation-card-footer-download-icon reservation-card-footer-download-icon-responsive mr-2" />
                )}
                <span className="reservation-card-footer-download-text reservation-card-footer-download-text-responsive">
                  {downloading ? "Membuat PDF..." : "Download PDF"}
                </span>
              </button>

              <button
                onClick={handlePrint}
                disabled={printing}
                className="reservation-card-footer-print reservation-card-footer-print-responsive flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {printing ? (
                  <div className="reservation-card-footer-spinner reservation-card-footer-spinner-responsive animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                ) : (
                  <FaPrint className="reservation-card-footer-print-icon reservation-card-footer-print-icon-responsive mr-2" />
                )}
                <span className="reservation-card-footer-print-text reservation-card-footer-print-text-responsive">
                  {printing ? "Mencetak..." : "Print"}
                </span>
              </button>
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
    eventName: PropTypes.string,
    status: PropTypes.string.isRequired,
    eventDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    checkIn: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    timeSlotDetails: PropTypes.shape({
      label: PropTypes.string,
    }),
    timeSlot: PropTypes.string,
    venueSetupDetails: PropTypes.shape({
      label: PropTypes.string,
    }),
    bookingName: PropTypes.string,
    roomName: PropTypes.string,
    venueName: PropTypes.string,
    guestCapacity: PropTypes.number,
    guestCount: PropTypes.number,
    guests: PropTypes.number,
    paymentStatus: PropTypes.string,
    paymentType: PropTypes.string,
    specialRequests: PropTypes.string,
    rejectionReason: PropTypes.string,
    totalAmount: PropTypes.number,
    createdAt: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    paymentMethod: PropTypes.shape({
      name: PropTypes.string,
      accountNumber: PropTypes.string,
      accountName: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  userRole: PropTypes.string,
}

export default ReservationCard
