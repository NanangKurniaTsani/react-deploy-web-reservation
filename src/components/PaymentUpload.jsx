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

    if (!booking || !booking.id) {
      toast.error("Data booking tidak valid")
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
      <div className="payment-upload-card payment-upload-card-container payment-upload-card-responsive min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
    <div className="payment-upload payment-upload-container payment-upload-responsive min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="payment-upload-content payment-upload-content-responsive bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 w-full max-w-2xl">
        <div className="payment-upload-header payment-upload-header-responsive text-center mb-8">
          <div className="payment-upload-icon payment-upload-icon-responsive w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUpload className="payment-upload-icon-inner payment-upload-icon-inner-responsive text-blue-600 text-2xl" />
          </div>
          <h2 className="payment-upload-title payment-upload-title-responsive text-2xl font-bold text-gray-900 mb-2">
            Upload Bukti Pembayaran
          </h2>
          <p className="payment-upload-subtitle payment-upload-subtitle-responsive text-gray-600">
            Silakan upload bukti transfer pembayaran untuk melanjutkan proses reservasi
          </p>
        </div>

        <div className="payment-upload-details payment-upload-details-responsive bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="payment-upload-details-title payment-upload-details-title-responsive font-semibold text-blue-900 mb-4">
            Detail Pembayaran
          </h3>
          <div className="payment-upload-details-list payment-upload-details-list-responsive space-y-2 text-sm">
            <div className="payment-upload-details-item payment-upload-details-item-responsive flex justify-between">
              <span className="payment-upload-details-label payment-upload-details-label-responsive text-blue-700">
                Bank:
              </span>
              <span className="payment-upload-details-value payment-upload-details-value-responsive font-medium text-blue-900">
                {booking.paymentMethod?.name || "N/A"}
              </span>
            </div>
            <div className="payment-upload-details-item payment-upload-details-item-responsive flex justify-between">
              <span className="payment-upload-details-label payment-upload-details-label-responsive text-blue-700">
                No. Rekening:
              </span>
              <span className="payment-upload-details-value payment-upload-details-value-responsive font-medium text-blue-900">
                {booking.paymentMethod?.accountNumber || "N/A"}
              </span>
            </div>
            <div className="payment-upload-details-item payment-upload-details-item-responsive flex justify-between">
              <span className="payment-upload-details-label payment-upload-details-label-responsive text-blue-700">
                Atas Nama:
              </span>
              <span className="payment-upload-details-value payment-upload-details-value-responsive font-medium text-blue-900">
                {booking.paymentMethod?.accountName || "N/A"}
              </span>
            </div>
            <div className="payment-upload-details-item payment-upload-details-item-responsive flex justify-between border-t border-blue-200 pt-2 mt-2">
              <span className="payment-upload-details-label payment-upload-details-label-responsive text-blue-700">
                Total Transfer:
              </span>
              <span className="payment-upload-details-value payment-upload-details-value-responsive font-bold text-blue-900 text-lg">
                Rp {booking.totalAmount?.toLocaleString("id-ID") || "0"}
              </span>
            </div>
          </div>
        </div>

        {!uploadComplete ? (
          <>
            <div className="payment-upload-form payment-upload-form-responsive mb-6">
              <label className="payment-upload-form-label payment-upload-form-label-responsive block text-sm font-semibold text-gray-900 mb-3">
                Bukti Transfer *
              </label>
              <div className="payment-upload-dropzone payment-upload-dropzone-responsive border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="payment-upload-input payment-upload-input-responsive hidden"
                  id="payment-proof"
                />
                <label
                  htmlFor="payment-proof"
                  className="payment-upload-dropzone-label payment-upload-dropzone-label-responsive cursor-pointer"
                >
                  {previewUrl ? (
                    <div className="payment-upload-preview payment-upload-preview-responsive space-y-4">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview bukti pembayaran"
                        className="payment-upload-preview-image payment-upload-preview-image-responsive max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                      />
                      <p className="payment-upload-preview-name payment-upload-preview-name-responsive text-blue-600 font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="payment-upload-preview-hint payment-upload-preview-hint-responsive text-gray-500 text-sm">
                        Klik untuk ganti file
                      </p>
                    </div>
                  ) : (
                    <>
                      <FaImage className="payment-upload-dropzone-icon payment-upload-dropzone-icon-responsive text-gray-400 text-3xl mx-auto mb-4" />
                      <p className="payment-upload-dropzone-text payment-upload-dropzone-text-responsive text-gray-600 mb-2">
                        Klik untuk pilih file atau drag & drop
                      </p>
                      <p className="payment-upload-dropzone-hint payment-upload-dropzone-hint-responsive text-gray-500 text-sm">
                        Format: JPG, PNG, JPEG (Maksimal 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="payment-upload-actions payment-upload-actions-responsive flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="payment-upload-cancel payment-upload-cancel-responsive flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="payment-upload-submit payment-upload-submit-responsive flex-1 bg-blue-500 text-white py-4 px-6 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <FaSpinner className="payment-upload-submit-spinner payment-upload-submit-spinner-responsive animate-spin mr-3" />
                    <span className="payment-upload-submit-text payment-upload-submit-text-responsive">
                      Mengupload...
                    </span>
                  </>
                ) : (
                  <>
                    <FaUpload className="payment-upload-submit-icon payment-upload-submit-icon-responsive mr-3" />
                    <span className="payment-upload-submit-text payment-upload-submit-text-responsive">
                      Upload Bukti
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="payment-upload-success payment-upload-success-responsive text-center mb-6">
              <div className="payment-upload-success-icon payment-upload-success-icon-responsive w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="payment-upload-success-icon-inner payment-upload-success-icon-inner-responsive text-blue-600 text-2xl" />
              </div>
              <h3 className="payment-upload-success-title payment-upload-success-title-responsive text-lg font-bold text-gray-900 mb-2">
                Upload Berhasil!
              </h3>
              <p className="payment-upload-success-text payment-upload-success-text-responsive text-gray-600">
                Bukti pembayaran telah diupload. Menunggu verifikasi admin.
              </p>
            </div>

            <div className="payment-upload-success-actions payment-upload-success-actions-responsive flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleComplete}
                className="payment-upload-success-done payment-upload-success-done-responsive flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Selesai
              </button>
              <button
                onClick={handleShowCard}
                className="payment-upload-success-card payment-upload-success-card-responsive flex-1 bg-blue-500 text-white py-4 px-6 rounded-2xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center"
              >
                <FaDownload className="payment-upload-success-card-icon payment-upload-success-card-icon-responsive mr-3" />
                <span className="payment-upload-success-card-text payment-upload-success-card-text-responsive">
                  Lihat Kartu Konfirmasi
                </span>
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
