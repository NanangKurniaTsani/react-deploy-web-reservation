"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import {
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaEye,
  FaDownload,
} from "react-icons/fa"
import toast from "react-hot-toast"

const CustomerDashboard = () => {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalSpent: 0,
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
      // Fetch venue bookings
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
        const bookingData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          type: "venue",
        }

        // Fetch user data if needed
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

      // Sort by date
      bookingsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })

      setBookings(bookingsData)
      calculateStats(bookingsData)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Gagal memuat data reservasi")
    }
    setLoading(false)
  }

  const calculateStats = (bookingsData) => {
    const total = bookingsData.length
    const pending = bookingsData.filter((b) => b.status === "pending").length
    const approved = bookingsData.filter((b) => b.status === "approved").length
    const rejected = bookingsData.filter((b) => b.status === "rejected").length
    const totalSpent = bookingsData
      .filter((b) => b.status === "approved")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    setStats({ total, pending, approved, rejected, totalSpent })
  }

  const formatDate = (date) => {
    if (!date) return "Tanggal tidak tersedia"

    try {
      if (date.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      }
      if (date instanceof Date) {
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      }
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Tanggal tidak valid"
    }
  }

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
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <FaClock className="customer-dashboard-status-icon customer-dashboard-status-icon-responsive text-amber-600" />
        )
      case "approved":
        return (
          <FaCheckCircle className="customer-dashboard-status-icon customer-dashboard-status-icon-responsive text-emerald-600" />
        )
      case "rejected":
        return (
          <FaTimesCircle className="customer-dashboard-status-icon customer-dashboard-status-icon-responsive text-red-600" />
        )
      default:
        return (
          <FaClock className="customer-dashboard-status-icon customer-dashboard-status-icon-responsive text-gray-600" />
        )
    }
  }

  if (loading) {
    return (
      <div className="customer-dashboard-loading customer-dashboard-loading-container customer-dashboard-loading-responsive min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="customer-dashboard-loading-content customer-dashboard-loading-content-responsive text-center">
          <FaSpinner className="customer-dashboard-loading-spinner customer-dashboard-loading-spinner-responsive animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="customer-dashboard-loading-text customer-dashboard-loading-text-responsive text-gray-600">
            Memuat dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-dashboard customer-dashboard-container customer-dashboard-responsive min-h-screen bg-gray-50">
      <div className="customer-dashboard-content customer-dashboard-content-container customer-dashboard-content-responsive container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="customer-dashboard-header customer-dashboard-header-container customer-dashboard-header-responsive mb-6">
          <h1 className="customer-dashboard-title customer-dashboard-title-responsive text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard Customer
          </h1>
          <p className="customer-dashboard-subtitle customer-dashboard-subtitle-responsive text-gray-600">
            Selamat datang, {currentUser?.displayName || currentUser?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="customer-dashboard-stats customer-dashboard-stats-container customer-dashboard-stats-responsive grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="customer-dashboard-stat customer-dashboard-stat-total customer-dashboard-stat-responsive bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="customer-dashboard-stat-content customer-dashboard-stat-content-responsive flex items-center justify-between">
              <div className="customer-dashboard-stat-info customer-dashboard-stat-info-responsive">
                <div className="customer-dashboard-stat-number customer-dashboard-stat-number-responsive text-xl lg:text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="customer-dashboard-stat-label customer-dashboard-stat-label-responsive text-xs lg:text-sm text-gray-600">
                  Total Reservasi
                </div>
              </div>
              <div className="customer-dashboard-stat-icon customer-dashboard-stat-icon-responsive w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="customer-dashboard-stat-icon-inner customer-dashboard-stat-icon-inner-responsive text-blue-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="customer-dashboard-stat customer-dashboard-stat-pending customer-dashboard-stat-responsive bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="customer-dashboard-stat-content customer-dashboard-stat-content-responsive flex items-center justify-between">
              <div className="customer-dashboard-stat-info customer-dashboard-stat-info-responsive">
                <div className="customer-dashboard-stat-number customer-dashboard-stat-number-responsive text-xl lg:text-2xl font-bold text-amber-600">
                  {stats.pending}
                </div>
                <div className="customer-dashboard-stat-label customer-dashboard-stat-label-responsive text-xs lg:text-sm text-gray-600">
                  Menunggu
                </div>
              </div>
              <div className="customer-dashboard-stat-icon customer-dashboard-stat-icon-responsive w-8 h-8 lg:w-10 lg:h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FaClock className="customer-dashboard-stat-icon-inner customer-dashboard-stat-icon-inner-responsive text-amber-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="customer-dashboard-stat customer-dashboard-stat-approved customer-dashboard-stat-responsive bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="customer-dashboard-stat-content customer-dashboard-stat-content-responsive flex items-center justify-between">
              <div className="customer-dashboard-stat-info customer-dashboard-stat-info-responsive">
                <div className="customer-dashboard-stat-number customer-dashboard-stat-number-responsive text-xl lg:text-2xl font-bold text-emerald-600">
                  {stats.approved}
                </div>
                <div className="customer-dashboard-stat-label customer-dashboard-stat-label-responsive text-xs lg:text-sm text-gray-600">
                  Disetujui
                </div>
              </div>
              <div className="customer-dashboard-stat-icon customer-dashboard-stat-icon-responsive w-8 h-8 lg:w-10 lg:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="customer-dashboard-stat-icon-inner customer-dashboard-stat-icon-inner-responsive text-emerald-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="customer-dashboard-stat customer-dashboard-stat-rejected customer-dashboard-stat-responsive bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="customer-dashboard-stat-content customer-dashboard-stat-content-responsive flex items-center justify-between">
              <div className="customer-dashboard-stat-info customer-dashboard-stat-info-responsive">
                <div className="customer-dashboard-stat-number customer-dashboard-stat-number-responsive text-xl lg:text-2xl font-bold text-red-500">
                  {stats.rejected}
                </div>
                <div className="customer-dashboard-stat-label customer-dashboard-stat-label-responsive text-xs lg:text-sm text-gray-600">
                  Ditolak
                </div>
              </div>
              <div className="customer-dashboard-stat-icon customer-dashboard-stat-icon-responsive w-8 h-8 lg:w-10 lg:h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FaTimesCircle className="customer-dashboard-stat-icon-inner customer-dashboard-stat-icon-inner-responsive text-red-500 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="customer-dashboard-stat customer-dashboard-stat-revenue customer-dashboard-stat-responsive bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="customer-dashboard-stat-content customer-dashboard-stat-content-responsive flex items-center justify-between">
              <div className="customer-dashboard-stat-info customer-dashboard-stat-info-responsive">
                <div className="customer-dashboard-stat-number customer-dashboard-stat-number-responsive text-lg lg:text-xl font-bold text-green-600">
                  Rp {stats.totalSpent.toLocaleString("id-ID")}
                </div>
                <div className="customer-dashboard-stat-label customer-dashboard-stat-label-responsive text-xs lg:text-sm text-gray-600">
                  Total Pengeluaran
                </div>
              </div>
              <div className="customer-dashboard-stat-icon customer-dashboard-stat-icon-responsive w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="customer-dashboard-stat-icon-inner customer-dashboard-stat-icon-inner-responsive text-green-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="customer-dashboard-bookings customer-dashboard-bookings-container customer-dashboard-bookings-responsive bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="customer-dashboard-bookings-header customer-dashboard-bookings-header-responsive p-4 lg:p-6 border-b border-gray-200">
            <div className="customer-dashboard-bookings-header-content customer-dashboard-bookings-header-content-responsive flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="customer-dashboard-bookings-header-info customer-dashboard-bookings-header-info-responsive">
                <h2 className="customer-dashboard-bookings-title customer-dashboard-bookings-title-responsive text-lg lg:text-xl font-bold text-gray-900">
                  Reservasi Terbaru
                </h2>
                <p className="customer-dashboard-bookings-subtitle customer-dashboard-bookings-subtitle-responsive text-sm text-gray-600">
                  Daftar reservasi venue Anda
                </p>
              </div>
              <div className="customer-dashboard-bookings-stats customer-dashboard-bookings-stats-responsive flex items-center space-x-2">
                <FaChartLine className="customer-dashboard-bookings-stats-icon customer-dashboard-bookings-stats-icon-responsive text-blue-600" />
                <span className="customer-dashboard-bookings-stats-text customer-dashboard-bookings-stats-text-responsive text-sm font-medium text-blue-600">
                  {bookings.length} reservasi
                </span>
              </div>
            </div>
          </div>

          <div className="customer-dashboard-bookings-content customer-dashboard-bookings-content-responsive p-4 lg:p-6">
            {bookings.length === 0 ? (
              <div className="customer-dashboard-bookings-empty customer-dashboard-bookings-empty-responsive text-center py-8 lg:py-12">
                <div className="customer-dashboard-bookings-empty-icon customer-dashboard-bookings-empty-icon-responsive text-4xl lg:text-6xl mb-4">
                  📅
                </div>
                <h3 className="customer-dashboard-bookings-empty-title customer-dashboard-bookings-empty-title-responsive text-lg lg:text-xl font-semibold text-gray-600 mb-2">
                  Belum Ada Reservasi
                </h3>
                <p className="customer-dashboard-bookings-empty-text customer-dashboard-bookings-empty-text-responsive text-gray-500 mb-6">
                  Anda belum memiliki reservasi venue. Mulai dengan membuat reservasi baru.
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="customer-dashboard-bookings-empty-btn customer-dashboard-bookings-empty-btn-responsive bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Buat Reservasi
                </button>
              </div>
            ) : (
              <div className="customer-dashboard-bookings-list customer-dashboard-bookings-list-responsive space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="customer-dashboard-booking customer-dashboard-booking-item customer-dashboard-booking-responsive border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="customer-dashboard-booking-content customer-dashboard-booking-content-responsive flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="customer-dashboard-booking-info customer-dashboard-booking-info-responsive flex-1">
                        <div className="customer-dashboard-booking-header customer-dashboard-booking-header-responsive flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="customer-dashboard-booking-title-section customer-dashboard-booking-title-section-responsive">
                            <h3 className="customer-dashboard-booking-title customer-dashboard-booking-title-responsive text-base lg:text-lg font-semibold text-gray-900 mb-1">
                              {booking.eventName || "Event"}
                            </h3>
                            <p className="customer-dashboard-booking-venue customer-dashboard-booking-venue-responsive text-sm text-gray-600 flex items-center">
                              <FaBuilding className="customer-dashboard-booking-venue-icon customer-dashboard-booking-venue-icon-responsive mr-2 text-gray-400" />
                              {booking.venueName || booking.roomName || "Venue"}
                            </p>
                          </div>
                          <div className="customer-dashboard-booking-status customer-dashboard-booking-status-responsive flex items-center space-x-2">
                            {getStatusIcon(booking.status)}
                            <span
                              className={`customer-dashboard-booking-status-badge customer-dashboard-booking-status-badge-responsive px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                            >
                              {getStatusText(booking.status)}
                            </span>
                          </div>
                        </div>

                        <div className="customer-dashboard-booking-details customer-dashboard-booking-details-responsive grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="customer-dashboard-booking-detail customer-dashboard-booking-detail-responsive">
                            <p className="customer-dashboard-booking-detail-label customer-dashboard-booking-detail-label-responsive text-gray-600">
                              Tanggal Acara
                            </p>
                            <p className="customer-dashboard-booking-detail-value customer-dashboard-booking-detail-value-responsive font-medium text-gray-900">
                              {formatDate(booking.eventDate || booking.checkIn)}
                            </p>
                          </div>
                          <div className="customer-dashboard-booking-detail customer-dashboard-booking-detail-responsive">
                            <p className="customer-dashboard-booking-detail-label customer-dashboard-booking-detail-label-responsive text-gray-600">
                              Jumlah Tamu
                            </p>
                            <p className="customer-dashboard-booking-detail-value customer-dashboard-booking-detail-value-responsive font-medium text-gray-900 flex items-center">
                              <FaUsers className="customer-dashboard-booking-detail-icon customer-dashboard-booking-detail-icon-responsive mr-1 text-gray-400" />
                              {booking.guests || booking.guestCount || 0}
                            </p>
                          </div>
                          <div className="customer-dashboard-booking-detail customer-dashboard-booking-detail-responsive">
                            <p className="customer-dashboard-booking-detail-label customer-dashboard-booking-detail-label-responsive text-gray-600">
                              Total Biaya
                            </p>
                            <p className="customer-dashboard-booking-detail-value customer-dashboard-booking-detail-value-responsive font-medium text-blue-600">
                              Rp {(booking.totalAmount || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="customer-dashboard-booking-detail customer-dashboard-booking-detail-responsive">
                            <p className="customer-dashboard-booking-detail-label customer-dashboard-booking-detail-label-responsive text-gray-600">
                              Tanggal Reservasi
                            </p>
                            <p className="customer-dashboard-booking-detail-value customer-dashboard-booking-detail-value-responsive font-medium text-gray-900">
                              {formatDate(booking.createdAt)}
                            </p>
                          </div>
                        </div>

                        {booking.status === "approved" && (
                          <div className="customer-dashboard-booking-approved customer-dashboard-booking-approved-responsive mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="customer-dashboard-booking-approved-text customer-dashboard-booking-approved-text-responsive text-sm text-emerald-700">
                              <FaCheckCircle className="customer-dashboard-booking-approved-icon customer-dashboard-booking-approved-icon-responsive inline mr-2" />
                              Reservasi disetujui! Silakan lakukan pembayaran sesuai instruksi.
                            </p>
                          </div>
                        )}

                        {booking.status === "rejected" && booking.rejectionReason && (
                          <div className="customer-dashboard-booking-rejected customer-dashboard-booking-rejected-responsive mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="customer-dashboard-booking-rejected-text customer-dashboard-booking-rejected-text-responsive text-sm text-red-700">
                              <FaTimesCircle className="customer-dashboard-booking-rejected-icon customer-dashboard-booking-rejected-icon-responsive inline mr-2" />
                              <span className="customer-dashboard-booking-rejected-label customer-dashboard-booking-rejected-label-responsive font-medium">
                                Ditolak:
                              </span>{" "}
                              {booking.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="customer-dashboard-booking-actions customer-dashboard-booking-actions-responsive flex items-center space-x-2 lg:ml-4">
                        <button className="customer-dashboard-booking-action customer-dashboard-booking-action-view customer-dashboard-booking-action-responsive w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <FaEye className="customer-dashboard-booking-action-icon customer-dashboard-booking-action-icon-responsive text-sm" />
                        </button>
                        <button className="customer-dashboard-booking-action customer-dashboard-booking-action-download customer-dashboard-booking-action-responsive w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center">
                          <FaDownload className="customer-dashboard-booking-action-icon customer-dashboard-booking-action-icon-responsive text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {bookings.length > 5 && (
                  <div className="customer-dashboard-bookings-more customer-dashboard-bookings-more-responsive text-center pt-4">
                    <button
                      onClick={() => (window.location.href = "/bookings")}
                      className="customer-dashboard-bookings-more-btn customer-dashboard-bookings-more-btn-responsive text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Lihat Semua Reservasi ({bookings.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="customer-dashboard-actions customer-dashboard-actions-container customer-dashboard-actions-responsive mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="customer-dashboard-action customer-dashboard-action-new customer-dashboard-action-responsive bg-blue-500 text-white p-4 lg:p-6 rounded-2xl hover:bg-blue-600 transition-colors text-left"
          >
            <div className="customer-dashboard-action-content customer-dashboard-action-content-responsive flex items-center space-x-3">
              <div className="customer-dashboard-action-icon customer-dashboard-action-icon-responsive w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="customer-dashboard-action-icon-inner customer-dashboard-action-icon-inner-responsive text-white" />
              </div>
              <div className="customer-dashboard-action-text customer-dashboard-action-text-responsive">
                <h3 className="customer-dashboard-action-title customer-dashboard-action-title-responsive font-semibold">
                  Buat Reservasi Baru
                </h3>
                <p className="customer-dashboard-action-desc customer-dashboard-action-desc-responsive text-sm text-blue-100">
                  Pilih venue untuk acara Anda
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "/bookings")}
            className="customer-dashboard-action customer-dashboard-action-manage customer-dashboard-action-responsive bg-emerald-500 text-white p-4 lg:p-6 rounded-2xl hover:bg-emerald-600 transition-colors text-left"
          >
            <div className="customer-dashboard-action-content customer-dashboard-action-content-responsive flex items-center space-x-3">
              <div className="customer-dashboard-action-icon customer-dashboard-action-icon-responsive w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
                <FaBuilding className="customer-dashboard-action-icon-inner customer-dashboard-action-icon-inner-responsive text-white" />
              </div>
              <div className="customer-dashboard-action-text customer-dashboard-action-text-responsive">
                <h3 className="customer-dashboard-action-title customer-dashboard-action-title-responsive font-semibold">
                  Kelola Reservasi
                </h3>
                <p className="customer-dashboard-action-desc customer-dashboard-action-desc-responsive text-sm text-emerald-100">
                  Lihat dan kelola reservasi Anda
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "/services")}
            className="customer-dashboard-action customer-dashboard-action-services customer-dashboard-action-responsive bg-purple-500 text-white p-4 lg:p-6 rounded-2xl hover:bg-purple-600 transition-colors text-left"
          >
            <div className="customer-dashboard-action-content customer-dashboard-action-content-responsive flex items-center space-x-3">
              <div className="customer-dashboard-action-icon customer-dashboard-action-icon-responsive w-10 h-10 bg-purple-400 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="customer-dashboard-action-icon-inner customer-dashboard-action-icon-inner-responsive text-white" />
              </div>
              <div className="customer-dashboard-action-text customer-dashboard-action-text-responsive">
                <h3 className="customer-dashboard-action-title customer-dashboard-action-title-responsive font-semibold">
                  Layanan Tambahan
                </h3>
                <p className="customer-dashboard-action-desc customer-dashboard-action-desc-responsive text-sm text-purple-100">
                  Pesan layanan untuk acara Anda
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
