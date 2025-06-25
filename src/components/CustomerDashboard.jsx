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
        return <FaClock className="text-amber-600" />
      case "approved":
        return <FaCheckCircle className="text-emerald-600" />
      case "rejected":
        return <FaTimesCircle className="text-red-600" />
      default:
        return <FaClock className="text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard Customer</h1>
          <p className="text-gray-600">Selamat datang, {currentUser?.displayName || currentUser?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs lg:text-sm text-gray-600">Total Reservasi</div>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-amber-600">{stats.pending}</div>
                <div className="text-xs lg:text-sm text-gray-600">Menunggu</div>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-amber-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-emerald-600">{stats.approved}</div>
                <div className="text-xs lg:text-sm text-gray-600">Disetujui</div>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-emerald-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-red-500">{stats.rejected}</div>
                <div className="text-xs lg:text-sm text-gray-600">Ditolak</div>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FaTimesCircle className="text-red-500 text-sm lg:text-base" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg lg:text-xl font-bold text-green-600">
                  Rp {stats.totalSpent.toLocaleString("id-ID")}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Total Pengeluaran</div>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-green-600 text-sm lg:text-base" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">Reservasi Terbaru</h2>
                <p className="text-sm text-gray-600">Daftar reservasi venue Anda</p>
              </div>
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{bookings.length} reservasi</span>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <div className="text-4xl lg:text-6xl mb-4">📅</div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-600 mb-2">Belum Ada Reservasi</h3>
                <p className="text-gray-500 mb-6">
                  Anda belum memiliki reservasi venue. Mulai dengan membuat reservasi baru.
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Buat Reservasi
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">
                              {booking.eventName || "Event"}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaBuilding className="mr-2 text-gray-400" />
                              {booking.venueName || booking.roomName || "Venue"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(booking.status)}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                            >
                              {getStatusText(booking.status)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Tanggal Acara</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(booking.eventDate || booking.checkIn)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Jumlah Tamu</p>
                            <p className="font-medium text-gray-900 flex items-center">
                              <FaUsers className="mr-1 text-gray-400" />
                              {booking.guests || booking.guestCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Biaya</p>
                            <p className="font-medium text-blue-600">
                              Rp {(booking.totalAmount || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tanggal Reservasi</p>
                            <p className="font-medium text-gray-900">{formatDate(booking.createdAt)}</p>
                          </div>
                        </div>

                        {booking.status === "approved" && (
                          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-sm text-emerald-700">
                              <FaCheckCircle className="inline mr-2" />
                              Reservasi disetujui! Silakan lakukan pembayaran sesuai instruksi.
                            </p>
                          </div>
                        )}

                        {booking.status === "rejected" && booking.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                              <FaTimesCircle className="inline mr-2" />
                              <span className="font-medium">Ditolak:</span> {booking.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 lg:ml-4">
                        <button className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <FaEye className="text-sm" />
                        </button>
                        <button className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center">
                          <FaDownload className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {bookings.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => (window.location.href = "/bookings")}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 text-white p-4 lg:p-6 rounded-2xl hover:bg-blue-600 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Buat Reservasi Baru</h3>
                <p className="text-sm text-blue-100">Pilih venue untuk acara Anda</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "/bookings")}
            className="bg-emerald-500 text-white p-4 lg:p-6 rounded-2xl hover:bg-emerald-600 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
                <FaBuilding className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Kelola Reservasi</h3>
                <p className="text-sm text-emerald-100">Lihat dan kelola reservasi Anda</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "/services")}
            className="bg-purple-500 text-white p-4 lg:p-6 rounded-2xl hover:bg-purple-600 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-400 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Layanan Tambahan</h3>
                <p className="text-sm text-purple-100">Pesan layanan untuk acara Anda</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
