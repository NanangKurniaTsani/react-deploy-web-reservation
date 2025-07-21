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
  FaTimes,
} from "react-icons/fa"
import toast from "react-hot-toast"

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
      toast.error("Gagal memuat data", { duration: 1500 })
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
      toast.success("Reservasi disetujui!", { duration: 1500 })
      fetchBookings()
    } catch (error) {
      console.error("Error approving booking:", error)
      toast.error("Gagal menyetujui reservasi", { duration: 1500 })
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
      toast.success("Reservasi ditolak!", { duration: 1500 })
      fetchBookings()
    } catch (error) {
      console.error("Error rejecting booking:", error)
      toast.error("Gagal menolak reservasi", { duration: 1500 })
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Yakin ingin menghapus reservasi ini?")) {
      try {
        await deleteDoc(doc(db, "bookings", bookingId))
        toast.success("Reservasi dihapus!", { duration: 1500 })
        fetchBookings()
      } catch (error) {
        console.error("Error deleting booking:", error)
        toast.error("Gagal menghapus reservasi", { duration: 1500 })
      }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman admin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel Admin</h1>
          <p className="text-gray-600">Kelola reservasi venue dan sistem hotel</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reservasi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCalendarCheck className="text-blue-600 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingBookings}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-amber-600 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disetujui</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedBookings}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheck className="text-green-600 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan</p>
                <p className="text-lg font-bold text-blue-600">Rp {stats.totalRevenue.toLocaleString("id-ID")}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="text-blue-600 text-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", name: "Overview", icon: FaChartBar },
              { id: "bookings", name: "Reservasi", icon: FaCalendarCheck },
              { id: "venues", name: "Venue", icon: FaBuilding },
              { id: "payments", name: "Pembayaran", icon: FaMoneyBillWave },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="text-sm" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Sistem</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FaBuilding className="text-blue-600 text-xl" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{venues.length}</p>
                <p className="text-gray-600 text-sm">Total Venue</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FaUserTie className="text-blue-600 text-xl" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-gray-600 text-sm">Total Pengguna</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FaCreditCard className="text-blue-600 text-xl" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{paymentMethods.length}</p>
                <p className="text-gray-600 text-sm">Metode Pembayaran</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari reservasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <FaCalendarCheck className="text-4xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Reservasi</h3>
                  <p className="text-gray-600">Reservasi dari customer akan muncul di sini</p>
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
