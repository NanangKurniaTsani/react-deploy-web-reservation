"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { FaUsers, FaMapMarkerAlt, FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"
import PropTypes from "prop-types"

const VenueAvailability = ({ onSelectRoom, selectedDate, selectedTime }) => {
  const [rooms, setRooms] = useState([])
  const [bookedRooms, setBookedRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useBackButton(() => {
    window.history.back()
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (selectedDate && selectedTime) {
      checkAvailability()
    }
  }, [selectedDate, selectedTime])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"))
      const roomsData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }))
      setRooms(roomsData)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast.error("Gagal memuat data ruangan")
    }
    setLoading(false)
  }

  const checkAvailability = async () => {
    if (!selectedDate || !selectedTime) return

    setLoading(true)
    try {
      const q = query(
        collection(db, "bookings"),
        where("date", "==", selectedDate),
        where("time", "==", selectedTime),
        where("status", "==", "approved"),
      )

      const querySnapshot = await getDocs(q)
      const booked = querySnapshot.docs.map((doc) => doc.data().roomId)
      setBookedRooms(booked)
    } catch (error) {
      console.error("Error checking availability:", error)
      toast.error("Gagal memeriksa ketersediaan ruangan")
    }
    setLoading(false)
  }

  const venueCategories = [
    { value: "ballroom", label: "Ballroom" },
    { value: "meeting", label: "Meeting Room" },
    { value: "outdoor", label: "Outdoor Venue" },
  ]

  const getCategoryLabel = (category) => {
    const cat = venueCategories.find((c) => c.value === category)
    return cat ? cat.label : category
  }

  const getCategoryColor = (category) => {
    const colors = {
      ballroom: "bg-pink-100 text-pink-700",
      meeting: "bg-green-100 text-green-700",
      outdoor: "bg-blue-100 text-blue-700",
    }
    return colors[category] || colors.ballroom
  }

  if (loading) {
    return (
      <div className="venue-availability-loading venue-availability-loading-container venue-availability-loading-responsive flex justify-center items-center h-64">
        <FaSpinner className="venue-availability-spinner venue-availability-spinner-responsive animate-spin h-8 w-8 text-blue-500" />
      </div>
    )
  }

  return (
    <div className="venue-availability venue-availability-container venue-availability-responsive space-y-4 sm:space-y-6">
      <div className="venue-availability-header venue-availability-header-container venue-availability-header-responsive flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
        <div className="venue-availability-title venue-availability-title-container venue-availability-title-responsive">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ketersediaan Ruangan</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Pilih ruangan yang tersedia untuk tanggal dan waktu yang dipilih
          </p>
        </div>
      </div>

      <div className="venue-availability-categories venue-availability-categories-container venue-availability-categories-responsive flex flex-wrap gap-2">
        {venueCategories.map((category) => (
          <div
            key={category.value}
            className={`venue-availability-category venue-availability-category-responsive px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.value)}`}
          >
            {category.label}
          </div>
        ))}
      </div>

      <div className="venue-availability-grid venue-availability-grid-container venue-availability-grid-responsive grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rooms.map((room) => {
          const isBooked = bookedRooms.includes(room.id)
          return (
            <div
              key={room.id || room.docId}
              className={`venue-availability-room venue-availability-room-card venue-availability-room-responsive group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${
                isBooked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md active:scale-95"
              }`}
              onClick={() => !isBooked && onSelectRoom(room)}
            >
              <div className="venue-availability-room-image venue-availability-room-image-container venue-availability-room-image-responsive aspect-video bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center overflow-hidden">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl || "/placeholder.svg"}
                    alt={room.name}
                    className="venue-availability-room-img venue-availability-room-img-responsive w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                ) : null}
                <div className="venue-availability-room-placeholder venue-availability-room-placeholder-responsive text-center">
                  <FaMapMarkerAlt className="text-gray-400 text-xl sm:text-2xl mx-auto mb-2" />
                  <span className="text-gray-500 text-xs sm:text-sm">Foto Ruangan</span>
                </div>
              </div>

              <div className="venue-availability-room-content venue-availability-room-content-container venue-availability-room-content-responsive p-4 sm:p-6">
                <div className="venue-availability-room-header venue-availability-room-header-container venue-availability-room-header-responsive flex justify-between items-start mb-3">
                  <div className="venue-availability-room-info venue-availability-room-info-responsive">
                    <h3 className="venue-availability-room-name venue-availability-room-name-responsive text-base sm:text-lg font-semibold text-gray-900">
                      {room.name}
                    </h3>
                    {room.category && (
                      <div
                        className={`venue-availability-room-category venue-availability-room-category-responsive inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(room.category)}`}
                      >
                        {getCategoryLabel(room.category)}
                      </div>
                    )}
                  </div>
                  {isBooked && (
                    <span className="venue-availability-room-status venue-availability-room-status-responsive bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                      Tidak Tersedia
                    </span>
                  )}
                </div>

                <div className="venue-availability-room-details venue-availability-room-details-container venue-availability-room-details-responsive space-y-2 mb-4">
                  <div className="venue-availability-room-capacity venue-availability-room-capacity-responsive flex items-center text-gray-600 text-sm">
                    <FaUsers className="mr-2 text-gray-400" />
                    <span>{room.capacity} orang</span>
                  </div>
                  <div className="venue-availability-room-price venue-availability-room-price-responsive text-base sm:text-lg font-bold text-blue-600">
                    Rp {room.price?.toLocaleString("id-ID")}
                  </div>
                  {room.description && (
                    <p className="venue-availability-room-description venue-availability-room-description-responsive text-gray-600 text-xs sm:text-sm line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="venue-availability-room-amenities venue-availability-room-amenities-container venue-availability-room-amenities-responsive flex flex-wrap gap-1 mb-4">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="venue-availability-amenity venue-availability-amenity-responsive bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="venue-availability-amenity-more venue-availability-amenity-more-responsive text-gray-500 text-xs">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {!isBooked && (
                  <div className="venue-availability-room-action venue-availability-room-action-container venue-availability-room-action-responsive mt-4 pt-3 border-t border-gray-100">
                    <button className="venue-availability-room-button venue-availability-room-button-responsive w-full bg-blue-500 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium active:scale-95">
                      Pilih Ruangan
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {rooms.length === 0 && (
        <div className="venue-availability-empty venue-availability-empty-container venue-availability-empty-responsive text-center py-8 sm:py-12">
          <div className="venue-availability-empty-icon venue-availability-empty-icon-responsive text-4xl sm:text-6xl mb-4">
            🏨
          </div>
          <h3 className="venue-availability-empty-title venue-availability-empty-title-responsive text-lg sm:text-xl font-semibold text-gray-600 mb-2">
            Tidak Ada Ruangan Tersedia
          </h3>
          <p className="venue-availability-empty-text venue-availability-empty-text-responsive text-gray-500 text-sm sm:text-base">
            Silakan coba tanggal atau waktu yang berbeda.
          </p>
        </div>
      )}
    </div>
  )
}
VenueAvailability.propTypes = {
  onSelectRoom: PropTypes.func.isRequired,
  selectedDate: PropTypes.string,
  selectedTime: PropTypes.string,
}


export default VenueAvailability
