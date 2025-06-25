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
    <div className="krh-modal-overlay modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="krh-modal-container modal-container bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="krh-modal-header modal-header flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="krh-modal-title modal-title text-xl font-bold text-gray-900 truncate pr-4">{venue.name}</h2>
          <div className="krh-header-actions header-actions flex items-center space-x-2">
            <button
              onClick={onClose}
              className="krh-close-button close-button p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="krh-modal-content modal-content overflow-y-auto max-h-[calc(90vh-80px)]">
          {images.length > 0 && (
            <div className="krh-image-gallery image-gallery relative">
              <div className="krh-gallery-main gallery-main relative h-64 md:h-80 overflow-hidden">
                <img
                  src={
                    imageError[currentImageIndex] ? "/placeholder.svg?height=400&width=600" : images[currentImageIndex]
                  }
                  alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                  className="krh-gallery-image gallery-image w-full h-full object-cover"
                  onError={() => handleImageError(currentImageIndex)}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="krh-gallery-nav krh-gallery-nav-prev gallery-nav gallery-nav-prev absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                    >
                      <FaChevronLeft className="text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="krh-gallery-nav krh-gallery-nav-next gallery-nav gallery-nav-next absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                    >
                      <FaChevronRight className="text-gray-700" />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="krh-image-counter image-counter absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="krh-thumbnail-nav thumbnail-nav flex space-x-2 p-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`krh-thumbnail thumbnail flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
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

          <div className="krh-venue-info venue-info p-6 space-y-6">
            <div className="krh-basic-info basic-info">
              <div className="krh-info-header info-header flex items-start justify-between mb-4">
                <div className="krh-info-main info-main flex-1">
                  <div className="krh-venue-category venue-category mb-2">
                    <span className="krh-category-badge category-badge inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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
                    <div className="krh-venue-rating venue-rating flex items-center space-x-2 mb-2">
                      <div className="krh-rating-stars rating-stars flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm ${i < Math.floor(venue.rating) ? "text-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="krh-rating-text rating-text text-sm font-medium text-gray-700">
                        {venue.rating} ({venue.reviews} ulasan)
                      </span>
                    </div>
                  )}
                </div>

                <div className="krh-price-info price-info text-right">
                  <div className="krh-price-amount price-amount text-2xl font-bold text-blue-600">
                    {formatPrice(venue.price)}
                  </div>
                  <div className="krh-price-unit price-unit text-sm text-gray-500">per hari</div>
                </div>
              </div>

              <div className="krh-venue-stats venue-stats grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="krh-stat-item stat-item flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaUsers className="text-blue-500 text-lg" />
                  <div>
                    <div className="krh-stat-label stat-label text-sm text-gray-600">Kapasitas Maksimal</div>
                    <div className="krh-stat-value stat-value font-semibold text-gray-900">{venue.capacity} orang</div>
                  </div>
                </div>

                <div className="krh-stat-item stat-item flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-green-500 text-lg" />
                  <div>
                    <div className="krh-stat-label stat-label text-sm text-gray-600">Lokasi</div>
                    <div className="krh-stat-value stat-value font-semibold text-gray-900">King Royal Hotel</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="krh-venue-description venue-description">
              <h3 className="krh-section-title section-title text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
              <p className="krh-description-text description-text text-gray-600 leading-relaxed">{venue.description}</p>
            </div>

            {venue.amenities && venue.amenities.length > 0 && (
              <div className="krh-venue-amenities venue-amenities">
                <h3 className="krh-section-title section-title text-lg font-semibold text-gray-900 mb-3">Fasilitas</h3>
                <div className="krh-amenities-grid amenities-grid grid grid-cols-1 md:grid-cols-2 gap-3">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="krh-amenity-item amenity-item flex items-center space-x-3 p-2">
                      <div className="krh-amenity-icon amenity-icon text-blue-500">{getAmenityIcon(amenity)}</div>
                      <span className="krh-amenity-text amenity-text text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venue.setupOptions && venue.setupOptions.length > 0 && (
              <div className="krh-setup-options setup-options">
                <h3 className="krh-section-title section-title text-lg font-semibold text-gray-900 mb-3">
                  Pilihan Setup
                </h3>
                <div className="krh-setup-grid setup-grid grid grid-cols-1 md:grid-cols-2 gap-3">
                  {venue.setupOptions.map((setup, index) => (
                    <div key={index} className="krh-setup-item setup-item p-3 bg-gray-50 rounded-lg">
                      <div className="krh-setup-label setup-label font-medium text-gray-900">{setup.label}</div>
                      <div className="krh-setup-capacity setup-capacity text-sm text-gray-600">
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
          <div className="krh-modal-footer modal-footer p-4 border-t border-gray-200 bg-gray-50">
            <div className="krh-footer-actions footer-actions flex space-x-3">
              <button
                onClick={onClose}
                className="krh-action-button action-button flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onBook(venue)
                  onClose()
                }}
                disabled={bookingStatus === "pending" || bookingStatus === "confirmed"}
                className={`krh-action-button action-button flex-2 px-6 py-3 rounded-xl font-medium transition-colors ${
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