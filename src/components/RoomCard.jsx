"use client"

import { useState } from "react"
import { FaStar, FaUsers, FaWifi, FaBed, FaEye, FaCalendarCheck } from "react-icons/fa"

const RoomCard = ({ room, onBook }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    if (room.images && room.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room.images && room.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      standard: "bg-gray-100 text-gray-700",
      deluxe: "bg-blue-100 text-blue-700",
      suite: "bg-purple-100 text-purple-700",
      presidential: "bg-yellow-100 text-yellow-700",
    }
    return colors[category] || colors.standard
  }

  const getCategoryName = (category) => {
    const names = {
      standard: "Standard",
      deluxe: "Deluxe",
      suite: "Suite",
      presidential: "Presidential",
    }
    return names[category] || "Standard"
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      {/* Image Gallery */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            room.images?.[currentImageIndex] ||
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=300&fit=crop"
          }
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Image Navigation */}
        {room.images && room.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ›
            </button>

            {/* Image Dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {room.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              room.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {room.available ? "Tersedia" : "Tidak Tersedia"}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(room.category)}`}>
            {getCategoryName(room.category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.name}</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 text-sm mr-1" />
                <span className="text-sm font-medium text-gray-700">{room.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{room.reviews} reviews</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

        {/* Room Info */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <FaUsers className="mr-1" />
            <span>{room.capacity} tamu</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaBed className="mr-1" />
            <span>King Bed</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaWifi className="mr-1" />
            <span>WiFi</span>
          </div>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {room.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-gray-500 text-xs">+{room.amenities.length - 3} more</span>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">Rp {room.price?.toLocaleString("id-ID")}</div>
            <div className="text-sm text-gray-600">per malam</div>
          </div>

          <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
              <FaEye />
            </button>
            <button
              onClick={() => onBook && onBook(room)}
              disabled={!room.available}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                room.available
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {room.available ? (
                <div className="flex items-center space-x-1">
                  <FaCalendarCheck />
                  <span>Pesan</span>
                </div>
              ) : (
                "Penuh"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomCard
