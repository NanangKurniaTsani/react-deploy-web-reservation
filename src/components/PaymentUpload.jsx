"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import ReservationCard from "./ReservationCard"
import { FaUpload, FaSpinner, FaCheckCircle, FaImage, FaDownload } from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

const PaymentUpload = ({ booking, onComplete, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [showConfirmationCard, setShowConfirmationCard] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useBackButton(() => {
    if (showConfirmationCard) {
      setShowConfirmationCard(false)
      return true
    }
    if (uploadComplete) {
      onComplete()
      return true
    }
    onCancel()
    return true
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar")
        return
      }
      setSelectedFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Silakan pilih file bukti pembayaran")
      return
    }

    setUploading(true)
    try {
      const base64String = await convertFileToBase64(selectedFile)

      await updateDoc(doc(db, "bookings", booking.id), {
        paymentProof: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          base64Data: base64String,
          uploadedAt: new Date(),
          status: "uploaded",
        },
        paymentStatus: "proof-uploaded",
      })

      setUploadComplete(true)
      toast.success("Bukti pembayaran berhasil diupload!")
    } catch (error) {
      console.error("Error uploading payment proof:", error)
      toast.error("Gagal mengupload bukti pembayaran")
    }
    setUploading(false)
  }

  const handleShowCard = () => {
    setShowConfirmationCard(true)
  }

  const handleComplete = () => {
    if (onComplete) onComplete()
  }

  if (showConfirmationCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ReservationCard
          booking={{
            ...booking,
            paymentStatus: "proof-uploaded",
            paymentType: "transfer",
          }}
          onClose={handleComplete}
          userRole="customer"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUpload className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Bukti Pembayaran</h2>
          <p className="text-gray-600">Silakan upload bukti transfer pembayaran untuk melanjutkan proses reservasi</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-4">Detail Pembayaran</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Bank:</span>
              <span className="font-medium text-blue-900">{booking.paymentMethod?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">No. Rekening:</span>
              <span className="font-medium text-blue-900">{booking.paymentMethod?.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Atas Nama:</span>
              <span className="font-medium text-blue-900">{booking.paymentMethod?.accountName}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
              <span className="text-blue-700">Total Transfer:</span>
              <span className="font-bold text-blue-900 text-lg">Rp {booking.totalAmount?.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {!uploadComplete ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Bukti Transfer *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="payment-proof" />
                <label htmlFor="payment-proof" className="cursor-pointer">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview bukti pembayaran"
                        className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                      />
                      <p className="text-blue-600 font-medium">{selectedFile.name}</p>
                      <p className="text-gray-500 text-sm">Klik untuk ganti file</p>
                    </div>
                  ) : (
                    <>
                      <FaImage className="text-gray-400 text-3xl mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Klik untuk pilih file atau drag & drop</p>
                      <p className="text-gray-500 text-sm">Format: JPG, PNG, JPEG (Maksimal 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 bg-blue-500 text-white py-4 px-6 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin mr-3" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-3" />
                    Upload Bukti
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Berhasil!</h3>
              <p className="text-gray-600">Bukti pembayaran telah diupload. Menunggu verifikasi admin.</p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleComplete}
                className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Selesai
              </button>
              <button
                onClick={handleShowCard}
                className="flex-1 bg-blue-500 text-white py-4 px-6 rounded-2xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center"
              >
                <FaDownload className="mr-3" />
                Lihat Kartu Konfirmasi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

PaymentUpload.propTypes = {
  booking: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default PaymentUpload