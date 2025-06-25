"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import AdminBookingCard from "./AdminBookingCard"
import VenueManagement from "./VenueManagement"
import PaymentSettings from "./PaymentSettings"
import {
  FaCalendarCheck,
  FaMoneyBillWave,
  FaBuilding,
  FaCheck,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaClock,
  FaUserTie,
  FaCreditCard,
} from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

const AdminDashboard = () => {
  const { currentUser, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [bookings, setBookings] = useState([])
  const [venues, setVenues] = useState([])
  const [users, setUsers] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    totalRevenue: 0,
    totalVenues: 0,
    totalUsers: 0,
  })

  useBackButton(() => {
    if (activeTab !== "overview") {
      setActiveTab("overview")
      return true
    }
    return false
  })

  useEffect(() => {
    if (userRole === "admin") {
      fetchAllData()
    }
  }, [userRole])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchBookings(), fetchVenues(), fetchUsers(), fetchPaymentMethods()])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Gagal memuat data")
    }
    setLoading(false)
  }

  const fetchBookings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"))
      const bookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      const filteredBookings = bookingsData.filter((booking) => booking.userEmail !== currentUser.email)
      setBookings(filteredBookings)
      calculateStats(filteredBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const fetchVenues = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "venues"))
      const venuesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setVenues(venuesData)
    } catch (error) {
      console.error("Error fetching venues:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "paymentMethods"))
      const methodsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPaymentMethods(methodsData)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    }
  }

  const calculateStats = (bookingsData) => {
    const totalBookings = bookingsData.length
    const pendingBookings = bookingsData.filter((b) => b.status === "pending").length
    const approvedBookings = bookingsData.filter((b) => b.status === "approved").length
    const rejectedBookings = bookingsData.filter((b) => b.status === "rejected").length
    const totalRevenue = bookingsData
      .filter((b) => b.status === "approved")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    setStats({
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalRevenue,
      totalVenues: venues.length,
      totalUsers: users.length,
    })
  }

  const handleApproveBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: currentUser.uid,
      })
      toast.success("Reservasi disetujui!")
      fetchBookings()
    } catch (error) {
      console.error("Error approving booking:", error)
      toast.error("Gagal menyetujui reservasi")
    }
  }

  const handleRejectBooking = async (bookingId, reason = "") => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: currentUser.uid,
        rejectionReason: reason,
      })
      toast.success("Reservasi ditolak!")
      fetchBookings()
    } catch (error) {
      console.error("Error rejecting booking:", error)
      toast.error("Gagal menolak reservasi")
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Yakin ingin menghapus reservasi ini?")) {
      try {
        await deleteDoc(doc(db, "bookings", bookingId))
        toast.success("Reservasi dihapus!")
        fetchBookings()
      } catch (error) {
        console.error("Error deleting booking:", error)
        toast.error("Gagal menghapus reservasi")
      }
    }
  }

  const formatDate = (date) => {
    if (!date) return "Tanggal tidak tersedia"
    try {
      if (date.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("id-ID")
      }
      if (date instanceof Date) {
        return date.toLocaleDateString("id-ID")
      }
      return new Date(date).toLocaleDateString("id-ID")
    } catch (error) {
      return "Tanggal tidak valid"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700"
      case "approved":
        return "bg-blue-100 text-blue-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venueName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mobile-safe-area">
        <div className="text-center p-6 mobile-p-6">
          <h2 className="text-2xl mobile-text-xl font-bold text-gray-900 mb-4 mobile-mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 text-base mobile-text-base">Anda tidak memiliki akses ke halaman admin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 mobile-safe-area">
      <div className="container mx-auto px-4 py-6 sm:py-8 mobile-px-4 mobile-py-6">
        <div className="mb-6 sm:mb-8 mobile-mb-6">
          <h1 className="text-2xl sm:text-3xl mobile-text-2xl font-bold text-gray-900 mb-2">Panel Admin</h1>
          <p className="text-gray-600 text-base mobile-text-base">Kelola reservasi venue dan sistem hotel</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mobile-stats-grid mb-6 sm:mb-8 mobile-mb-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mobile-text-sm font-medium text-gray-600 mobile-stats-label">Total Reservasi</p>
                <p className="text-2xl mobile-stats-number text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCalendarCheck className="text-blue-600 text-lg sm:text-xl mobile-icon-base" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mobile-text-sm font-medium text-gray-600 mobile-stats-label">Menunggu Persetujuan</p>
                <p className="text-2xl mobile-stats-number text-amber-600">{stats.pendingBookings}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-amber-600 text-lg sm:text-xl mobile-icon-base" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mobile-text-sm font-medium text-gray-600 mobile-stats-label">Disetujui</p>
                <p className="text-2xl mobile-stats-number text-blue-600">{stats.approvedBookings}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCheck className="text-blue-600 text-lg sm:text-xl mobile-icon-base" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mobile-text-sm font-medium text-gray-600 mobile-stats-label">Total Pendapatan</p>
                <p className="text-xl sm:text-2xl mobile-text-lg font-bold text-blue-600">
                  Rp {stats.totalRevenue.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-blue-600 text-lg sm:text-xl mobile-icon-base" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 sm:mb-8 mobile-mb-6 mobile-card">
          <div className="flex flex-wrap border-b border-gray-200 overflow-x-auto mobile-tabs">
            {[
              { id: "overview", name: "Overview", icon: FaChartBar },
              { id: "bookings", name: "Reservasi", icon: FaCalendarCheck },
              { id: "venues", name: "Venue", icon: FaBuilding },
              { id: "payments", name: "Pembayaran", icon: FaMoneyBillWave },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 mobile-space-x-2 px-4 sm:px-6 mobile-px-4 py-3 sm:py-4 mobile-py-3 font-medium transition-colors whitespace-nowrap mobile-tab-item mobile-touch-target ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 mobile-tab-active"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="text-sm mobile-icon-sm" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6 mobile-space-y-6">
            <div className="bg-white rounded-2xl p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-card">
              <h3 className="text-lg mobile-text-lg font-semibold text-gray-900 mb-4 mobile-mb-4">Ringkasan Sistem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mobile-grid-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 mobile-mb-3">
                    <FaBuilding className="text-blue-600 text-2xl mobile-text-xl" />
                  </div>
                  <p className="text-2xl mobile-text-xl font-bold text-gray-900">{venues.length}</p>
                  <p className="text-gray-600 text-sm mobile-text-sm mobile-stats-label">Total Venue</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 mobile-mb-3">
                    <FaUserTie className="text-blue-600 text-2xl mobile-text-xl" />
                  </div>
                  <p className="text-2xl mobile-text-xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-gray-600 text-sm mobile-text-sm mobile-stats-label">Total Pengguna</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 mobile-mb-3">
                    <FaCreditCard className="text-blue-600 text-2xl mobile-text-xl" />
                  </div>
                  <p className="text-2xl mobile-text-xl font-bold text-gray-900">{paymentMethods.length}</p>
                  <p className="text-gray-600 text-sm mobile-text-sm mobile-stats-label">Metode Pembayaran</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6 mobile-space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 mobile-p-4 shadow-sm border border-gray-200 mobile-card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 mobile-icon-sm" />
                  <input
                    type="text"
                    placeholder="Cari reservasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2 mobile-space-x-2">
                  <FaFilter className="text-gray-400 mobile-icon-sm" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mobile-space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12 mobile-loading">
                  <FaSpinner className="animate-spin text-4xl mobile-text-2xl text-blue-500" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12 mobile-py-6">
                  <FaCalendarCheck className="text-6xl mobile-text-2xl text-gray-300 mx-auto mb-4 mobile-mb-4" />
                  <h3 className="text-xl mobile-text-lg font-semibold text-gray-900 mb-2">Belum Ada Reservasi</h3>
                  <p className="text-gray-600 text-base mobile-text-base">
                    Reservasi dari customer akan muncul di sini
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <AdminBookingCard
                    key={booking.id}
                    booking={booking}
                    onApprove={handleApproveBooking}
                    onReject={handleRejectBooking}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "venues" && <VenueManagement />}

        {activeTab === "payments" && <PaymentSettings />}
      </div>
    </div>
  )
}

export default AdminDashboard