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

  const timeSlotOptions = [
    { value: "full-day", label: "Full Day (08:00 - 22:00)", price: 1 },
    { value: "morning", label: "Pagi (08:00 - 12:00)", price: 0.6 },
    { value: "afternoon", label: "Siang (13:00 - 17:00)", price: 0.6 },
    { value: "evening", label: "Malam (18:00 - 22:00)", price: 0.6 },
  ]
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
      <div className="booking-form-success booking-form-success-container booking-form-success-responsive max-w-2xl mx-auto px-4 mobile-px-4">
        <div className="booking-form-success-card booking-form-success-card-responsive bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mobile-p-6 text-center mobile-card">
          <div className="booking-form-success-icon booking-form-success-icon-responsive w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 mobile-mb-6">
            <FaCheckCircle className="booking-form-success-check booking-form-success-check-responsive text-blue-600 text-2xl mobile-text-xl" />
          </div>
          <h2 className="booking-form-success-title booking-form-success-title-responsive text-2xl mobile-text-xl font-bold text-gray-900 mb-4 mobile-mb-4">
            Reservasi Berhasil!
          </h2>
          <p className="booking-form-success-text booking-form-success-text-responsive text-gray-600 mb-6 mobile-mb-6 leading-relaxed text-base mobile-text-sm">
            {paymentType === "cash"
              ? "Reservasi venue Anda berhasil dibuat. Silakan datang ke lokasi untuk melakukan pembayaran dan konfirmasi."
              : "Reservasi venue Anda berhasil dibuat dan bukti pembayaran telah diupload. Menunggu konfirmasi admin."}
          </p>

          <div className="booking-form-success-buttons booking-form-success-buttons-responsive space-y-3 mobile-space-y-3">
            <button
              onClick={handleViewMyBookings}
              className="booking-form-success-btn booking-form-success-btn-view booking-form-success-btn-responsive w-full bg-blue-500 text-white px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2 mobile-space-x-2 mobile-button"
            >
              <FaEye className="booking-form-success-btn-icon booking-form-success-btn-icon-responsive mobile-icon-sm" />
              <span>Lihat Reservasi Saya</span>
            </button>

            <button
              onClick={handleNavigateHome}
              className="booking-form-success-btn booking-form-success-btn-home booking-form-success-btn-responsive w-full bg-gray-200 text-gray-800 px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2 mobile-space-x-2 mobile-button"
            >
              <FaHome className="booking-form-success-btn-icon booking-form-success-btn-icon-responsive mobile-icon-sm" />
              <span>Kembali ke Beranda</span>
            </button>

            <button
              onClick={resetForm}
              className="booking-form-success-btn booking-form-success-btn-reset booking-form-success-btn-responsive w-full bg-white text-blue-600 border border-blue-200 px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-blue-50 transition-colors font-medium mobile-button"
            >
              Buat Reservasi Lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-form booking-form-container booking-form-responsive max-w-4xl mx-auto space-y-4 sm:space-y-6 mobile-space-y-4 px-4 mobile-px-4">
      <div className="booking-form-header booking-form-header-container booking-form-header-responsive flex items-center space-x-3 sm:space-x-4 mobile-space-x-3">
        <button
          onClick={handleCancel}
          className="booking-form-back booking-form-back-btn booking-form-back-responsive flex items-center space-x-2 mobile-space-x-2 text-gray-600 hover:text-gray-900 transition-colors mobile-touch-target p-2 mobile-p-2 rounded-lg hover:bg-gray-100"
        >
          <FaArrowLeft className="booking-form-back-icon booking-form-back-icon-responsive mobile-icon-sm" />
          <span className="booking-form-back-text booking-form-back-text-responsive text-sm sm:text-base mobile-text-sm">
            Kembali
          </span>
        </button>
        <h1 className="booking-form-title booking-form-title-responsive text-xl sm:text-2xl mobile-text-xl font-bold text-gray-900">
          Form Reservasi Venue
        </h1>
      </div>

      {selectedVenue && (
        <div className="booking-form-venue booking-form-venue-card booking-form-venue-responsive bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mobile-p-4 mobile-card">
          <h3 className="booking-form-venue-title booking-form-venue-title-responsive text-base sm:text-lg mobile-text-base font-semibold text-gray-900 mb-3 sm:mb-4 mobile-mb-3">
            Venue Dipilih
          </h3>
          <div className="booking-form-venue-content booking-form-venue-content-responsive flex items-start space-x-3 sm:space-x-4 mobile-space-x-3">
            <img
             src={
  selectedVenue.images?.[0] ||
  selectedVenue.imageUrl ||
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop"
}
              alt={selectedVenue.name}
              className="booking-form-venue-image booking-form-venue-image-responsive w-20 h-15 sm:w-24 sm:h-18 object-cover rounded-xl mobile-image flex-shrink-0"
            />
            <div className="booking-form-venue-info booking-form-venue-info-responsive flex-1 min-w-0">
              <h4 className="booking-form-venue-name booking-form-venue-name-responsive font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">
                {selectedVenue.name}
              </h4>
              <p className="booking-form-venue-desc booking-form-venue-desc-responsive text-gray-600 text-xs sm:text-sm mobile-text-xs mt-1 line-clamp-2">
                {selectedVenue.description}
              </p>
              <div className="booking-form-venue-price booking-form-venue-price-responsive flex items-center space-x-4 mobile-space-x-4 mt-2">
                <span className="booking-form-venue-price-text booking-form-venue-price-text-responsive text-base sm:text-lg mobile-text-base font-bold text-blue-600">
                  Rp {selectedVenue.price?.toLocaleString("id-ID")}/hari
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="booking-form-main booking-form-main-card booking-form-main-responsive bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mobile-p-4 mobile-card">
        <h2 className="booking-form-main-title booking-form-main-title-responsive text-lg sm:text-xl mobile-text-lg font-bold text-gray-900 mb-4 sm:mb-6 mobile-mb-4">
          Detail Reservasi
        </h2>

        <form
          onSubmit={handleSubmit}
          className="booking-form-form booking-form-form-container booking-form-form-responsive space-y-4 sm:space-y-6 mobile-space-y-4"
        >
          <div className="booking-form-grid booking-form-grid-container booking-form-grid-responsive grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mobile-grid-1">
            <div className="booking-form-field booking-form-field-booking-name booking-form-field-responsive mobile-form-group">
              <label className="booking-form-label booking-form-label-responsive block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaCalendarAlt className="booking-form-label-icon booking-form-label-icon-responsive inline mr-2 text-blue-600 mobile-icon-sm" />
                Nama Booking *
              </label>
              <input
                type="text"
                name="bookingName"
                value={formData.bookingName}
                onChange={handleInputChange}
                required
                className="booking-form-input booking-form-input-responsive w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nama untuk identifikasi booking"
              />
            </div>

            <div className="booking-form-field booking-form-field-event-name booking-form-field-responsive mobile-form-group">
              <label className="booking-form-label booking-form-label-responsive block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaCalendarAlt className="booking-form-label-icon booking-form-label-icon-responsive inline mr-2 text-blue-600 mobile-icon-sm" />
                Nama Acara/Reservasi *
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                required
                className="booking-form-input booking-form-input-responsive w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Acara pernikahan, Meeting perusahaan, dll"
              />
            </div>

            <div className="booking-form-field booking-form-field-check-in booking-form-field-responsive mobile-form-group">
              <label className="booking-form-label booking-form-label-responsive block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaCalendarAlt className="booking-form-label-icon booking-form-label-icon-responsive inline mr-2 text-blue-600 mobile-icon-sm" />
                Tanggal Mulai *
              </label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="booking-form-input booking-form-input-responsive w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="booking-form-field booking-form-field-check-out booking-form-field-responsive mobile-form-group">
              <label className="booking-form-label booking-form-label-responsive block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaClock className="booking-form-label-icon booking-form-label-icon-responsive inline mr-2 text-blue-600 mobile-icon-sm" />
                Tanggal Selesai *
              </label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                required
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
                className="booking-form-input booking-form-input-responsive w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="booking-form-field booking-form-field-time-slot booking-form-field-responsive mobile-form-group">
              <label className="booking-form-label booking-form-label-responsive block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaClock className="booking-form-label-icon booking-form-label-icon-responsive inline mr-2 text-blue-600 mobile-icon-sm" />
                Waktu Penggunaan *
              </label>
              <div className="booking-form-select-wrapper booking-form-select-wrapper-responsive relative">
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                  className="booking-form-select booking-form-select-responsive w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
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
                <FaChevronDown className="booking-form-select-icon booking-form-select-icon-responsive absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none mobile-icon-sm" />
              </div>
            </div>

            <div className="booking-form-field booking-form-field-venue-setup booking-form-field-responsive mobile-form-group">
              <label className="booking-form-label booking-form-label-responsive block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
                <FaUsers className="booking-form-label-icon booking-form-label-icon-responsive inline mr-2 text-blue-600 mobile-icon-sm" />
                Setup Venue & Kapasitas *
              </label>
              <div className="booking-form-select-wrapper booking-form-select-wrapper-responsive relative">
                <select
                  name="venueSetup"
                  value={formData.venueSetup}
                  onChange={handleInputChange}
                  required
                  className="booking-form-select booking-form-select-responsive w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
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
                <FaChevronDown className="booking-form-select-icon booking-form-select-icon-responsive absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none mobile-icon-sm" />
              </div>
              {formData.venueSetup && (
                <div className="booking-form-capacity booking-form-capacity-info booking-form-capacity-responsive mt-2 p-2 sm:p-3 mobile-p-2 bg-blue-50 rounded-lg">
                  <p className="booking-form-capacity-text booking-form-capacity-text-responsive text-xs sm:text-sm mobile-text-xs text-blue-700 font-medium">
                    Kapasitas Terpilih: {getSelectedSetupCapacity()} orang
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="booking-form-field booking-form-field-special-requests booking-form-field-responsive mobile-form-group">
            <label className="booking-form-label booking-form-label-responsive block text-sm mobile-text-sm font-semibold text-gray-900 mb-2 sm:mb-3 mobile-mb-2 mobile-form-label">
              Permintaan Khusus (Opsional)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="4"
              className="booking-form-textarea booking-form-textarea-responsive w-full px-3 sm:px-4 py-2 sm:py-3 mobile-form-input border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Permintaan khusus seperti dekorasi, catering, sound system tambahan, dll..."
            />
          </div>

          <div className="booking-form-payment booking-form-payment-section booking-form-payment-responsive">
            <h4 className="booking-form-payment-title booking-form-payment-title-responsive text-base sm:text-lg mobile-text-base font-semibold text-gray-900 mb-3 sm:mb-4 mobile-mb-3">
              <FaMoneyBillWave className="booking-form-payment-icon booking-form-payment-icon-responsive inline mr-2 text-blue-600 mobile-icon-sm" />
              Pilih Metode Pembayaran *
            </h4>

            <div className="booking-form-payment-methods booking-form-payment-methods-responsive grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mobile-grid-1 mb-4 sm:mb-6 mobile-mb-4">
              <div
                className={`booking-form-payment-method booking-form-payment-method-transfer booking-form-payment-method-responsive border-2 rounded-2xl p-3 sm:p-4 mobile-p-3 cursor-pointer transition-all mobile-touch-target ${
                  paymentType === "transfer"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPaymentType("transfer")}
              >
                <div className="booking-form-payment-method-content booking-form-payment-method-content-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="transfer"
                    checked={paymentType === "transfer"}
                    onChange={() => setPaymentType("transfer")}
                    className="booking-form-payment-radio booking-form-payment-radio-responsive text-blue-600 mobile-touch-target"
                  />
                  <div className="booking-form-payment-method-info booking-form-payment-method-info-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                    <div className="booking-form-payment-method-icon booking-form-payment-method-icon-responsive w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaUniversity className="booking-form-payment-method-icon-inner booking-form-payment-method-icon-inner-responsive text-blue-600 mobile-icon-sm" />
                    </div>
                    <div className="booking-form-payment-method-text booking-form-payment-method-text-responsive flex-1">
                      <p className="booking-form-payment-method-name booking-form-payment-method-name-responsive font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">
                        Transfer Bank
                      </p>
                      <p className="booking-form-payment-method-desc booking-form-payment-method-desc-responsive text-xs sm:text-sm mobile-text-xs text-gray-600">
                        Bayar via transfer + upload bukti
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`booking-form-payment-method booking-form-payment-method-cash booking-form-payment-method-responsive border-2 rounded-2xl p-3 sm:p-4 mobile-p-3 cursor-pointer transition-all mobile-touch-target ${
                  paymentType === "cash"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPaymentType("cash")}
              >
                <div className="booking-form-payment-method-content booking-form-payment-method-content-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="cash"
                    checked={paymentType === "cash"}
                    onChange={() => setPaymentType("cash")}
                    className="booking-form-payment-radio booking-form-payment-radio-responsive text-blue-600 mobile-touch-target"
                  />
                  <div className="booking-form-payment-method-info booking-form-payment-method-info-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                    <div className="booking-form-payment-method-icon booking-form-payment-method-icon-responsive w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaStore className="booking-form-payment-method-icon-inner booking-form-payment-method-icon-inner-responsive text-blue-600 mobile-icon-sm" />
                    </div>
                    <div className="booking-form-payment-method-text booking-form-payment-method-text-responsive flex-1">
                      <p className="booking-form-payment-method-name booking-form-payment-method-name-responsive font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">
                        Bayar di Tempat
                      </p>
                      <p className="booking-form-payment-method-desc booking-form-payment-method-desc-responsive text-xs sm:text-sm mobile-text-xs text-gray-600">
                        Bayar saat datang ke lokasi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {paymentType === "transfer" && paymentMethods.length > 0 && (
              <div className="booking-form-bank-methods booking-form-bank-methods-responsive grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mobile-grid-1">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`booking-form-bank-method booking-form-bank-method-responsive border rounded-2xl p-3 sm:p-4 mobile-p-3 cursor-pointer transition-all mobile-touch-target ${
                      selectedPayment === method.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="booking-form-bank-method-content booking-form-bank-method-content-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="booking-form-bank-radio booking-form-bank-radio-responsive text-blue-600 mobile-touch-target"
                      />
                      <div className="booking-form-bank-method-info booking-form-bank-method-info-responsive flex items-center space-x-2 sm:space-x-3 mobile-space-x-2">
                        <div className="booking-form-bank-method-icon booking-form-bank-method-icon-responsive w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FaUniversity className="booking-form-bank-method-icon-inner booking-form-bank-method-icon-inner-responsive text-blue-600 mobile-icon-sm" />
                        </div>
                        <div className="booking-form-bank-method-text booking-form-bank-method-text-responsive flex-1">
                          <p className="booking-form-bank-method-name booking-form-bank-method-name-responsive font-semibold text-gray-900 text-sm sm:text-base mobile-text-sm">
                            {method.name}
                          </p>
                          <p className="booking-form-bank-method-number booking-form-bank-method-number-responsive text-xs sm:text-sm mobile-text-xs text-gray-600">
                            {method.accountNumber}
                          </p>
                          <p className="booking-form-bank-method-account booking-form-bank-method-account-responsive text-xs sm:text-sm mobile-text-xs text-gray-600">
                            a.n. {method.accountName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {paymentType === "cash" && (
              <div className="booking-form-cash-info booking-form-cash-info-responsive bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:p-4 mobile-p-3">
                <p className="booking-form-cash-title booking-form-cash-title-responsive text-blue-800 font-medium text-sm sm:text-base mobile-text-sm">
                  Pembayaran di Tempat
                </p>
                <p className="booking-form-cash-desc booking-form-cash-desc-responsive text-blue-600 text-xs sm:text-sm mobile-text-xs mt-1">
                  Anda akan mendapat kartu konfirmasi untuk dibawa saat datang ke lokasi untuk melakukan pembayaran.
                </p>
              </div>
            )}
          </div>

          {selectedVenue && formData.checkIn && formData.checkOut && formData.timeSlot && (
            <div className="booking-form-summary booking-form-summary-card booking-form-summary-responsive bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 mobile-p-4">
              <h4 className="booking-form-summary-title booking-form-summary-title-responsive text-base sm:text-lg mobile-text-base font-semibold text-gray-900 mb-3 sm:mb-4 mobile-mb-3">
                Ringkasan Pembayaran
              </h4>
              <div className="booking-form-summary-content booking-form-summary-content-responsive space-y-2 sm:space-y-3 mobile-space-y-2">
                <div className="booking-form-summary-item booking-form-summary-item-responsive flex justify-between">
                  <span className="booking-form-summary-label booking-form-summary-label-responsive text-gray-600 text-sm sm:text-base mobile-text-sm">
                    Harga venue per hari
                  </span>
                  <span className="booking-form-summary-value booking-form-summary-value-responsive font-semibold text-sm sm:text-base mobile-text-sm">
                    Rp {selectedVenue.price?.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="booking-form-summary-item booking-form-summary-item-responsive flex justify-between">
                  <span className="booking-form-summary-label booking-form-summary-label-responsive text-gray-600 text-sm sm:text-base mobile-text-sm">
                    Jumlah hari
                  </span>
                  <span className="booking-form-summary-value booking-form-summary-value-responsive font-semibold text-sm sm:text-base mobile-text-sm">
                    {calculateDays()} hari
                  </span>
                </div>
                {formData.timeSlot && (
                  <div className="booking-form-summary-item booking-form-summary-item-responsive flex justify-between">
                    <span className="booking-form-summary-label booking-form-summary-label-responsive text-gray-600 text-sm sm:text-base mobile-text-sm">
                      Waktu penggunaan
                    </span>
                    <span className="booking-form-summary-value booking-form-summary-value-responsive font-semibold text-sm sm:text-base mobile-text-sm">
                      {timeSlotOptions.find((slot) => slot.value === formData.timeSlot)?.label}
                    </span>
                  </div>
                )}
                {formData.venueSetup && (
                  <div className="booking-form-summary-item booking-form-summary-item-responsive flex justify-between">
                    <span className="booking-form-summary-label booking-form-summary-label-responsive text-gray-600 text-sm sm:text-base mobile-text-sm">
                      Setup venue
                    </span>
                    <span className="booking-form-summary-value booking-form-summary-value-responsive font-semibold text-sm sm:text-base mobile-text-sm">
                      {selectedVenue.setupOptions?.find((setup) => setup.type === formData.venueSetup)?.label}
                    </span>
                  </div>
                )}
                <div className="booking-form-summary-total booking-form-summary-total-responsive border-t border-gray-300 pt-2 sm:pt-3 mobile-pt-2">
                  <div className="booking-form-summary-total-item booking-form-summary-total-item-responsive flex justify-between text-base sm:text-lg mobile-text-base font-bold">
                    <span className="booking-form-summary-total-label booking-form-summary-total-label-responsive">
                      Total Pembayaran
                    </span>
                    <span className="booking-form-summary-total-value booking-form-summary-total-value-responsive text-blue-600">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="booking-form-actions booking-form-actions-responsive flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mobile-space-y-3">
            <button
              type="button"
              onClick={handleCancel}
              className="booking-form-cancel booking-form-cancel-btn booking-form-cancel-responsive flex-1 bg-gray-200 text-gray-800 py-3 sm:py-4 mobile-py-3 px-4 sm:px-6 mobile-px-4 rounded-2xl hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-lg mobile-text-sm mobile-button"
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
              className="booking-form-submit booking-form-submit-btn booking-form-submit-responsive flex-1 bg-blue-500 text-white py-3 sm:py-4 mobile-py-3 px-4 sm:px-6 mobile-px-4 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-lg mobile-text-sm flex items-center justify-center mobile-button"
            >
              {loading ? (
                <>
                  <FaSpinner className="booking-form-submit-spinner booking-form-submit-spinner-responsive animate-spin mr-2 sm:mr-3 mobile-mr-2 mobile-icon-sm" />
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
