"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import ReservationCard from "./ReservationCard"
import {
  FaSpinner,
  FaCalendarAlt,
  FaDownload,
  FaCheckCircle,
  FaSyncAlt,
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
} from "react-icons/fa"
import toast from "react-hot-toast"

const MyBookings = () => {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCard, setShowCard] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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
        // Changed from toast.info to toast.success
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
    // Filter by status
    if (filter !== "all" && booking.status !== filter) {
      return false
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        booking.eventName?.toLowerCase().includes(searchLower) ||
        booking.roomName?.toLowerCase().includes(searchLower) ||
        booking.status?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const getStats = () => {
    const total = bookings.length
    const pending = bookings.filter((b) => b.status === "pending").length
    const approved = bookings.filter((b) => b.status === "approved").length
    const rejected = bookings.filter((b) => b.status === "rejected").length

    return { total, pending, approved, rejected }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat reservasi Anda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservasi Saya</h1>
          <p className="text-gray-600">Kelola dan pantau status reservasi Anda</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Reservasi</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Menunggu</div>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FaSyncAlt className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
                <div className="text-sm text-gray-600">Disetujui</div>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Ditolak</div>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari reservasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-6 shadow-sm border border-gray-200">
          <div className="flex space-x-1">
            {[
              { id: "all", name: "Semua" },
              { id: "pending", name: "Menunggu" },
              { id: "approved", name: "Disetujui" },
              { id: "rejected", name: "Ditolak" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === tab.id ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {bookings.length === 0 ? "Belum Ada Reservasi" : "Tidak Ada Data"}
            </h3>
            <p className="text-gray-500 mb-6">
              {bookings.length === 0
                ? "Anda belum memiliki reservasi. Mulai dengan membuat reservasi baru."
                : "Tidak ada reservasi dengan filter yang dipilih."}
            </p>
            {bookings.length === 0 && (
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Buat Reservasi
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.eventName}</h3>
                      <p className="text-gray-600 text-sm">{booking.roomName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                      <button
                        onClick={() => handleDownloadCard(booking)}
                        className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                        title="Download Kartu Reservasi"
                      >
                        <FaDownload className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Acara</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.eventDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Reservasi</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Tamu</p>
                      <p className="font-medium text-gray-900">{booking.guestCount} orang</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Biaya</p>
                      <p className="font-medium text-blue-600">
                        Rp {booking.totalAmount?.toLocaleString("id-ID") || "0"}
                      </p>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Deskripsi</p>
                      <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{booking.description}</p>
                    </div>
                  )}

                  {booking.status === "rejected" && booking.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Alasan Penolakan:</span> {booking.rejectionReason}
                      </p>
                    </div>
                  )}

                  {booking.status === "approved" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-sm text-emerald-700">
                        <span className="font-medium">Status:</span> Reservasi Anda telah disetujui! Silakan lakukan
                        pembayaran sesuai instruksi.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Card Modal */}
        {showCard && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <ReservationCard booking={selectedBooking} onClose={() => setShowCard(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings
