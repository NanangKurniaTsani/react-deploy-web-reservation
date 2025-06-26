"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import ReservationCard from "./ReservationCard"
import { FaSpinner, FaCalendarAlt, FaDownload, FaCheckCircle, FaSyncAlt, FaSearch, FaFilter } from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

const MyBookings = () => {
  const { currentUser, userRole } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCard, setShowCard] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useBackButton(() => {
    if (showCard) {
      setShowCard(false)
      return true
    }
    window.location.href = "/dashboard"
    return true
  })

  useEffect(() => {
    if (currentUser) {
      fetchBookings()
    }
  }, [currentUser])

  const fetchBookings = async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      let q
      try {
        q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"))
      } catch (indexError) {
        console.warn("Using simple query due to missing index:", indexError)
        q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid))
      }

      const querySnapshot = await getDocs(q)
      const bookingsData = []

      for (const docSnapshot of querySnapshot.docs) {
        const bookingData = { id: docSnapshot.id, ...docSnapshot.data() }

        if (bookingData.userId) {
          try {
            const userDoc = await getDoc(doc(db, "users", bookingData.userId))
            if (userDoc.exists()) {
              bookingData.userName = userDoc.data().name
            }
          } catch (userError) {
            console.warn("Error fetching user data:", userError)
          }
        }

        bookingsData.push(bookingData)
      }

      bookingsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })

      setBookings(bookingsData)

      if (bookingsData.length === 0) {
        toast.success("Belum ada reservasi yang ditemukan")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)

      if (error.code === "failed-precondition" || error.message.includes("index")) {
        toast.error("Database index diperlukan. Silakan hubungi administrator.")
      } else if (error.code === "permission-denied") {
        toast.error("Tidak memiliki izin untuk mengakses data reservasi")
      } else {
        toast.error("Gagal memuat data reservasi")
      }
    }
    setLoading(false)
  }

  const handleDownloadCard = (booking) => {
    setSelectedBooking(booking)
    setShowCard(true)
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

  const filteredBookings = bookings.filter((booking) => {
    if (filter !== "all" && booking.status !== filter) {
      return false
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        booking.eventName?.toLowerCase().includes(searchLower) ||
        booking.roomName?.toLowerCase().includes(searchLower) ||
        booking.venueName?.toLowerCase().includes(searchLower) ||
        booking.status?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const getStats = () => {
    const total = bookings.length
    const pending = bookings.filter((b) => b.status === "pending").length
    const approved = bookings.filter((b) => b.status === "approved").length
    return { total, pending, approved }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="my-bookings-loading my-bookings-loading-container my-bookings-loading-responsive min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="my-bookings-loading-content my-bookings-loading-content-responsive text-center">
          <FaSpinner className="my-bookings-loading-spinner my-bookings-loading-spinner-responsive animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="my-bookings-loading-text my-bookings-loading-text-responsive text-gray-600">
            Memuat reservasi Anda...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-bookings my-bookings-container my-bookings-responsive min-h-screen bg-gray-50">
      <div className="my-bookings-content my-bookings-content-container my-bookings-content-responsive container mx-auto px-4 py-6">
        <div className="my-bookings-header my-bookings-header-container my-bookings-header-responsive mb-6">
          <h1 className="my-bookings-title my-bookings-title-responsive text-2xl font-bold text-gray-900 mb-2">
            Reservasi Saya
          </h1>
          <p className="my-bookings-subtitle my-bookings-subtitle-responsive text-gray-600">
            Kelola dan pantau status reservasi venue Anda
          </p>
        </div>

        {userRole !== "admin" && (
          <div className="my-bookings-stats my-bookings-stats-container my-bookings-stats-responsive grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="my-bookings-stat my-bookings-stat-total my-bookings-stat-responsive bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="my-bookings-stat-content my-bookings-stat-content-responsive flex items-center justify-between">
                <div className="my-bookings-stat-info my-bookings-stat-info-responsive">
                  <div className="my-bookings-stat-number my-bookings-stat-number-responsive text-2xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                  <div className="my-bookings-stat-label my-bookings-stat-label-responsive text-sm text-gray-600">
                    Total Reservasi
                  </div>
                </div>
                <div className="my-bookings-stat-icon my-bookings-stat-icon-responsive w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="my-bookings-stat-icon-inner my-bookings-stat-icon-inner-responsive text-blue-600" />
                </div>
              </div>
            </div>

            <div className="my-bookings-stat my-bookings-stat-pending my-bookings-stat-responsive bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="my-bookings-stat-content my-bookings-stat-content-responsive flex items-center justify-between">
                <div className="my-bookings-stat-info my-bookings-stat-info-responsive">
                  <div className="my-bookings-stat-number my-bookings-stat-number-responsive text-2xl font-bold text-amber-600">
                    {stats.pending}
                  </div>
                  <div className="my-bookings-stat-label my-bookings-stat-label-responsive text-sm text-gray-600">
                    Menunggu
                  </div>
                </div>
                <div className="my-bookings-stat-icon my-bookings-stat-icon-responsive w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FaSyncAlt className="my-bookings-stat-icon-inner my-bookings-stat-icon-inner-responsive text-amber-600" />
                </div>
              </div>
            </div>

            <div className="my-bookings-stat my-bookings-stat-approved my-bookings-stat-responsive bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="my-bookings-stat-content my-bookings-stat-content-responsive flex items-center justify-between">
                <div className="my-bookings-stat-info my-bookings-stat-info-responsive">
                  <div className="my-bookings-stat-number my-bookings-stat-number-responsive text-2xl font-bold text-emerald-600">
                    {stats.approved}
                  </div>
                  <div className="my-bookings-stat-label my-bookings-stat-label-responsive text-sm text-gray-600">
                    Disetujui
                  </div>
                </div>
                <div className="my-bookings-stat-icon my-bookings-stat-icon-responsive w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="my-bookings-stat-icon-inner my-bookings-stat-icon-inner-responsive text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="my-bookings-filters my-bookings-filters-container my-bookings-filters-responsive flex flex-col md:flex-row gap-4 mb-6">
          <div className="my-bookings-search my-bookings-search-container my-bookings-search-responsive flex-1 relative">
            <FaSearch className="my-bookings-search-icon my-bookings-search-icon-responsive absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari reservasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="my-bookings-search-input my-bookings-search-input-responsive w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="my-bookings-filter my-bookings-filter-container my-bookings-filter-responsive flex items-center space-x-2">
            <FaFilter className="my-bookings-filter-icon my-bookings-filter-icon-responsive text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="my-bookings-filter-select my-bookings-filter-select-responsive px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              {userRole === "admin" && <option value="rejected">Ditolak</option>}
            </select>
          </div>
        </div>

        <div className="my-bookings-tabs my-bookings-tabs-container my-bookings-tabs-responsive bg-white rounded-2xl p-2 mb-6 shadow-sm border border-gray-200">
          <div className="my-bookings-tabs-nav my-bookings-tabs-nav-responsive flex space-x-1">
            {[
              { id: "all", name: "Semua" },
              { id: "pending", name: "Menunggu" },
              { id: "approved", name: "Disetujui" },
              ...(userRole === "admin" ? [{ id: "rejected", name: "Ditolak" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`my-bookings-tab my-bookings-tab-responsive flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === tab.id ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="my-bookings-empty my-bookings-empty-container my-bookings-empty-responsive bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="my-bookings-empty-icon my-bookings-empty-icon-responsive text-6xl mb-4">📅</div>
            <h3 className="my-bookings-empty-title my-bookings-empty-title-responsive text-xl font-semibold text-gray-600 mb-2">
              {bookings.length === 0 ? "Belum Ada Reservasi" : "Tidak Ada Data"}
            </h3>
            <p className="my-bookings-empty-text my-bookings-empty-text-responsive text-gray-500 mb-6">
              {bookings.length === 0
                ? "Anda belum memiliki reservasi venue. Mulai dengan membuat reservasi baru."
                : "Tidak ada reservasi dengan filter yang dipilih."}
            </p>
            {bookings.length === 0 && (
              <button
                onClick={() => (window.location.href = "/")}
                className="my-bookings-empty-btn my-bookings-empty-btn-responsive bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Buat Reservasi
              </button>
            )}
          </div>
        ) : (
          <div className="my-bookings-list my-bookings-list-container my-bookings-list-responsive space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="my-bookings-item my-bookings-item-card my-bookings-item-responsive bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="my-bookings-item-content my-bookings-item-content-responsive p-6">
                  <div className="my-bookings-item-header my-bookings-item-header-responsive flex justify-between items-start mb-4">
                    <div className="my-bookings-item-info my-bookings-item-info-responsive">
                      <h3 className="my-bookings-item-title my-bookings-item-title-responsive text-lg font-semibold text-gray-900 mb-1">
                        {booking.eventName}
                      </h3>
                      <p className="my-bookings-item-venue my-bookings-item-venue-responsive text-gray-600 text-sm">
                        {booking.roomName || booking.venueName}
                      </p>
                    </div>
                    <div className="my-bookings-item-actions my-bookings-item-actions-responsive flex items-center space-x-2">
                      <span
                        className={`my-bookings-item-status my-bookings-item-status-responsive px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                      <button
                        onClick={() => handleDownloadCard(booking)}
                        className="my-bookings-item-download my-bookings-item-download-responsive w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                        title="Download Kartu Reservasi"
                      >
                        <FaDownload className="my-bookings-item-download-icon my-bookings-item-download-icon-responsive text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="my-bookings-item-details my-bookings-item-details-responsive grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="my-bookings-item-detail my-bookings-item-detail-responsive">
                      <p className="my-bookings-item-detail-label my-bookings-item-detail-label-responsive text-sm text-gray-600">
                        Tanggal Acara
                      </p>
                      <p className="my-bookings-item-detail-value my-bookings-item-detail-value-responsive font-medium text-gray-900">
                        {formatDate(booking.eventDate)}
                      </p>
                    </div>
                    <div className="my-bookings-item-detail my-bookings-item-detail-responsive">
                      <p className="my-bookings-item-detail-label my-bookings-item-detail-label-responsive text-sm text-gray-600">
                        Tanggal Reservasi
                      </p>
                      <p className="my-bookings-item-detail-value my-bookings-item-detail-value-responsive font-medium text-gray-900">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div className="my-bookings-item-detail my-bookings-item-detail-responsive">
                      <p className="my-bookings-item-detail-label my-bookings-item-detail-label-responsive text-sm text-gray-600">
                        Jumlah Tamu
                      </p>
                      <p className="my-bookings-item-detail-value my-bookings-item-detail-value-responsive font-medium text-gray-900">
                        {booking.guestCount} orang
                      </p>
                    </div>
                    <div className="my-bookings-item-detail my-bookings-item-detail-responsive">
                      <p className="my-bookings-item-detail-label my-bookings-item-detail-label-responsive text-sm text-gray-600">
                        Total Biaya
                      </p>
                      <p className="my-bookings-item-detail-value my-bookings-item-detail-value-responsive font-medium text-blue-600">
                        Rp {booking.totalAmount?.toLocaleString("id-ID") || "0"}
                      </p>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="my-bookings-item-description my-bookings-item-description-responsive mb-4">
                      <p className="my-bookings-item-description-label my-bookings-item-description-label-responsive text-sm text-gray-600 mb-1">
                        Deskripsi
                      </p>
                      <p className="my-bookings-item-description-text my-bookings-item-description-text-responsive text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                        {booking.description}
                      </p>
                    </div>
                  )}

                  {booking.status === "rejected" && booking.rejectionReason && userRole === "admin" && (
                    <div className="my-bookings-item-rejection my-bookings-item-rejection-responsive bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="my-bookings-item-rejection-text my-bookings-item-rejection-text-responsive text-sm text-red-700">
                        <span className="my-bookings-item-rejection-label my-bookings-item-rejection-label-responsive font-medium">
                          Alasan Penolakan:
                        </span>{" "}
                        {booking.rejectionReason}
                      </p>
                    </div>
                  )}

                  {booking.status === "approved" && (
                    <div className="my-bookings-item-approved my-bookings-item-approved-responsive bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="my-bookings-item-approved-text my-bookings-item-approved-text-responsive text-sm text-emerald-700">
                        <span className="my-bookings-item-approved-label my-bookings-item-approved-label-responsive font-medium">
                          Status:
                        </span>{" "}
                        Reservasi Anda telah disetujui! Silakan lakukan pembayaran sesuai instruksi.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCard && selectedBooking && (
          <div className="my-bookings-modal my-bookings-modal-overlay my-bookings-modal-responsive fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="my-bookings-modal-content my-bookings-modal-content-responsive bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <ReservationCard booking={selectedBooking} onClose={() => setShowCard(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings
