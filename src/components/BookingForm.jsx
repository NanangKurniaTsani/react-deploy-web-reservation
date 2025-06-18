"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import {
  FaSpinner,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaMoneyBillWave,
  FaCreditCard,
  FaUniversity,
} from "react-icons/fa"
import toast from "react-hot-toast"

const BookingForm = ({ selectedRoom }) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    eventName: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    specialRequests: "",
  })
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPayment, setSelectedPayment] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
    if (selectedRoom) {
      setFormData((prev) => ({
        ...prev,
        guests: selectedRoom.capacity.toString(),
      }))
    }
  }, [selectedRoom])

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

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotal = () => {
    if (!selectedRoom) return 0
    const nights = calculateNights()
    return selectedRoom.price * nights
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRoom) {
      toast.error("Silakan pilih kamar terlebih dahulu")
      return
    }
    if (!selectedPayment) {
      toast.error("Silakan pilih metode pembayaran")
      return
    }

    setLoading(true)
    try {
      const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedPayment)
      const nights = calculateNights()

      await addDoc(collection(db, "bookings"), {
        ...formData,
        roomId: selectedRoom.id || selectedRoom.docId,
        roomName: selectedRoom.name,
        roomPrice: selectedRoom.price,
        nights: nights,
        totalAmount: calculateTotal(),
        paymentMethodId: selectedPayment,
        paymentMethod: selectedPaymentMethod,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
        guests: Number.parseInt(formData.guests),
      })

      setSuccess(true)
      setFormData({
        eventName: "",
        checkIn: "",
        checkOut: "",
        guests: "",
        specialRequests: "",
      })
      setSelectedPayment("")
      toast.success("Reservasi berhasil dibuat!")
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("Terjadi kesalahan saat membuat reservasi")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-emerald-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reservasi Berhasil!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Reservasi Anda sedang diproses. Silakan lakukan pembayaran sesuai dengan metode yang dipilih. Anda akan
            mendapat konfirmasi melalui email.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            Buat Reservasi Lain
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Selected Room Info */}
      {selectedRoom && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kamar Dipilih</h3>
          <div className="flex items-start space-x-4">
            <img
              src={
                selectedRoom.images?.[0] ||
                "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200&h=150&fit=crop"
              }
              alt={selectedRoom.name}
              className="w-24 h-18 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{selectedRoom.name}</h4>
              <p className="text-gray-600 text-sm mt-1">{selectedRoom.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">
                  <FaUsers className="inline mr-1" />
                  {selectedRoom.capacity} tamu
                </span>
                <span className="text-lg font-bold text-blue-600">
                  Rp {selectedRoom.price?.toLocaleString("id-ID")}/malam
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Detail Reservasi</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                Nama/Tujuan Reservasi *
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Liburan keluarga, Business trip, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <FaUsers className="inline mr-2 text-blue-600" />
                Jumlah Tamu *
              </label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleInputChange}
                required
                min="1"
                max={selectedRoom?.capacity || 10}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Jumlah tamu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                Check-in *
              </label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <FaClock className="inline mr-2 text-blue-600" />
                Check-out *
              </label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                required
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Permintaan Khusus (Opsional)</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Permintaan khusus seperti kamar lantai tinggi, dekat lift, dll..."
            />
          </div>

          {/* Payment Method Selection */}
          {paymentMethods.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                <FaMoneyBillWave className="inline mr-2 text-blue-600" />
                Pilih Metode Pembayaran
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="text-blue-600"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          {method.type === "bank" ? (
                            <FaUniversity className="text-blue-600" />
                          ) : (
                            <FaCreditCard className="text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.accountNumber}</p>
                          <p className="text-sm text-gray-600">a.n. {method.accountName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Summary */}
          {selectedRoom && formData.checkIn && formData.checkOut && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pembayaran</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Harga per malam</span>
                  <span className="font-semibold">Rp {selectedRoom.price?.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah malam</span>
                  <span className="font-semibold">{calculateNights()} malam</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Pembayaran</span>
                    <span className="text-blue-600">Rp {calculateTotal().toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedRoom || !selectedPayment || !formData.checkIn || !formData.checkOut}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-3" />
                Memproses Reservasi...
              </>
            ) : (
              "Konfirmasi Reservasi"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookingForm
