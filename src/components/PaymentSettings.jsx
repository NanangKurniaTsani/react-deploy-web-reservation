"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUniversity,
  FaCreditCard,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
} from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

const PaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    accountNumber: "",
    accountName: "",
    bankName: "",
    instructions: "",
    isActive: true,
  })

  useBackButton(() => {
    if (showModal) {
      handleCloseModal()
      return true
    }
    window.location.href = "/admin"
    return true
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "paymentMethods"))
      const methodsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPaymentMethods(methodsData)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast.error("Gagal memuat metode pembayaran")
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const methodData = {
        ...formData,
        updatedAt: new Date(),
      }

      if (editingMethod) {
        await updateDoc(doc(db, "paymentMethods", editingMethod.id), methodData)
        toast.success("Metode pembayaran berhasil diperbarui!")
      } else {
        await addDoc(collection(db, "paymentMethods"), {
          ...methodData,
          createdAt: new Date(),
        })
        toast.success("Metode pembayaran berhasil ditambahkan!")
      }

      setShowModal(false)
      setEditingMethod(null)
      resetForm()
      fetchPaymentMethods()
    } catch (error) {
      console.error("Error saving payment method:", error)
      toast.error("Gagal menyimpan metode pembayaran")
    }
    setSubmitting(false)
  }

  const handleEdit = (method) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      accountNumber: method.accountNumber,
      accountName: method.accountName,
      bankName: method.bankName || "",
      instructions: method.instructions || "",
      isActive: method.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (method) => {
    if (window.confirm(`Yakin ingin menghapus metode pembayaran ${method.name}?`)) {
      try {
        await deleteDoc(doc(db, "paymentMethods", method.id))
        toast.success("Metode pembayaran berhasil dihapus!")
        fetchPaymentMethods()
      } catch (error) {
        console.error("Error deleting payment method:", error)
        toast.error("Gagal menghapus metode pembayaran")
      }
    }
  }

  const toggleActive = async (method) => {
    try {
      await updateDoc(doc(db, "paymentMethods", method.id), {
        isActive: !method.isActive,
        updatedAt: new Date(),
      })
      toast.success(`Metode pembayaran ${!method.isActive ? "diaktifkan" : "dinonaktifkan"}!`)
      fetchPaymentMethods()
    } catch (error) {
      console.error("Error toggling payment method:", error)
      toast.error("Gagal mengubah status metode pembayaran")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "bank",
      accountNumber: "",
      accountName: "",
      bankName: "",
      instructions: "",
      isActive: true,
    })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMethod(null)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Metode Pembayaran</h2>
          <p className="text-gray-600 text-sm mt-1">Kelola rekening dan metode pembayaran</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors flex items-center space-x-2 shadow-md"
        >
          <FaPlus className="text-sm" />
          <span>Tambah Metode</span>
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${
              !method.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    method.type === "bank" ? "bg-blue-100" : "bg-purple-100"
                  }`}
                >
                  {method.type === "bank" ? (
                    <FaUniversity className="text-blue-600" />
                  ) : (
                    <FaCreditCard className="text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                    <button onClick={() => toggleActive(method)} className="flex items-center space-x-1">
                      {method.isActive ? (
                        <FaToggleOn className="text-emerald-500 text-xl" />
                      ) : (
                        <FaToggleOff className="text-gray-400 text-xl" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {method.bankName && (
                      <p>
                        <span className="font-medium">Bank:</span> {method.bankName}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">No. Rekening:</span> {method.accountNumber}
                    </p>
                    <p>
                      <span className="font-medium">Atas Nama:</span> {method.accountName}
                    </p>
                    {method.instructions && (
                      <p className="text-xs bg-gray-50 p-2 rounded-lg mt-2">{method.instructions}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(method)}
                  className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                >
                  <FaEdit className="text-sm" />
                </button>
                <button
                  onClick={() => handleDelete(method)}
                  className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Metode Pembayaran</h3>
          <p className="text-gray-500">Tambahkan metode pembayaran pertama untuk memulai.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMethod ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Metode *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="BCA, Mandiri, dll"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {formData.type === "bank" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Bank</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Bank Central Asia"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Rekening *</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Atas Nama *</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="PT Grand Hotel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instruksi Pembayaran</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Instruksi khusus untuk pembayaran..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Aktifkan metode pembayaran ini
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-500 text-white py-3 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  <span>{submitting ? "Menyimpan..." : "Simpan"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentSettings