"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { FaStar, FaUsers, FaCalendarCheck, FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"

const VenueCard = ({ venue, onBook, onViewDetails, userRole }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Simplified image handling
  const getImageSrc = () => {
    if (venue.images && venue.images.length > 0) {
      return venue.images[currentImageIndex]
    }
    if (venue.imageUrl) {
      return venue.imageUrl
    }
    return "/placeholder.svg?height=300&width=500&text=King+Royal+Hotel"
  }

  const handleImageError = () => {
    console.log("Image error for venue:", venue.name)
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log("Image loaded successfully for venue:", venue.name)
    setImageError(false)
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 w-full">
      {/* Image Section - Simplified */}
      <div
        className="relative w-full h-48 cursor-pointer overflow-hidden"
        onClick={handleImageClick}
        style={{ backgroundColor: "#f3f4f6" }} // Fallback background
      >
        {!imageError ? (
          <img
            src={getImageSrc() || "/placeholder.svg"}
            alt={venue.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">{venue.name}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              venue.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {venue.available ? "Tersedia" : "Tidak Tersedia"}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-xs font-medium">{venue.rating || "4.8"}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Title and Rating */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{venue.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaStar className="text-yellow-400" />
              <span>{venue.rating || "4.8"}</span>
              <span>•</span>
              <span>{venue.reviews || 0} reviews</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {venue.description || "Venue berkualitas tinggi dengan fasilitas lengkap untuk acara istimewa Anda."}
          </p>

          {/* Capacity */}
          <div className="flex items-center bg-blue-50 p-2 rounded-lg">
            <FaUsers className="text-blue-600 mr-2" />
            <span className="text-blue-700 font-semibold text-sm">Kapasitas: {venue.capacity || 50} orang</span>
          </div>

          {/* Amenities */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {venue.amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                  {amenity}
                </span>
              ))}
              {venue.amenities.length > 3 && (
                <span className="text-blue-600 text-xs font-semibold">+{venue.amenities.length - 3} lainnya</span>
              )}
            </div>
          )}

          {/* Price and Book Button */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  Rp {venue.price?.toLocaleString("id-ID") || "1.000.000"}
                </p>
                <p className="text-gray-500 text-sm">per hari</p>
              </div>
            </div>

            {userRole !== "admin" && (
              <button
                onClick={handleBook}
                disabled={!venue.available || loading}
                className={`w-full py-2 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  venue.available
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : venue.available ? (
                  <>
                    <FaCalendarCheck />
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
    description: PropTypes.string,
    capacity: PropTypes.number,
    price: PropTypes.number,
    amenities: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onBook: PropTypes.func,
  onViewDetails: PropTypes.func,
  userRole: PropTypes.string,
}

export default VenueCard
