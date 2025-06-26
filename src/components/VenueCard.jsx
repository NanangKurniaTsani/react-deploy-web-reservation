"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { FaStar, FaUsers, FaCalendarCheck, FaSpinner, FaClock, FaBuilding } from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

const VenueCard = ({ venue, onBook, onViewDetails, userRole }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  useBackButton(() => {
    window.history.back()
  })

  const nextImage = () => {
    if (venue.images && venue.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % venue.images.length)
    }
  }

  const prevImage = () => {
    if (venue.images && venue.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length)
    }
  }

  const getCategoryName = (category) => {
    const names = {
      ballroom: "Ballroom",
      meeting: "Meeting Room",
      outdoor: "Outdoor Venue",
    }
    return names[category] || "Meeting Room"
  }

  const handleBook = async () => {
    if (!venue.available) return
    if (userRole === "admin") {
      toast.error("Admin tidak dapat melakukan pemesanan")
      return
    }

    setLoading(true)
    try {
      if (onBook) await onBook(venue)
    } catch (error) {
      console.error("Error booking venue:", error)
      toast.error("Gagal memesan venue")
    }
    setLoading(false)
  }

  const handleImageClick = () => {
    if (onViewDetails) {
      onViewDetails(venue)
    }
  }

  return (
    <div className="venue-card venue-card-container venue-card-responsive bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group w-full">
      <div
        className="venue-card-image venue-card-image-container venue-card-image-responsive relative aspect-video bg-gradient-to-br from-gray-100 to-blue-100 overflow-hidden cursor-pointer"
        onClick={handleImageClick}
      >
        <img
          src={
            venue.images?.[currentImageIndex] ||
            venue.imageUrl ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop" 
          }
          alt={venue.name}
          className="venue-card-img venue-card-img-responsive w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"
          }}
        />

        {venue.images && venue.images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="venue-card-nav venue-card-nav-prev venue-card-nav-responsive absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <span className="text-lg">‹</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="venue-card-nav venue-card-nav-next venue-card-nav-responsive absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <span className="text-lg">›</span>
            </button>
          </>
        )}

        <div className="venue-card-status venue-card-status-container venue-card-status-responsive absolute top-2 left-2">
          <span
            className={`venue-card-status-badge venue-card-status-badge-responsive px-2 py-1 rounded-full text-xs font-medium ${
              venue.available ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
            }`}
          >
            {venue.available ? "Tersedia" : "Tidak Tersedia"}
          </span>
        </div>

        <div className="venue-card-category venue-card-category-container venue-card-category-responsive absolute top-2 right-2">
          <span className="venue-card-category-badge venue-card-category-badge-responsive bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {getCategoryName(venue.category)}
          </span>
        </div>

        <div className="venue-card-rating venue-card-rating-container venue-card-rating-responsive absolute bottom-2 left-2">
          <div className="venue-card-rating-badge venue-card-rating-badge-responsive bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-xs font-medium">{venue.rating || "4.8"}</span>
          </div>
        </div>

        <div className="venue-card-overlay venue-card-overlay-responsive absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="venue-card-overlay-text venue-card-overlay-text-responsive opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-gray-800">Klik untuk detail</span>
          </div>
        </div>
      </div>

      <div className="venue-card-content venue-card-content-container venue-card-content-responsive p-4 sm:p-6">
        <div className="venue-card-info venue-card-info-container venue-card-info-responsive space-y-3 sm:space-y-4">
          <div className="venue-card-header venue-card-header-container venue-card-header-responsive flex justify-between items-start">
            <div className="venue-card-title venue-card-title-container venue-card-title-responsive flex-1 min-w-0">
              <h3 className="venue-card-name venue-card-name-responsive text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">
                {venue.name}
              </h3>
              <div className="venue-card-rating-info venue-card-rating-info-container venue-card-rating-info-responsive flex items-center space-x-2">
                <div className="venue-card-stars venue-card-stars-responsive flex items-center">
                  <FaStar className="text-yellow-400 mr-1 text-xs sm:text-sm" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{venue.rating || "4.8"}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-xs sm:text-sm text-gray-600">{venue.reviews || 0} reviews</span>
              </div>
            </div>
          </div>

          <p className="venue-card-description venue-card-description-responsive text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
            {venue.description || "Venue berkualitas tinggi dengan fasilitas lengkap untuk acara istimewa Anda."}
          </p>

          <div className="venue-card-features venue-card-features-container venue-card-features-responsive space-y-2">
            <div className="venue-card-feature venue-card-feature-responsive flex items-center justify-between bg-blue-50 p-2 sm:p-3 rounded-xl">
              <div className="venue-card-feature-info venue-card-feature-info-responsive flex items-center text-blue-700">
                <FaUsers className="mr-2 text-blue-600 text-xs sm:text-sm" />
                <span className="font-semibold text-xs sm:text-sm">Kapasitas: {venue.capacity || 50} orang</span>
              </div>
            </div>

            <div className="venue-card-feature venue-card-feature-responsive flex items-center justify-between bg-blue-50 p-2 sm:p-3 rounded-xl">
              <div className="venue-card-feature-info venue-card-feature-info-responsive flex items-center text-blue-700">
                <FaClock className="mr-2 text-blue-600 text-xs sm:text-sm" />
                <span className="font-semibold text-xs sm:text-sm">
                  {venue.category === "ballroom"
                    ? "24 Jam"
                    : venue.category === "outdoor"
                      ? "06:00-24:00"
                      : "08:00-22:00"}
                </span>
              </div>
            </div>

            <div className="venue-card-feature venue-card-feature-responsive flex items-center justify-between bg-blue-50 p-2 sm:p-3 rounded-xl">
              <div className="venue-card-feature-info venue-card-feature-info-responsive flex items-center text-blue-700">
                <FaBuilding className="mr-2 text-blue-600 text-xs sm:text-sm" />
                <span className="font-semibold text-xs sm:text-sm">{getCategoryName(venue.category)}</span>
              </div>
            </div>
          </div>

          {venue.amenities && venue.amenities.length > 0 && (
            <div className="venue-card-amenities venue-card-amenities-container venue-card-amenities-responsive flex flex-wrap gap-1 mb-3 sm:mb-4">
              {venue.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="venue-card-amenity venue-card-amenity-responsive bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {venue.amenities.length > 3 && (
                <span className="venue-card-amenity-more venue-card-amenity-more-responsive text-blue-600 text-xs font-semibold">
                  +{venue.amenities.length - 3} lainnya
                </span>
              )}
            </div>
          )}

          <div className="venue-card-footer venue-card-footer-container venue-card-footer-responsive flex flex-col space-y-3 pt-4 border-t border-gray-100">
            <div className="venue-card-pricing venue-card-pricing-container venue-card-pricing-responsive flex justify-between items-center">
              <div className="venue-card-price venue-card-price-container venue-card-price-responsive">
                <p className="venue-card-price-amount venue-card-price-amount-responsive text-base sm:text-lg font-bold text-gray-900">
                  Rp {venue.price?.toLocaleString("id-ID") || "1.000.000"}
                </p>
                <p className="venue-card-price-unit venue-card-price-unit-responsive text-gray-500 text-xs sm:text-sm">
                  per hari
                </p>
              </div>
            </div>

            {userRole !== "admin" && (
              <button
                onClick={handleBook}
                disabled={!venue.available || loading}
                className={`venue-card-button venue-card-button-responsive w-full px-4 py-2 sm:py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 ${
                  venue.available
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-xs sm:text-sm" />
                ) : venue.available ? (
                  <>
                    <FaCalendarCheck className="text-xs sm:text-sm" />
                    <span>Pesan</span>
                  </>
                ) : (
                  "Penuh"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

VenueCard.propTypes = {
  venue: PropTypes.shape({
    docId: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    rating: PropTypes.number,
    reviews: PropTypes.number,
    available: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    description: PropTypes.string,
    capacity: PropTypes.number,
    price: PropTypes.number,
    amenities: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onBook: PropTypes.func,
  onViewDetails: PropTypes.func,
  userRole: PropTypes.string,
}

export default VenueCard
