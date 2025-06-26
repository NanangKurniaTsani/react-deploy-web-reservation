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

    if (!formData.name.trim()) {
      toast.error("Nama metode harus diisi")
      return
    }

    if (!formData.accountNumber.trim()) {
      toast.error("Nomor rekening harus diisi")
      return
    }

    if (!formData.accountName.trim()) {
      toast.error("Nama pemilik rekening harus diisi")
      return
    }

    setSubmitting(true)

    try {
      const methodData = {
        ...formData,
        name: formData.name.trim(),
        accountNumber: formData.accountNumber.trim(),
        accountName: formData.accountName.trim(),
        bankName: formData.bankName.trim(),
        instructions: formData.instructions.trim(),
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
      name: method.name || "",
      type: method.type || "bank",
      accountNumber: method.accountNumber || "",
      accountName: method.accountName || "",
      bankName: method.bankName || "",
      instructions: method.instructions || "",
      isActive: method.isActive !== undefined ? method.isActive : true,
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
      <div className="payment-settings-loading payment-settings-loading-container payment-settings-loading-responsive flex justify-center items-center h-64">
        <FaSpinner className="payment-settings-loading-spinner payment-settings-loading-spinner-responsive animate-spin h-8 w-8 text-purple-500" />
      </div>
    )
  }

  return (
    <div className="payment-settings payment-settings-container payment-settings-responsive space-y-6">
      <div className="payment-settings-header payment-settings-header-container payment-settings-header-responsive flex justify-between items-center">
        <div className="payment-settings-header-info payment-settings-header-info-responsive">
          <h2 className="payment-settings-title payment-settings-title-responsive text-xl font-bold text-gray-900">
            Metode Pembayaran
          </h2>
          <p className="payment-settings-subtitle payment-settings-subtitle-responsive text-gray-600 text-sm mt-1">
            Kelola rekening dan metode pembayaran
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="payment-settings-add payment-settings-add-responsive bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors flex items-center space-x-2 shadow-md"
        >
          <FaPlus className="payment-settings-add-icon payment-settings-add-icon-responsive text-sm" />
          <span className="payment-settings-add-text payment-settings-add-text-responsive">Tambah Metode</span>
        </button>
      </div>

      <div className="payment-settings-list payment-settings-list-container payment-settings-list-responsive space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-settings-item payment-settings-item-responsive bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${
              !method.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="payment-settings-item-content payment-settings-item-content-responsive flex justify-between items-start">
              <div className="payment-settings-item-info payment-settings-item-info-responsive flex items-start space-x-4">
                <div
                  className={`payment-settings-item-icon payment-settings-item-icon-responsive w-12 h-12 rounded-xl flex items-center justify-center ${
                    method.type === "bank" ? "bg-blue-100" : "bg-purple-100"
                  }`}
                >
                  {method.type === "bank" ? (
                    <FaUniversity className="payment-settings-item-icon-inner payment-settings-item-icon-inner-responsive text-blue-600" />
                  ) : (
                    <FaCreditCard className="payment-settings-item-icon-inner payment-settings-item-icon-inner-responsive text-purple-600" />
                  )}
                </div>
                <div className="payment-settings-item-details payment-settings-item-details-responsive flex-1">
                  <div className="payment-settings-item-header payment-settings-item-header-responsive flex items-center space-x-2 mb-2">
                    <h3 className="payment-settings-item-name payment-settings-item-name-responsive text-lg font-semibold text-gray-900">
                      {method.name}
                    </h3>
                    <button
                      onClick={() => toggleActive(method)}
                      className="payment-settings-item-toggle payment-settings-item-toggle-responsive flex items-center space-x-1"
                    >
                      {method.isActive ? (
                        <FaToggleOn className="payment-settings-item-toggle-icon payment-settings-item-toggle-icon-responsive text-emerald-500 text-xl" />
                      ) : (
                        <FaToggleOff className="payment-settings-item-toggle-icon payment-settings-item-toggle-icon-responsive text-gray-400 text-xl" />
                      )}
                    </button>
                  </div>
                  <div className="payment-settings-item-info-list payment-settings-item-info-list-responsive space-y-1 text-sm text-gray-600">
                    {method.bankName && (
                      <p className="payment-settings-item-bank payment-settings-item-bank-responsive">
                        <span className="payment-settings-item-label payment-settings-item-label-responsive font-medium">
                          Bank:
                        </span>{" "}
                        {method.bankName}
                      </p>
                    )}
                    <p className="payment-settings-item-account payment-settings-item-account-responsive">
                      <span className="payment-settings-item-label payment-settings-item-label-responsive font-medium">
                        No. Rekening:
                      </span>{" "}
                      {method.accountNumber}
                    </p>
                    <p className="payment-settings-item-holder payment-settings-item-holder-responsive">
                      <span className="payment-settings-item-label payment-settings-item-label-responsive font-medium">
                        Atas Nama:
                      </span>{" "}
                      {method.accountName}
                    </p>
                    {method.instructions && (
                      <p className="payment-settings-item-instructions payment-settings-item-instructions-responsive text-xs bg-gray-50 p-2 rounded-lg mt-2">
                        {method.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="payment-settings-item-actions payment-settings-item-actions-responsive flex space-x-1">
                <button
                  onClick={() => handleEdit(method)}
                  className="payment-settings-item-edit payment-settings-item-edit-responsive w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                >
                  <FaEdit className="payment-settings-item-edit-icon payment-settings-item-edit-icon-responsive text-sm" />
                </button>
                <button
                  onClick={() => handleDelete(method)}
                  className="payment-settings-item-delete payment-settings-item-delete-responsive w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="payment-settings-item-delete-icon payment-settings-item-delete-icon-responsive text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="payment-settings-empty payment-settings-empty-container payment-settings-empty-responsive text-center py-12">
          <div className="payment-settings-empty-icon payment-settings-empty-icon-responsive text-6xl mb-4">💳</div>
          <h3 className="payment-settings-empty-title payment-settings-empty-title-responsive text-xl font-semibold text-gray-600 mb-2">
            Belum Ada Metode Pembayaran
          </h3>
          <p className="payment-settings-empty-text payment-settings-empty-text-responsive text-gray-500">
            Tambahkan metode pembayaran pertama untuk memulai.
          </p>
        </div>
      )}

      {showModal && (
        <div className="payment-settings-modal payment-settings-modal-overlay payment-settings-modal-responsive fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="payment-settings-modal-content payment-settings-modal-content-responsive bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="payment-settings-modal-header payment-settings-modal-header-responsive flex justify-between items-center mb-6">
              <h3 className="payment-settings-modal-title payment-settings-modal-title-responsive text-xl font-bold text-gray-900">
                {editingMethod ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="payment-settings-modal-close payment-settings-modal-close-responsive text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="payment-settings-modal-close-icon payment-settings-modal-close-icon-responsive" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="payment-settings-form payment-settings-form-responsive space-y-4">
              <div className="payment-settings-form-group payment-settings-form-group-responsive">
                <label className="payment-settings-form-label payment-settings-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                  Nama Metode *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="payment-settings-form-input payment-settings-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="BCA, Mandiri, dll"
                  required
                />
              </div>

              <div className="payment-settings-form-group payment-settings-form-group-responsive">
                <label className="payment-settings-form-label payment-settings-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                  Tipe
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="payment-settings-form-select payment-settings-form-select-responsive w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {formData.type === "bank" && (
                <div className="payment-settings-form-group payment-settings-form-group-responsive">
                  <label className="payment-settings-form-label payment-settings-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="payment-settings-form-input payment-settings-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Bank Central Asia"
                  />
                </div>
              )}

              <div className="payment-settings-form-group payment-settings-form-group-responsive">
                <label className="payment-settings-form-label payment-settings-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                  Nomor Rekening *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="payment-settings-form-input payment-settings-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="1234567890"
                  required
                />
              </div>

              <div className="payment-settings-form-group payment-settings-form-group-responsive">
                <label className="payment-settings-form-label payment-settings-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                  Atas Nama *
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="payment-settings-form-input payment-settings-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="PT Grand Hotel"
                  required
                />
              </div>

              <div className="payment-settings-form-group payment-settings-form-group-responsive">
                <label className="payment-settings-form-label payment-settings-form-label-responsive block text-sm font-medium text-gray-700 mb-2">
                  Instruksi Pembayaran
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="payment-settings-form-textarea payment-settings-form-textarea-responsive w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Instruksi khusus untuk pembayaran..."
                />
              </div>

              <div className="payment-settings-form-group payment-settings-form-group-responsive flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="payment-settings-form-checkbox payment-settings-form-checkbox-responsive mr-2"
                />
                <label
                  htmlFor="isActive"
                  className="payment-settings-form-checkbox-label payment-settings-form-checkbox-label-responsive text-sm text-gray-700"
                >
                  Aktifkan metode pembayaran ini
                </label>
              </div>

              <div className="payment-settings-form-actions payment-settings-form-actions-responsive flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="payment-settings-form-submit payment-settings-form-submit-responsive flex-1 bg-purple-500 text-white py-3 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <FaSpinner className="payment-settings-form-submit-spinner payment-settings-form-submit-spinner-responsive animate-spin mr-2" />
                  ) : (
                    <FaSave className="payment-settings-form-submit-icon payment-settings-form-submit-icon-responsive mr-2" />
                  )}
                  <span className="payment-settings-form-submit-text payment-settings-form-submit-text-responsive">
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="payment-settings-form-cancel payment-settings-form-cancel-responsive flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition-colors"
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
