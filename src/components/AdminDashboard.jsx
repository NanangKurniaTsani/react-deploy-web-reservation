"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "../config/firebase"
import AdminBookingCard from "./AdminBookingCard"
import RoomManagement from "./RoomManagement"
import PaymentSettings from "./PaymentSettings"
import { FaSpinner, FaClipboardList, FaBuilding, FaCreditCard, FaSearch, FaFilter } from "react-icons/fa"
import toast from "react-hot-toast"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("pengajuan")
  const [bookings, setBookings] = useState([])
  const [serviceBookings, setServiceBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [bookingType, setBookingType] = useState("all") // all, room, service
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  const tabs = [
    { id: "pengajuan", name: "Pengajuan", icon: FaClipboardList, color: "bg-blue-500" },
    { id: "rooms", name: "Kamar", icon: FaBuilding, color: "bg-emerald-500" },
    { id: "payments", name: "Pembayaran", icon: FaCreditCard, color: "bg-purple-500" },
  ]

  useEffect(() => {
    if (activeTab === "pengajuan") {
      fetchAllBookings()
    }
  }, [activeTab])

  useEffect(() => {
    calculateStats()
  }, [bookings, serviceBookings])

  const fetchAllBookings = async () => {
    setLoading(true)
    try {
      // Fetch room bookings
      const roomQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"))
      const roomSnapshot = await getDocs(roomQuery)
      const roomBookingsData = roomSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "room",
        ...doc.data(),
      }))

      // Fetch service bookings
      const serviceQuery = query(collection(db, "serviceBookings"), orderBy("createdAt", "desc"))
      const serviceSnapshot = await getDocs(serviceQuery)
      const serviceBookingsData = serviceSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "service",
        ...doc.data(),
      }))

      setBookings(roomBookingsData)
      setServiceBookings(serviceBookingsData)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Gagal memuat data pengajuan")
    }
    setLoading(false)
  }

  const calculateStats = () => {
    const allBookings = [...bookings, ...serviceBookings]
    const total = allBookings.length
    const pending = allBookings.filter((b) => b.status === "pending").length
    const approved = allBookings.filter((b) => b.status === "approved").length
    const rejected = allBookings.filter((b) => b.status === "rejected").length
    setStats({ total, pending, approved, rejected })
  }

  const handleApprove = async (bookingId, type) => {
    try {
      const collection_name = type === "room" ? "bookings" : "serviceBookings"
      await updateDoc(doc(db, collection_name, bookingId), {
        status: "approved",
        approvedAt: new Date(),
      })

      if (type === "room") {
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId ? { ...booking, status: "approved", approvedAt: new Date() } : booking,
          ),
        )
      } else {
        setServiceBookings(
          serviceBookings.map((booking) =>
            booking.id === bookingId ? { ...booking, status: "approved", approvedAt: new Date() } : booking,
          ),
        )
      }

      toast.success("Pengajuan berhasil disetujui")
    } catch (error) {
      console.error("Error approving booking:", error)
      toast.error("Gagal menyetujui pengajuan")
    }
  }

  const handleReject = async (bookingId, reason, type) => {
    try {
      const collection_name = type === "room" ? "bookings" : "serviceBookings"
      await updateDoc(doc(db, collection_name, bookingId), {
        status: "rejected",
        rejectionReason: reason,
        rejectedAt: new Date(),
      })

      if (type === "room") {
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "rejected", rejectionReason: reason, rejectedAt: new Date() }
              : booking,
          ),
        )
      } else {
        setServiceBookings(
          serviceBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "rejected", rejectionReason: reason, rejectedAt: new Date() }
              : booking,
          ),
        )
      }

      toast.success("Pengajuan berhasil ditolak")
    } catch (error) {
      console.error("Error rejecting booking:", error)
      toast.error("Gagal menolak pengajuan")
    }
  }

  const getAllBookings = () => {
    let allBookings = []

    if (bookingType === "all") {
      allBookings = [...bookings, ...serviceBookings]
    } else if (bookingType === "room") {
      allBookings = bookings
    } else if (bookingType === "service") {
      allBookings = serviceBookings
    }

    return allBookings.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB - dateA
    })
  }

  const filteredBookings = getAllBookings().filter((booking) => {
    if (filter !== "all" && booking.status !== filter) {
      return false
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        booking.eventName?.toLowerCase().includes(searchLower) ||
        booking.serviceName?.toLowerCase().includes(searchLower) ||
        booking.userEmail?.toLowerCase().includes(searchLower) ||
        booking.roomName?.toLowerCase().includes(searchLower) ||
        booking.serviceCategory?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const renderContent = () => {
    switch (activeTab) {
      case "pengajuan":
        return renderPengajuan()
      case "rooms":
        return <RoomManagement />
      case "payments":
        return <PaymentSettings />
      default:
        return renderPengajuan()
    }
  }

  const renderPengajuan = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      )
    }

    return (
      <>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Pengajuan</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Menunggu Review</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Disetujui</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Ditolak</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengajuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Jenis</option>
              <option value="room">Kamar</option>
              <option value="service">Layanan</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Review</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Pengajuan List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak Ada Pengajuan</h3>
              <p className="text-gray-500">Belum ada pengajuan yang masuk.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <AdminBookingCard
                key={`${booking.type}-${booking.id}`}
                booking={booking}
                onApprove={(id) => handleApprove(id, booking.type)}
                onReject={(id, reason) => handleReject(id, reason, booking.type)}
              />
            ))
          )}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Kelola sistem reservasi hotel</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative p-4 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white shadow-lg scale-105 border border-gray-200"
                  : "bg-white/70 hover:bg-white hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-12 h-12 rounded-xl ${tab.color} flex items-center justify-center ${
                    activeTab === tab.id ? "shadow-lg" : ""
                  }`}
                >
                  <tab.icon className="text-white text-lg" />
                </div>
                <span className={`text-sm font-medium ${activeTab === tab.id ? "text-gray-900" : "text-gray-600"}`}>
                  {tab.name}
                </span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[60vh]">{renderContent()}</div>
      </div>
    </div>
  )
}

export default AdminDashboard
