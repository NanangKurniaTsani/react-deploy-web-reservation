"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import RoomCard from "./RoomCard"
import { FaSearch, FaFilter } from "react-icons/fa"

const HomePage = ({ onNavigate }) => {
  const { currentUser } = useAuth()
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const roomCategories = [
    { id: "all", name: "Semua Kamar" },
    { id: "standard", name: "Standard Room" },
    { id: "deluxe", name: "Deluxe Room" },
    { id: "suite", name: "Suite Room" },
    { id: "presidential", name: "Presidential Suite" },
    { id: "ballroom", name: "Ballroom" },
    { id: "meeting", name: "Meeting Room" },
    { id: "conference", name: "Conference Hall" },
    { id: "banquet", name: "Banquet Hall" },
  ]

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [rooms, selectedCategory, searchTerm])

  const fetchRooms = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"))
      const roomsData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
        category: doc.data().category || "standard",
        rating: doc.data().rating || 4.5,
        reviews: doc.data().reviews || 128,
        available: doc.data().available !== false,
        images: doc.data().images || [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=300&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=300&fit=crop",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=300&fit=crop",
        ],
      }))

      // Add some default rooms if none exist
      if (roomsData.length === 0) {
        const defaultRooms = [
          {
            id: "deluxe-ocean-view",
            name: "Deluxe Ocean View",
            category: "deluxe",
            capacity: 2,
            price: 2500000,
            description: "Kamar mewah dengan pemandangan laut yang menakjubkan",
            rating: 4.8,
            reviews: 156,
            available: true,
            amenities: ["Ocean View", "King Bed", "Mini Bar", "Balcony"],
            images: [
              "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=300&fit=crop",
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=300&fit=crop",
            ],
          },
          {
            id: "presidential-suite",
            name: "Presidential Suite",
            category: "presidential",
            capacity: 4,
            price: 8500000,
            description: "Suite mewah dengan fasilitas premium dan layanan butler",
            rating: 4.9,
            reviews: 89,
            available: true,
            amenities: ["Butler Service", "Private Pool", "Jacuzzi", "Living Room"],
            images: [
              "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=300&fit=crop",
              "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&h=300&fit=crop",
            ],
          },
          {
            id: "standard-garden",
            name: "Standard Garden View",
            category: "standard",
            capacity: 2,
            price: 1200000,
            description: "Kamar nyaman dengan pemandangan taman yang asri",
            rating: 4.3,
            reviews: 203,
            available: false,
            amenities: ["Garden View", "Queen Bed", "Work Desk", "WiFi"],
            images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop"],
          },
        ]
        setRooms(defaultRooms)
      } else {
        setRooms(roomsData)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
    setLoading(false)
  }

  const filterRooms = () => {
    let filtered = rooms

    if (selectedCategory !== "all") {
      filtered = filtered.filter((room) => room.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRooms(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Serenity Resort</h1>
              <p className="text-gray-600 mt-1">Luxury accommodation experience</p>
            </div>
            {currentUser && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{currentUser.displayName || currentUser.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kamar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roomCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Categories Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {roomCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-2xl font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.docId || room.id}
                room={room}
                onBook={() => onNavigate && onNavigate("booking", room)}
              />
            ))}
          </div>
        )}

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak Ada Kamar</h3>
            <p className="text-gray-500">Tidak ada kamar yang sesuai dengan filter yang dipilih.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
