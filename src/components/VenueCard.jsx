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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group w-full mobile-card">
      <div
        className="relative aspect-video mobile-image-video bg-gradient-to-br from-gray-100 to-blue-100 overflow-hidden cursor-pointer mobile-touch-target"
        onClick={handleImageClick}
      >
        <img
          src={
            venue.images?.[currentImageIndex] ||
            venue.imageUrl ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop" ||
            "/placeholder.svg"
          }
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 mobile-image"
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
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 mobile-touch-target-small bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-lg mobile-text-lg">‹</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 mobile-touch-target-small bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-lg mobile-text-lg">›</span>
            </button>
          </>
        )}

        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium mobile-status-badge ${
              venue.available ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
            }`}
          >
            {venue.available ? "Tersedia" : "Tidak Tersedia"}
          </span>
        </div>

        <div className="absolute top-2 right-2">
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium mobile-status-badge">
            {getCategoryName(venue.category)}
          </span>
        </div>

        <div className="absolute bottom-2 left-2">
          <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg flex items-center space-x-1 mobile-status-badge">
            <FaStar className="text-yellow-400 mobile-icon-sm" />
            <span className="text-xs font-medium mobile-text-xs">{venue.rating || "4.8"}</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 px-3 py-2 rounded-lg mobile-p-3">
            <span className="text-sm font-medium text-gray-800 mobile-text-sm">Klik untuk detail</span>
          </div>
        </div>
      </div>

      <div className="p-4 mobile-card-content mobile-p-4">
        <div className="space-y-2 mobile-space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg mobile-text-lg font-bold text-gray-900 mb-2 mobile-mb-4 truncate">{venue.name}</h3>
              <div className="flex items-center space-x-2 mobile-space-x-2">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1 mobile-icon-sm" />
                  <span className="text-sm mobile-text-sm font-medium text-gray-700">{venue.rating || "4.8"}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-sm mobile-text-sm text-gray-600">{venue.reviews || 0} reviews</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mobile-text-sm mb-4 mobile-mb-4 line-clamp-2">
            {venue.description || "Venue berkualitas tinggi dengan fasilitas lengkap untuk acara istimewa Anda."}
          </p>

          <div className="space-y-2 mobile-space-y-2">
            <div className="flex items-center justify-between bg-blue-50 p-3 mobile-p-3 rounded-xl">
              <div className="flex items-center text-blue-700">
                <FaUsers className="mr-2 text-blue-600 mobile-icon-sm" />
                <span className="font-semibold text-sm mobile-text-sm">Kapasitas: {venue.capacity || 50} orang</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50 p-3 mobile-p-3 rounded-xl">
              <div className="flex items-center text-blue-700">
                <FaClock className="mr-2 text-blue-600 mobile-icon-sm" />
                <span className="font-semibold text-sm mobile-text-sm">
                  {venue.category === "ballroom"
                    ? "24 Jam"
                    : venue.category === "outdoor"
                      ? "06:00-24:00"
                      : "08:00-22:00"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50 p-3 mobile-p-3 rounded-xl">
              <div className="flex items-center text-blue-700">
                <FaBuilding className="mr-2 text-blue-600 mobile-icon-sm" />
                <span className="font-semibold text-sm mobile-text-sm">{getCategoryName(venue.category)}</span>
              </div>
            </div>
          </div>

          {venue.amenities && venue.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4 mobile-mb-4">
              {venue.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium mobile-status-badge"
                >
                  {amenity}
                </span>
              ))}
              {venue.amenities.length > 3 && (
                <span className="text-blue-600 text-xs mobile-text-xs font-semibold">
                  +{venue.amenities.length - 3} lainnya
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-3 mobile-space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg mobile-text-lg font-bold text-gray-900">
                  Rp {venue.price?.toLocaleString("id-ID") || "1.000.000"}
                </p>
                <p className="text-gray-500 text-sm mobile-text-sm">per hari</p>
              </div>
            </div>

            {userRole !== "admin" && (
              <button
                onClick={handleBook}
                disabled={!venue.available || loading}
                className={`w-full px-4 py-3 mobile-button mobile-py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 mobile-space-x-2 ${
                  venue.available
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin mobile-icon-sm" />
                ) : venue.available ? (
                  <>
                    <FaCalendarCheck className="mobile-icon-sm" />
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