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
  FaSpa,
  FaUtensils,
  FaSwimmingPool,
  FaConciergeBell,
} from "react-icons/fa"
import toast from "react-hot-toast"

const ServiceBookingForm = () => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    serviceType: "",
    serviceName: "",
    date: "",
    time: "",
    duration: "",
    guests: "1",
    specialRequests: "",
  })
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPayment, setSelectedPayment] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const serviceTypes = [
    {
      id: "spa",
      name: "Spa & Wellness",
      icon: FaSpa,
      color: "bg-pink-500",
      services: [
        { name: "Traditional Massage", price: 350000, duration: "60 menit" },
        { name: "Hot Stone Therapy", price: 450000, duration: "90 menit" },
        { name: "Aromatherapy", price: 300000, duration: "60 menit" },
        { name: "Facial Treatment", price: 250000, duration: "45 menit" },
        { name: "Body Scrub", price: 200000, duration: "30 menit" },
      ],
    },
    {
      id: "dining",
      name: "Dining & Restaurant",
      icon: FaUtensils,
      color: "bg-orange-500",
      services: [
        { name: "Private Dining", price: 1500000, duration: "3 jam" },
        { name: "Romantic Dinner", price: 800000, duration: "2 jam" },
        { name: "Business Lunch", price: 500000, duration: "2 jam" },
        { name: "Birthday Party", price: 2000000, duration: "4 jam" },
        { name: "Wine Tasting", price: 600000, duration: "2 jam" },
      ],
    },
    {
      id: "facilities",
      name: "Facilities & Recreation",
      icon: FaSwimmingPool,
      color: "bg-cyan-500",
      services: [
        { name: "Swimming Pool", price: 100000, duration: "3 jam" },
        { name: "Fitness Center", price: 75000, duration: "2 jam" },
        { name: "Tennis Court", price: 200000, duration: "1 jam" },
        { name: "Golf Simulator", price: 300000, duration: "1 jam" },
        { name: "Karaoke Room", price: 250000, duration: "2 jam" },
      ],
    },
    {
      id: "services",
      name: "Hotel Services",
      icon: FaConciergeBell,
      color: "bg-purple-500",
      services: [
        { name: "Airport Transfer", price: 150000, duration: "1 trip" },
        { name: "City Tour", price: 500000, duration: "8 jam" },
        { name: "Laundry Service", price: 50000, duration: "24 jam" },
        { name: "Babysitting", price: 100000, duration: "per jam" },
        { name: "Personal Butler", price: 300000, duration: "per hari" },
      ],
    },
  ]

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

  const handleServiceTypeChange = (typeId) => {
    setFormData({
      ...formData,
      serviceType: typeId,
      serviceName: "",
    })
  }

  const getSelectedService = () => {
    if (!formData.serviceType || !formData.serviceName) return null
    const serviceType = serviceTypes.find((type) => type.id === formData.serviceType)
    return serviceType?.services.find((service) => service.name === formData.serviceName)
  }

  const calculateTotal = () => {
    const service = getSelectedService()
    if (!service) return 0
    return service.price
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPayment) {
      toast.error("Silakan pilih metode pembayaran")
      return
    }

    setLoading(true)
    try {
      const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedPayment)
      const service = getSelectedService()
      const serviceType = serviceTypes.find((type) => type.id === formData.serviceType)

      await addDoc(collection(db, "serviceBookings"), {
        ...formData,
        servicePrice: service.price,
        serviceDuration: service.duration,
        serviceCategory: serviceType.name,
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
        serviceType: "",
        serviceName: "",
        date: "",
        time: "",
        duration: "",
        guests: "1",
        specialRequests: "",
      })
      setSelectedPayment("")
      toast.success("Pengajuan layanan berhasil dibuat!")
    } catch (error) {
      console.error("Error creating service booking:", error)
      toast.error("Terjadi kesalahan saat membuat pengajuan")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-emerald-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pengajuan Berhasil!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Pengajuan layanan Anda sedang diproses. Silakan lakukan pembayaran sesuai dengan metode yang dipilih. Anda
              akan mendapat konfirmasi melalui email.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Buat Pengajuan Lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengajuan Layanan Hotel</h1>
          <p className="text-gray-600">Pilih layanan yang Anda inginkan dan buat pengajuan</p>
        </div>

        <div className="space-y-6">
          {/* Service Type Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Kategori Layanan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {serviceTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => handleServiceTypeChange(type.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      formData.serviceType === type.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="text-white text-lg" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm text-center">{type.name}</h4>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Service Selection */}
          {formData.serviceType && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Layanan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceTypes
                  .find((type) => type.id === formData.serviceType)
                  ?.services.map((service) => (
                    <div
                      key={service.name}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.serviceName === service.name
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData({ ...formData, serviceName: service.name })}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <span className="text-blue-600 font-bold">Rp {service.price.toLocaleString("id-ID")}</span>
                      </div>
                      <p className="text-sm text-gray-600">Durasi: {service.duration}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Booking Form */}
          {formData.serviceName && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Detail Pengajuan</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    <FaCalendarAlt className="inline mr-2 text-blue-600" />
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    <FaClock className="inline mr-2 text-blue-600" />
                    Waktu *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    <FaUsers className="inline mr-2 text-blue-600" />
                    Jumlah Orang *
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Durasi</label>
                  <input
                    type="text"
                    value={getSelectedService()?.duration || ""}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Permintaan Khusus (Opsional)</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Permintaan khusus atau catatan tambahan..."
                />
              </div>

              {/* Payment Method Selection */}
              {paymentMethods.length > 0 && (
                <div className="mb-6">
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
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.accountNumber}</p>
                            <p className="text-sm text-gray-600">a.n. {method.accountName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              {getSelectedService() && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pembayaran</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Layanan</span>
                      <span className="font-semibold">{formData.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi</span>
                      <span className="font-semibold">{getSelectedService()?.duration}</span>
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
                disabled={loading || !selectedPayment || !formData.date || !formData.time}
                className="w-full bg-blue-500 text-white py-4 px-6 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-3" />
                    Memproses Pengajuan...
                  </>
                ) : (
                  "Konfirmasi Pengajuan"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceBookingForm
