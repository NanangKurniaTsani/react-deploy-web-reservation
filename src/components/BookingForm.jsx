"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import PaymentUpload from "./PaymentUpload"
import {
  FaSpinner,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaMoneyBillWave,
  FaUniversity,
  FaStore,
  FaChevronDown,
  FaArrowLeft,
  FaHome,
  FaEye,
} from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

const BookingForm = ({
  selectedRoom: selectedVenue = null,
  onSuccess = null,
  onCancel = null,
  onNavigateHome = null,
}) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    bookingName: "",
    eventName: "",
    checkIn: "",
    checkOut: "",
    timeSlot: "",
    venueSetup: "",
    specialRequests: "",
  })
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPayment, setSelectedPayment] = useState("")
  const [paymentType, setPaymentType] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPaymentUpload, setShowPaymentUpload] = useState(false)
  const [bookingData, setBookingData] = useState(null)

  useBackButton(() => {
    if (onCancel) onCancel()
    return true
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "paymentMethods"))
      const methods = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((method) => method.isActive)
      setPaymentMethods(methods)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const calculateDays = () => {
    if (!formData.checkIn || !formData.checkOut) return 1
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  const calculateTotal = () => {
    if (!selectedVenue) return 0
    const days = calculateDays()
    const timeSlot = timeSlotOptions.find((slot) => slot.value === formData.timeSlot)
    const timeMultiplier = timeSlot ? timeSlot.price : 1
    return selectedVenue.price * days * timeMultiplier
  }

  const getSelectedSetupCapacity = () => {
    if (!selectedVenue || !formData.venueSetup) return 0
    const setup = selectedVenue.setupOptions?.find((option) => option.type === formData.venueSetup)
    return setup ? setup.capacity : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!paymentType) {
      toast.error("Silakan pilih metode pembayaran")
      return
    }

    if (paymentType === "transfer" && !selectedPayment) {
      toast.error("Silakan pilih bank untuk transfer")
      return
    }

    setLoading(true)
    try {
      const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedPayment)
      const days = calculateDays()
      const timeSlot = timeSlotOptions.find((slot) => slot.value === formData.timeSlot)
      const venueSetup = selectedVenue.setupOptions?.find((option) => option.type === formData.venueSetup)

      const booking = {
        ...formData,
        venueId: selectedVenue.id || selectedVenue.docId,
        venueName: selectedVenue.name,
        venuePrice: selectedVenue.price,
        days: days,
        timeSlotDetails: timeSlot,
        venueSetupDetails: venueSetup,
        guestCapacity: venueSetup?.capacity || 0,
        totalAmount: calculateTotal(),
        paymentMethodId: selectedPayment || null,
        paymentMethod: selectedPaymentMethod || null,
        paymentType: paymentType,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: "pending",
        paymentStatus: paymentType === "cash" ? "pending-cash" : "pending-transfer",
        createdAt: new Date(),
        roomId: selectedVenue.id || selectedVenue.docId,
        roomName: selectedVenue.name,
        roomPrice: selectedVenue.price,
        eventDate: formData.checkIn,
        guests: venueSetup?.capacity || 0,
        guestCount: venueSetup?.capacity || 0,
      }

      const docRef = await addDoc(collection(db, "bookings"), booking)
      const bookingWithId = { ...booking, id: docRef.id }
      setBookingData(bookingWithId)

      if (paymentType === "transfer") {
        setShowPaymentUpload(true)
      } else {
        setSuccess(true)
      }

      setFormData({
        bookingName: "",
        eventName: "",
        checkIn: "",
        checkOut: "",
        timeSlot: "",
        venueSetup: "",
        specialRequests: "",
      })
      setSelectedPayment("")
      setPaymentType("")
      toast.success("Reservasi berhasil dibuat!")
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("Terjadi kesalahan saat membuat reservasi")
    }
    setLoading(false)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
  }

  const handleNavigateHome = () => {
    if (onNavigateHome) onNavigateHome()
  }

  const handleViewMyBookings = () => {
    if (onSuccess) onSuccess()
  }

  const handlePaymentUploadComplete = () => {
    setShowPaymentUpload(false)
    setSuccess(true)
  }

  const resetForm = () => {
    setFormData({
      bookingName: "",
      eventName: "",
      checkIn: "",
      checkOut: "",
      timeSlot: "",
      venueSetup: "",
      specialRequests: "",
    })
    setSelectedPayment("")
    setPaymentType("")
    setSuccess(false)
    setShowPaymentUpload(false)
    setBookingData(null)
  }

  if (showPaymentUpload && bookingData) {
    return (
      <PaymentUpload
        booking={bookingData}
        onComplete={handlePaymentUploadComplete}
        onCancel={() => setShowPaymentUpload(false)}
      />
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 mobile-px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mobile-p-6 text-center mobile-card">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 mobile-mb-6">
            <FaCheckCircle className="text-blue-600 text-2xl mobile-text-xl" />
          </div>
          <h2 className="text-2xl mobile-text-xl font-bold text-gray-900 mb-4 mobile-mb-4">Reservasi Berhasil!</h2>
          <p className="text-gray-600 mb-6 mobile-mb-6 leading-relaxed text-base mobile-text-sm">
            {paymentType === "cash"
              ? "Reservasi venue Anda berhasil dibuat. Silakan datang ke lokasi untuk melakukan pembayaran dan konfirmasi."
              : "Reservasi venue Anda berhasil dibuat dan bukti pembayaran telah diupload. Menunggu konfirmasi admin."}
          </p>

          <div className="space-y-3 mobile-space-y-3">
            <button
              onClick={handleViewMyBookings}
              className="w-full bg-blue-500 text-white px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2 mobile-space-x-2 mobile-button"
            >
              <FaEye className="mobile-icon-sm" />
              <span>Lihat Reservasi Saya</span>
            </button>

            <button
              onClick={handleNavigateHome}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2 mobile-space-x-2 mobile-button"
            >
              <FaHome className="mobile-icon-sm" />
              <span>Kembali ke Beranda</span>
            </button>

            <button
              onClick={resetForm}
              className="w-full bg-white text-blue-600 border border-blue-200 px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-blue-50 transition-colors font-medium mobile-button"
            >
              Buat Reservasi Lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 mobile-space-y-4 px-4 mobile-px-4">
      <div className="flex items-center space-x-3 sm:space-x-4 mobile-space-x-3">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 mobile-space-x-2 text-gray-600 hover:text-gray-900 transition-colors mobile-touch-target p-2 mobile-p-2 rounded-lg hover:bg-gray-100"
        >
          <FaArrowLeft className="mobile-icon-sm" />
          <span className="text-sm sm:text-base mobile-text-sm">Kembali</span>
        </button>
        <h1 className="text-xl sm:text-2xl mobile-text-xl font-bold text-gray-900">Form Reservasi Venue</h1>
      </div>

      {selectedVenue && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mobile-p-4 mobile-card">
          <h3 className="text-base sm:text-lg mobile-text-base font-semibold text-gray-900 mb-3 sm:mb-4 mobile-mb-3">
            Venue Dipilih
          </h3>
          <div className="flex items-start space-x-3 sm:space-x-4 mobile-space-x-3">
            <img
              src={
                selectedVenue.images?.[0] ||
                selectedVenue.imageUrl ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop"
              }
              alt={selectedVenue.name}
              className="w-20 h-15 sm:w-24 sm:h-18 object-cover rounded-xl mobile-image flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">{selectedVenue.name}</h4>
              <p className="text-gray-600 text-xs sm:text-sm mobile-text-xs mt-1 line-clamp-2">
                {selectedVenue.description}
              </p>
              <div className="flex items-center space-x-4 mobile-space-x-4 mt-2">
                <span className="text-base sm:text-lg mobile-text-base font-bold text-blue-600">
                  Rp {selectedVenue.price?.toLocaleString("id-ID")}/hari
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mobile-p-4 mobile-card">
        <h2 className="text-lg sm:text-xl mobile-text-lg font-bold text-gray-900 mb-4 sm:mb-6 mobile-mb-4">
          Detail Reservasi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mobile-space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mobile-grid-1">
            <div className="mobile-form-group">
              <label className="block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaCalendarAlt className="inline mr-2 text-blue-600 mobile-icon-sm" />
                Nama Booking *
              </label>
              <input
                type="text"
                name="bookingName"
                value={formData.bookingName}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nama untuk identifikasi booking"
              />
            </div>

            <div className="mobile-form-group">
              <label className="block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaCalendarAlt className="inline mr-2 text-blue-600 mobile-icon-sm" />
                Nama Acara/Reservasi *
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Acara pernikahan, Meeting perusahaan, dll"
              />
            </div>

            <div className="mobile-form-group">
              <label className="block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaCalendarAlt className="inline mr-2 text-blue-600 mobile-icon-sm" />
                Tanggal Mulai *
              </label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mobile-form-group">
              <label className="block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaClock className="inline mr-2 text-blue-600 mobile-icon-sm" />
                Tanggal Selesai *
              </label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                required
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mobile-form-group">
              <label className="block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaClock className="inline mr-2 text-blue-600 mobile-icon-sm" />
                Waktu Penggunaan *
              </label>
              <div className="relative">
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="" disabled hidden>
                    Pilih Waktu Penggunaan
                  </option>
                  {timeSlotOptions.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none mobile-icon-sm" />
              </div>
            </div>

            <div className="mobile-form-group">
              <label className="block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaUsers className="inline mr-2 text-blue-600 mobile-icon-sm" />
                Setup Venue & Kapasitas *
              </label>
              <div className="relative">
                <select
                  name="venueSetup"
                  value={formData.venueSetup}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="" disabled hidden>
                    Pilih Setup Venue & Kapasitas
                  </option>
                  {selectedVenue?.setupOptions?.map((setup) => (
                    <option key={setup.type} value={setup.type}>
                      {setup.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none mobile-icon-sm" />
              </div>
              {formData.venueSetup && (
                <div className="mt-2 p-2 sm:p-3 mobile-p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm mobile-text-xs text-blue-700 font-medium">
                    Kapasitas Terpilih: {getSelectedSetupCapacity()} orang
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mobile-form-group">
            <label className="block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
              Permintaan Khusus (Opsional)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Permintaan khusus seperti dekorasi, catering, sound system tambahan, dll..."
            />
          </div>

          <div>
            <h4 className="text-base sm:text-lg mobile-text-base font-semibold text-gray-900 mb-3 sm:mb-4 mobile-mb-3">
              <FaMoneyBillWave className="inline mr-2 text-blue-600 mobile-icon-sm" />
              Pilih Metode Pembayaran *
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mobile-grid-1 mb-4 sm:mb-6 mobile-mb-4">
              <div
                className={`border-2 rounded-2xl p-3 sm:p-4 mobile-p-3 cursor-pointer transition-all mobile-touch-target ${
                  paymentType === "transfer"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPaymentType("transfer")}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="transfer"
                    checked={paymentType === "transfer"}
                    onChange={() => setPaymentType("transfer")}
                    className="text-blue-600 mobile-touch-target"
                  />
                  <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaUniversity className="text-blue-600 mobile-icon-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">Transfer Bank</p>
                      <p className="text-xs sm:text-sm mobile-text-xs text-gray-600">
                        Bayar via transfer + upload bukti
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-2xl p-3 sm:p-4 mobile-p-3 cursor-pointer transition-all mobile-touch-target ${
                  paymentType === "cash"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPaymentType("cash")}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="cash"
                    checked={paymentType === "cash"}
                    onChange={() => setPaymentType("cash")}
                    className="text-blue-600 mobile-touch-target"
                  />
                  <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaStore className="text-blue-600 mobile-icon-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">Bayar di Tempat</p>
                      <p className="text-xs sm:text-sm mobile-text-xs text-gray-600">Bayar saat datang ke lokasi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {paymentType === "transfer" && paymentMethods.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mobile-grid-1">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-2xl p-3 sm:p-4 mobile-p-3 cursor-pointer transition-all mobile-touch-target ${
                      selectedPayment === method.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="text-blue-600 mobile-touch-target"
                      />
                      <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FaUniversity className="text-blue-600 mobile-icon-sm" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">
                            {method.name}
                          </p>
                          <p className="text-xs sm:text-sm mobile-text-xs text-gray-600">{method.accountNumber}</p>
                          <p className="text-xs sm:text-sm mobile-text-xs text-gray-600">a.n. {method.accountName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {paymentType === "cash" && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:p-4 mobile-p-3">
                <p className="text-blue-800 font-medium text-sm sm:text-base mobile-text-sm">Pembayaran di Tempat</p>
                <p className="text-blue-600 text-xs sm:text-sm mobile-text-xs mt-1">
                  Anda akan mendapat kartu konfirmasi untuk dibawa saat datang ke lokasi untuk melakukan pembayaran.
                </p>
              </div>
            )}
          </div>

          {selectedVenue && formData.checkIn && formData.checkOut && formData.timeSlot && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 mobile-p-4">
              <h4 className="text-base sm:text-lg mobile-text-base font-semibold text-gray-900 mb-3 sm:mb-4 mobile-mb-3">
                Ringkasan Pembayaran
              </h4>
              <div className="space-y-2 sm:space-y-3 mobile-space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base mobile-text-sm">Harga venue per hari</span>
                  <span className="font-semibold text-sm sm:text-base mobile-text-sm">
                    Rp {selectedVenue.price?.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base mobile-text-sm">Jumlah hari</span>
                  <span className="font-semibold text-sm sm:text-base mobile-text-sm">{calculateDays()} hari</span>
                </div>
                {formData.timeSlot && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base mobile-text-sm">Waktu penggunaan</span>
                    <span className="font-semibold text-sm sm:text-base mobile-text-sm">
                      {timeSlotOptions.find((slot) => slot.value === formData.timeSlot)?.label}
                    </span>
                  </div>
                )}
                {formData.venueSetup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base mobile-text-sm">Setup venue</span>
                    <span className="font-semibold text-sm sm:text-base mobile-text-sm">
                      {selectedVenue.setupOptions?.find((setup) => setup.type === formData.venueSetup)?.label}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 sm:pt-3 mobile-pt-2">
                  <div className="flex justify-between text-base sm:text-lg mobile-text-base font-bold">
                    <span>Total Pembayaran</span>
                    <span className="text-blue-600">Rp {calculateTotal().toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mobile-space-y-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-4 mobile-py-3 px-4 sm:px-6 mobile-px-4 rounded-2xl hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-lg mobile-text-sm mobile-button"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !selectedVenue ||
                !paymentType ||
                (paymentType === "transfer" && !selectedPayment) ||
                !formData.checkIn ||
                !formData.checkOut ||
                !formData.timeSlot ||
                !formData.venueSetup
              }
              className="flex-1 bg-blue-500 text-white py-3 sm:py-4 mobile-py-3 px-4 sm:px-6 mobile-px-4 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-lg mobile-text-sm flex items-center justify-center mobile-button"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 sm:mr-3 mobile-mr-2 mobile-icon-sm" />
                  Memproses Reservasi...
                </>
              ) : (
                "Konfirmasi Reservasi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

BookingForm.propTypes = {
  selectedRoom: PropTypes.shape({
    docId: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    capacity: PropTypes.number,
    price: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    setupOptions: PropTypes.arrayOf(PropTypes.object),
  }),
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onNavigateHome: PropTypes.func,
}

export default BookingForm