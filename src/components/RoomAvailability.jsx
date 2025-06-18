"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { FaUsers, FaMapMarkerAlt } from "react-icons/fa"

const RoomAvailability = ({ onSelectRoom, selectedDate, selectedTime }) => {
  const [rooms, setRooms] = useState([])
  const [bookedRooms, setBookedRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (selectedDate && selectedTime) {
      checkAvailability()
    }
  }, [selectedDate, selectedTime])

  const fetchRooms = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"))
      const roomsData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }))
      setRooms(roomsData)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      // Fallback to default rooms if database fetch fails
      setRooms([
        { id: "ballroom", name: "Ballroom", capacity: 500, price: 5000000 },
        { id: "meeting-room-a", name: "Meeting Room A", capacity: 50, price: 1000000 },
        { id: "meeting-room-b", name: "Meeting Room B", capacity: 30, price: 750000 },
        { id: "conference-hall", name: "Conference Hall", capacity: 200, price: 2500000 },
        { id: "vip-room", name: "VIP Room", capacity: 20, price: 1500000 },
      ])
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
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-40 bg-gray-100 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Pilih Ruangan</h3>
        <p className="text-gray-600 text-sm">Pilih ruangan yang sesuai dengan kebutuhan acara Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const isBooked = bookedRooms.includes(room.id)
          return (
            <div
              key={room.id || room.docId}
              className={`group relative bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer ${
                isBooked
                  ? "border-gray-200 opacity-60 cursor-not-allowed"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={() => !isBooked && onSelectRoom(room)}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl || "/placeholder.svg"}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-gray-400 text-2xl mx-auto mb-2" />
                    <span className="text-gray-500 text-sm">Foto Ruangan</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{room.name}</h4>
                  {isBooked && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      Tidak Tersedia
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaUsers className="mr-2 text-gray-400" />
                    <span>Kapasitas: {room.capacity} orang</span>
                  </div>

                  {room.description && <p className="text-gray-600 text-sm line-clamp-2">{room.description}</p>}

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-gray-500 text-xs">+{room.amenities.length - 3} lainnya</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">Rp {room.price?.toLocaleString("id-ID")}</p>
                      <p className="text-gray-500 text-sm">per sesi</p>
                    </div>
                    {!isBooked && (
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-700 transition-colors">
                        Pilih
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoomAvailability
