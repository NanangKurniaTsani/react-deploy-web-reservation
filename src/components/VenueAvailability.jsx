"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { FaUsers, FaMapMarkerAlt, FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

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
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ketersediaan Ruangan</h2>
          <p className="text-gray-600 text-sm mt-1">Pilih ruangan yang tersedia untuk tanggal dan waktu yang dipilih</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {venueCategories.map((category) => (
          <div
            key={category.value}
            className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.value)}`}
          >
            {category.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const isBooked = bookedRooms.includes(room.id)
          return (
            <div
              key={room.id || room.docId}
              className={`group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${
                isBooked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
              }`}
              onClick={() => !isBooked && onSelectRoom(room)}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center overflow-hidden">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl || "/placeholder.svg"}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                ) : null}
                <div className="text-center">
                  <FaMapMarkerAlt className="text-gray-400 text-2xl mx-auto mb-2" />
                  <span className="text-gray-500 text-sm">Foto Ruangan</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    {room.category && (
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(room.category)}`}
                      >
                        {getCategoryLabel(room.category)}
                      </div>
                    )}
                  </div>
                  {isBooked && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                      Tidak Tersedia
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaUsers className="mr-2 text-gray-400" />
                    <span>{room.capacity} orang</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">Rp {room.price?.toLocaleString("id-ID")}</div>
                  {room.description && <p className="text-gray-600 text-sm line-clamp-2">{room.description}</p>}
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-gray-500 text-xs">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                )}

                {!isBooked && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak Ada Ruangan Tersedia</h3>
          <p className="text-gray-500">Silakan coba tanggal atau waktu yang berbeda.</p>
        </div>
      )}
    </div>
  )
}

export default VenueAvailability