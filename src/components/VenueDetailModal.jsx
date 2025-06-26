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

  // Gunakan venue.images atau venue.imageUrl dari data venue
  const images =
    venue.images && venue.images.length > 0
      ? venue.images
      : venue.imageUrl
        ? [venue.imageUrl]
        : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"]

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
    <div className="venue-modal venue-modal-overlay venue-modal-responsive fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="venue-modal-container venue-modal-container-responsive bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-2xl overflow-hidden shadow-2xl sm:max-h-[90vh]">
        <div className="venue-modal-header venue-modal-header-container venue-modal-header-responsive flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="venue-modal-title venue-modal-title-responsive text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">
            {venue.name}
          </h2>
          <div className="venue-modal-actions venue-modal-actions-container venue-modal-actions-responsive flex items-center space-x-2">
            <button
              onClick={onClose}
              className="venue-modal-close venue-modal-close-responsive p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="venue-modal-content venue-modal-content-container venue-modal-content-responsive overflow-y-auto flex-1 sm:max-h-[calc(90vh-160px)]">
          {images.length > 0 && (
            <div className="venue-modal-gallery venue-modal-gallery-container venue-modal-gallery-responsive relative">
              <div className="venue-modal-main-image venue-modal-main-image-container venue-modal-main-image-responsive relative h-48 sm:h-64 md:h-80 overflow-hidden">
                <img
                  src={
                    imageError[currentImageIndex]
                      ? venue.imageUrl || "/placeholder.svg?height=400&width=600"
                      : images[currentImageIndex]
                  }
                  alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                  className="venue-modal-image venue-modal-image-responsive w-full h-full object-cover"
                  onError={() => handleImageError(currentImageIndex)}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="venue-modal-nav venue-modal-nav-prev venue-modal-nav-responsive absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all active:scale-95"
                    >
                      <FaChevronLeft className="text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="venue-modal-nav venue-modal-nav-next venue-modal-nav-responsive absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all active:scale-95"
                    >
                      <FaChevronRight className="text-gray-700" />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="venue-modal-counter venue-modal-counter-responsive absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="venue-modal-thumbnails venue-modal-thumbnails-container venue-modal-thumbnails-responsive flex space-x-2 p-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`venue-modal-thumbnail venue-modal-thumbnail-responsive flex-shrink-0 w-12 h-8 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                        index === currentImageIndex ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={imageError[index] ? venue.imageUrl || "/placeholder.svg?height=60&width=80" : image}
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

          <div className="venue-modal-info venue-modal-info-container venue-modal-info-responsive p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="venue-modal-basic venue-modal-basic-container venue-modal-basic-responsive">
              <div className="venue-modal-header-info venue-modal-header-info-container venue-modal-header-info-responsive flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="venue-modal-main-info venue-modal-main-info-container venue-modal-main-info-responsive flex-1">
                  <div className="venue-modal-category venue-modal-category-container venue-modal-category-responsive mb-2">
                    <span className="venue-modal-category-badge venue-modal-category-badge-responsive inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
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
                    <div className="venue-modal-rating venue-modal-rating-container venue-modal-rating-responsive flex items-center space-x-2 mb-2">
                      <div className="venue-modal-stars venue-modal-stars-responsive flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-xs sm:text-sm ${i < Math.floor(venue.rating) ? "text-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="venue-modal-rating-text venue-modal-rating-text-responsive text-xs sm:text-sm font-medium text-gray-700">
                        {venue.rating} ({venue.reviews} ulasan)
                      </span>
                    </div>
                  )}
                </div>

                <div className="venue-modal-price venue-modal-price-container venue-modal-price-responsive text-left sm:text-right">
                  <div className="venue-modal-price-amount venue-modal-price-amount-responsive text-xl sm:text-2xl font-bold text-blue-600">
                    {formatPrice(venue.price)}
                  </div>
                  <div className="venue-modal-price-unit venue-modal-price-unit-responsive text-xs sm:text-sm text-gray-500">
                    per hari
                  </div>
                </div>
              </div>

              <div className="venue-modal-stats venue-modal-stats-container venue-modal-stats-responsive grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="venue-modal-stat venue-modal-stat-responsive flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaUsers className="text-blue-500 text-base sm:text-lg" />
                  <div>
                    <div className="venue-modal-stat-label venue-modal-stat-label-responsive text-xs sm:text-sm text-gray-600">
                      Kapasitas Maksimal
                    </div>
                    <div className="venue-modal-stat-value venue-modal-stat-value-responsive font-semibold text-gray-900 text-sm sm:text-base">
                      {venue.capacity} orang
                    </div>
                  </div>
                </div>

                <div className="venue-modal-stat venue-modal-stat-responsive flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-green-500 text-base sm:text-lg" />
                  <div>
                    <div className="venue-modal-stat-label venue-modal-stat-label-responsive text-xs sm:text-sm text-gray-600">
                      Lokasi
                    </div>
                    <div className="venue-modal-stat-value venue-modal-stat-value-responsive font-semibold text-gray-900 text-sm sm:text-base">
                      King Royal Hotel
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="venue-modal-description venue-modal-description-container venue-modal-description-responsive">
              <h3 className="venue-modal-section-title venue-modal-section-title-responsive text-base sm:text-lg font-semibold text-gray-900 mb-3">
                Deskripsi
              </h3>
              <p className="venue-modal-description-text venue-modal-description-text-responsive text-gray-600 leading-relaxed text-sm sm:text-base">
                {venue.description}
              </p>
            </div>

            {venue.amenities && venue.amenities.length > 0 && (
              <div className="venue-modal-amenities venue-modal-amenities-container venue-modal-amenities-responsive">
                <h3 className="venue-modal-section-title venue-modal-section-title-responsive text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Fasilitas
                </h3>
                <div className="venue-modal-amenities-grid venue-modal-amenities-grid-responsive grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {venue.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="venue-modal-amenity venue-modal-amenity-responsive flex items-center space-x-2 sm:space-x-3 p-2"
                    >
                      <div className="venue-modal-amenity-icon venue-modal-amenity-icon-responsive text-blue-500 text-sm sm:text-base">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="venue-modal-amenity-text venue-modal-amenity-text-responsive text-gray-700 text-sm sm:text-base">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venue.setupOptions && venue.setupOptions.length > 0 && (
              <div className="venue-modal-setup venue-modal-setup-container venue-modal-setup-responsive">
                <h3 className="venue-modal-section-title venue-modal-section-title-responsive text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Pilihan Setup
                </h3>
                <div className="venue-modal-setup-grid venue-modal-setup-grid-responsive grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {venue.setupOptions.map((setup, index) => (
                    <div
                      key={index}
                      className="venue-modal-setup-item venue-modal-setup-item-responsive p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="venue-modal-setup-label venue-modal-setup-label-responsive font-medium text-gray-900 text-sm sm:text-base">
                        {setup.label}
                      </div>
                      <div className="venue-modal-setup-capacity venue-modal-setup-capacity-responsive text-xs sm:text-sm text-gray-600">
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
          <div className="venue-modal-footer venue-modal-footer-container venue-modal-footer-responsive p-4 sm:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <div className="venue-modal-footer-actions venue-modal-footer-actions-responsive flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="venue-modal-button venue-modal-button-close venue-modal-button-responsive flex-1 bg-gray-200 text-gray-800 px-4 sm:px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base active:scale-95"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onBook(venue)
                  onClose()
                }}
                disabled={bookingStatus === "pending" || bookingStatus === "confirmed"}
                className={`venue-modal-button venue-modal-button-book venue-modal-button-responsive flex-1 sm:flex-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors text-sm sm:text-base active:scale-95 ${
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
