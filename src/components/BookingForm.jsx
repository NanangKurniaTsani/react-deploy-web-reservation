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
import logo_mandiri from "../assets/logo_mandiri.png"

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
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reservasi Berhasil!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {paymentType === "cash"
              ? "Reservasi venue Anda berhasil dibuat. Silakan datang ke lokasi untuk melakukan pembayaran dan konfirmasi."
              : "Reservasi venue Anda berhasil dibuat dan bukti pembayaran telah diupload. Menunggu konfirmasi admin."}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleViewMyBookings}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <FaEye />
              <span>Lihat Reservasi Saya</span>
            </button>

            <button
              onClick={handleNavigateHome}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <FaHome />
              <span>Kembali ke Beranda</span>
            </button>

            <button
              onClick={resetForm}
              className="w-full bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors font-medium"
            >
              Buat Reservasi Lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
        >
          <FaArrowLeft />
          <span className="text-sm">Kembali</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Form Reservasi Venue
        </h1>
      </div>

      {selectedVenue && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Venue Dipilih
          </h3>
          <div className="flex items-start space-x-3">
            <img
              src={
                selectedVenue.images?.[0] ||
                selectedVenue.imageUrl ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop"
              }
              alt={selectedVenue.name}
              className="w-20 h-15 object-cover rounded-xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm">
                {selectedVenue.name}
              </h4>
              <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                {selectedVenue.description}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-base font-bold text-blue-600">
                  Rp {selectedVenue.price?.toLocaleString("id-ID")}/hari
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Detail Reservasi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                Nama Booking *
              </label>
              <input
                type="text"
                name="bookingName"
                value={formData.bookingName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nama untuk identifikasi booking"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                Nama Acara/Reservasi *
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Acara pernikahan, Meeting perusahaan, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                Tanggal Mulai *
              </label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <FaClock className="inline mr-2 text-blue-600" />
                Tanggal Selesai *
              </label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                required
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <FaClock className="inline mr-2 text-blue-600" />
                Waktu Penggunaan *
              </label>
              <div className="relative">
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
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
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <FaUsers className="inline mr-2 text-blue-600" />
                Setup Venue & Kapasitas *
              </label>
              <div className="relative">
                <select
                  name="venueSetup"
                  value={formData.venueSetup}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
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
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {formData.venueSetup && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    Kapasitas Terpilih: {getSelectedSetupCapacity()} orang
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Permintaan Khusus (Opsional)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Permintaan khusus seperti dekorasi, catering, sound system tambahan, dll..."
            />
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">
              <FaMoneyBillWave className="inline mr-2 text-blue-600" />
              Pilih Metode Pembayaran *
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div
                className={`border-2 rounded-2xl p-3 cursor-pointer transition-all ${
                  paymentType === "transfer"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPaymentType("transfer")}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="transfer"
                    checked={paymentType === "transfer"}
                    onChange={() => setPaymentType("transfer")}
                    className="text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaUniversity className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        Transfer Bank
                      </p>
                      <p className="text-xs text-gray-600">
                        Bayar via transfer + upload bukti
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-2xl p-3 cursor-pointer transition-all ${
                  paymentType === "cash"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPaymentType("cash")}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="cash"
                    checked={paymentType === "cash"}
                    onChange={() => setPaymentType("cash")}
                    className="text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaStore className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        Bayar di Tempat
                      </p>
                      <p className="text-xs text-gray-600">
                        Bayar saat datang ke lokasi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {paymentType === "transfer" && paymentMethods.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-2xl p-3 cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="text-blue-600"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                          <img 
                            src={logo_mandiri} 
                            alt="Mandiri" 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {method.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {method.accountNumber}
                          </p>
                          <p className="text-xs text-gray-600">
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
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                <p className="text-blue-800 font-medium text-sm">
                  Pembayaran di Tempat
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Anda akan mendapat kartu konfirmasi untuk dibawa saat datang ke lokasi untuk melakukan pembayaran.
                </p>
              </div>
            )}
          </div>

          {selectedVenue && formData.checkIn && formData.checkOut && formData.timeSlot && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <h4 className="text-base font-semibold text-gray-900 mb-3">
                Ringkasan Pembayaran
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">
                    Harga venue per hari
                  </span>
                  <span className="font-semibold text-sm">
                    Rp {selectedVenue.price?.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">
                    Jumlah hari
                  </span>
                  <span className="font-semibold text-sm">
                    {calculateDays()} hari
                  </span>
                </div>
                {formData.timeSlot && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">
                      Waktu penggunaan
                    </span>
                    <span className="font-semibold text-sm">
                      {timeSlotOptions.find((slot) => slot.value === formData.timeSlot)?.label}
                    </span>
                  </div>
                )}
                {formData.venueSetup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">
                      Setup venue
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedVenue.setupOptions?.find((setup) => setup.type === formData.venueSetup)?.label}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span>
                      Total Pembayaran
                    </span>
                    <span className="text-blue-600">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-2xl hover:bg-gray-300 transition-colors font-semibold text-sm"
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
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
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