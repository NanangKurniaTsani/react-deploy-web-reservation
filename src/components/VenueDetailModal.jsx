"use client"

import { useState, useEffect } from "react"
import {
  FaTimes,
  FaStar,
  FaUsers,
  FaWifi,
  FaParking,
  FaUtensils,
  FaMusic,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarCheck,
  FaMapMarkerAlt,
} from "react-icons/fa"
import PropTypes from "prop-types"
import { useBackButton } from "../hooks/UseBackButton"

const VenueDetailModal = ({ venue, isOpen, onClose, onBook, userRole, bookingStatus }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState({})

  useBackButton(() => {
    onClose()
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setCurrentImageIndex(0)
      setImageError({})
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !venue) return null

  const images = venue.images || [venue.imageUrl].filter(Boolean)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase()
    if (amenityLower.includes("wifi")) return <FaWifi />
    if (amenityLower.includes("parking")) return <FaParking />
    if (amenityLower.includes("catering") || amenityLower.includes("kitchen")) return <FaUtensils />
    if (amenityLower.includes("sound") || amenityLower.includes("music")) return <FaMusic />
    return <FaUsers />
  }

  const handleImageError = (index) => {
    setImageError((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">
            {venue.name}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {images.length > 0 && (
            <div className="relative">
              <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
                <img
                  src={
                    imageError[currentImageIndex] ? "/placeholder.svg?height=400&width=600" : images[currentImageIndex]
                  }
                  alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(currentImageIndex)}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all active:scale-95"
                    >
                      <FaChevronLeft className="text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all active:scale-95"
                    >
                      <FaChevronRight className="text-gray-700" />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-8 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                        index === currentImageIndex ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={imageError[index] ? "/placeholder.svg?height=60&width=80" : image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(index)}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                      {venue.category === "ballroom"
                        ? "Ballroom"
                        : venue.category === "meeting"
                          ? "Meeting Room"
                          : venue.category === "outdoor"
                            ? "Outdoor"
                            : venue.category}
                    </span>
                  </div>

                  {venue.rating && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-xs sm:text-sm ${i < Math.floor(venue.rating) ? "text-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {venue.rating} ({venue.reviews} ulasan)
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {formatPrice(venue.price)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    per hari
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaUsers className="text-blue-500 text-base sm:text-lg" />
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Kapasitas Maksimal
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {venue.capacity} orang
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-green-500 text-base sm:text-lg" />
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Lokasi
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      King Royal Hotel
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                Deskripsi
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {venue.description}
              </p>
            </div>

            {venue.amenities && venue.amenities.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Fasilitas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {venue.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 sm:space-x-3 p-2"
                    >
                      <div className="text-blue-500 text-sm sm:text-base">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-gray-700 text-sm sm:text-base">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venue.setupOptions && venue.setupOptions.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Pilihan Setup
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {venue.setupOptions.map((setup, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {setup.label}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Kapasitas: {setup.capacity} orang
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {userRole !== "admin" && (
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 sm:px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base active:scale-95"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onBook(venue)
                  onClose()
                }}
                disabled={bookingStatus === "pending" || bookingStatus === "confirmed"}
                className={`flex-1 sm:flex-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors text-sm sm:text-base active:scale-95 ${
                  bookingStatus === "pending" || bookingStatus === "confirmed"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <FaCalendarCheck className="inline mr-2" />
                {bookingStatus === "pending"
                  ? "Menunggu Konfirmasi"
                  : bookingStatus === "confirmed"
                    ? "Sudah Dikonfirmasi"
                    : "Pesan Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

VenueDetailModal.propTypes = {
  venue: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    capacity: PropTypes.number,
    price: PropTypes.number,
    rating: PropTypes.number,
    reviews: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
    setupOptions: PropTypes.arrayOf(PropTypes.object),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  bookingStatus: PropTypes.string,
}

export default VenueDetailModal