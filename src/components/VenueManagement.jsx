"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaSave,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa"
import toast from "react-hot-toast"
import { useBackButton } from "../hooks/UseBackButton"

const VenueManagement = () => {
  const { userRole } = useAuth()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "meeting",
    capacity: "",
    price: "",
    description: "",
    amenities: "",
    imageUrl: "",
    available: true,
  })

  const defaultVenues = [
    {
      name: "Santorini Ballroom",
      category: "ballroom",
      capacity: 250,
      price: 5000000,
      description: "Ballroom mewah dengan kapasitas besar, dilengkapi dengan fasilitas premium untuk acara pernikahan, gala dinner, dan event besar lainnya.",
      amenities: [
        "Sound System Premium",
        "Lighting Professional",
        "AC Central",
        "Catering Kitchen",
        "WiFi High Speed",
        "Proyektor 4K",
        "Stage Besar",
        "Chandelier Kristal",
        "Lantai Marmer",
        "Backdrop LED",
      ],
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1464366400600-48f60103fc96?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
      ],
      available: true,
      rating: 4.9,
      reviews: 127,
      setupOptions: [
        { type: "clash-room", capacity: 175, label: "Clash Room - 175 pax" },
        { type: "round", capacity: 125, label: "Round Table - 125 pax" },
        { type: "theater", capacity: 250, label: "Theater Style - 250 pax" },
      ],
    },
    {
      name: "Venice Meeting Room",
      category: "meeting",
      capacity: 35,
      price: 2000000,
      description: "Ruang meeting modern dengan teknologi terdepan, ideal untuk presentasi bisnis, workshop, dan meeting corporate.",
      amenities: [
        "Smart TV 65 inch",
        "Video Conference",
        "Whiteboard Digital",
        "AC",
        "WiFi Gratis",
        "Coffee Station",
        "Ergonomic Chairs",
        "Wireless Presentation",
        "Flipchart",
      ],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=500&h=300&fit=crop",
      ],
      available: true,
      rating: 4.8,
      reviews: 89,
      setupOptions: [
        { type: "clash-room", capacity: 25, label: "Clash Room - 25 pax" },
        { type: "u-shape", capacity: 20, label: "U Shape - 20 pax" },
        { type: "round", capacity: 10, label: "Round Table - 10 pax" },
        { type: "theater", capacity: 35, label: "Theater Style - 35 pax" },
      ],
    },
    {
      name: "Barcelona Meeting Room",
      category: "meeting",
      capacity: 50,
      price: 2000000,
      description: "Meeting room dengan kapasitas sedang, dilengkapi fasilitas modern untuk produktivitas maksimal.",
      amenities: [
        "Proyektor HD",
        "Sound System",
        "AC",
        "WiFi Gratis",
        "Flipchart",
        "Coffee Break Area",
        "Natural Lighting",
        "Acoustic Design",
        "Modular Seating",
      ],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
      ],
      available: true,
      rating: 4.7,
      reviews: 64,
      setupOptions: [
        { type: "clash-room", capacity: 30, label: "Clash Room - 30 pax" },
        { type: "u-shape", capacity: 20, label: "U Shape - 20 pax" },
        { type: "round", capacity: 10, label: "Round Table - 10 pax" },
        { type: "theater", capacity: 50, label: "Theater Style - 50 pax" },
      ],
    },
    {
      name: "Mellizo Room",
      category: "meeting",
      capacity: 50,
      price: 2000000,
      description: "Ruang meeting intimate untuk diskusi tim kecil dan brainstorming session.",
      amenities: [
        "LED TV",
        "Wireless Presentation",
        "AC",
        "WiFi",
        "Comfortable Seating",
        "Tea & Coffee",
        "Brainstorming Wall",
        "Creative Lighting",
        "Cozy Atmosphere",
      ],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
      ],
      available: true,
      rating: 4.6,
      reviews: 38,
      setupOptions: [
        { type: "clash-room", capacity: 30, label: "Clash Room - 30 pax" },
        { type: "u-shape", capacity: 20, label: "U Shape - 20 pax" },
        { type: "round", capacity: 10, label: "Round Table - 10 pax" },
        { type: "theater", capacity: 50, label: "Theater Style - 50 pax" },
      ],
    },
    {
      name: "Swimming Pool Area",
      category: "outdoor",
      capacity: 125,
      price: 3000000,
      description: "Area kolam renang yang sempurna untuk acara outdoor, pool party, dan gathering santai.",
      amenities: [
        "Pool Access",
        "Outdoor Seating",
        "BBQ Area",
        "Sound System Outdoor",
        "Lighting",
        "Gazebo",
        "Pool Deck",
        "Lounge Chairs",
        "Umbrella Tables",
        "Poolside Bar",
      ],
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop",
      ],
      available: true,
      rating: 4.8,
      reviews: 92,
      setupOptions: [
        { type: "u-shape", capacity: 20, label: "U Shape - 20 pax" },
        { type: "round-large", capacity: 125, label: "Round Large - 125 pax" },
        { type: "round-small", capacity: 25, label: "Round Small - 25 pax" },
        { type: "cocktail", capacity: 10, label: "Cocktail Setup - 10 pax" },
      ],
    },
    {
      name: "Basement Terrace",
      category: "outdoor",
      capacity: 50,
      price: 2500000,
      description: "Teras basement yang nyaman untuk acara outdoor intimate dengan suasana yang tenang.",
      amenities: [
        "Outdoor Furniture",
        "Garden View",
        "Sound System",
        "Lighting Ambient",
        "WiFi",
        "Refreshment Area",
        "Natural Ventilation",
        "Garden Decoration",
        "Privacy Screen",
      ],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop",
      ],
      available: true,
      rating: 4.7,
      reviews: 56,
      setupOptions: [
        { type: "garden", capacity: 50, label: "Garden Style - 50 pax" },
        { type: "cocktail", capacity: 30, label: "Cocktail Setup - 30 pax" },
      ],
    },
  ]

  useBackButton(() => {
    window.history.back()
  })

  useEffect(() => {
    if (userRole === "admin") {
      initializeVenues()
    }
  }, [userRole])

  const initializeVenues = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "venues"))
      const venuesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      if (venuesData.length === 0) {
        await autoInitializeVenues()
      } else {
        setVenues(venuesData)
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
      toast.error("Gagal memuat data venue")
    }
    setLoading(false)
  }

  const autoInitializeVenues = async () => {
    try {
      const addPromises = defaultVenues.map(async (venue) => {
        const venueData = {
          ...venue,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return await addDoc(collection(db, "venues"), venueData)
      })

      await Promise.all(addPromises)
      toast.success(`${defaultVenues.length} venue berhasil ditambahkan!`)
      await initializeVenues()
    } catch (error) {
      console.error("Error auto-initializing venues:", error)
      toast.error("Gagal menginisialisasi venue default")
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const venueData = {
        ...formData,
        capacity: Number.parseInt(formData.capacity),
        price: Number.parseInt(formData.price),
        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        updatedAt: new Date(),
      }

      if (editingVenue) {
        await updateDoc(doc(db, "venues", editingVenue.id), venueData)
        toast.success("Venue berhasil diperbarui!")
      } else {
        venueData.createdAt = new Date()
        await addDoc(collection(db, "venues"), venueData)
        toast.success("Venue berhasil ditambahkan!")
      }

      resetForm()
      await initializeVenues()
    } catch (error) {
      console.error("Error saving venue:", error)
      toast.error("Gagal menyimpan venue")
    }
    setLoading(false)
  }

  const handleEdit = (venue) => {
    setEditingVenue(venue)
    setFormData({
      name: venue.name,
      category: venue.category,
      capacity: venue.capacity.toString(),
      price: venue.price.toString(),
      description: venue.description,
      amenities: Array.isArray(venue.amenities) ? venue.amenities.join(", ") : "",
      imageUrl: venue.imageUrl || "",
      available: venue.available,
    })
    setShowAddModal(true)
  }

  const handleDelete = async (venueId) => {
    if (window.confirm("Yakin ingin menghapus venue ini?")) {
      try {
        await deleteDoc(doc(db, "venues", venueId))
        toast.success("Venue berhasil dihapus!")
        await initializeVenues()
      } catch (error) {
        console.error("Error deleting venue:", error)
        toast.error("Gagal menghapus venue")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "meeting",
      capacity: "",
      price: "",
      description: "",
      amenities: "",
      imageUrl: "",
      available: true,
    })
    setEditingVenue(null)
    setShowAddModal(false)
  }

  const getCategoryName = (category) => {
    const names = {
      ballroom: "Ballroom",
      meeting: "Meeting Room",
      outdoor: "Outdoor Venue",
    }
    return names[category] || "Meeting Room"
  }

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mobile-safe-area">
        <div className="text-center p-6 mobile-p-6">
          <h2 className="text-2xl mobile-text-xl font-bold text-gray-900 mb-4 mobile-mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 text-base mobile-text-base">Anda tidak memiliki akses ke manajemen venue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mobile-space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mobile-space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mobile-touch-target"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl mobile-text-xl font-bold text-gray-900">Manajemen Venue</h2>
            <p className="text-gray-600 mobile-text-sm">Kelola venue hotel dan fasilitas</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 mobile-px-4 mobile-py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 mobile-space-x-2 font-semibold mobile-button"
        >
          <FaPlus className="mobile-icon-sm" />
          <span>Tambah Venue</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 mobile-loading">
          <FaSpinner className="animate-spin text-4xl mobile-text-2xl text-blue-500" />
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12 mobile-py-6">
          <FaBuilding className="text-6xl mobile-text-2xl text-gray-300 mx-auto mb-4 mobile-mb-4" />
          <h3 className="text-xl mobile-text-lg font-semibold text-gray-900 mb-2">Belum Ada Venue</h3>
          <p className="text-gray-600 mb-6 mobile-mb-6 text-base mobile-text-base">
            Tambahkan venue pertama untuk hotel Anda
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-6 py-3 mobile-px-6 mobile-py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold mobile-button"
          >
            Tambah Venue Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mobile-card-grid">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 mobile-card"
            >
              <div className="relative aspect-video mobile-image-video bg-gradient-to-br from-gray-100 to-blue-100">
                <img
                  src={venue.imageUrl || "/placeholder.svg"}
                  alt={venue.name}
                  className="w-full h-full object-cover mobile-image"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"
                  }}
                />
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
              </div>

              <div className="p-4 mobile-p-4">
                <div className="space-y-3 mobile-space-y-3">
                  <div>
                    <h3 className="text-lg mobile-text-lg font-bold text-gray-900 mb-1">{venue.name}</h3>
                    <p className="text-gray-600 text-sm mobile-text-sm line-clamp-2">{venue.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mobile-grid-2">
                    <div className="bg-blue-50 p-2 mobile-p-2 rounded-lg">
                      <div className="flex items-center text-blue-700 mb-1">
                        <FaUsers className="mr-1 text-blue-600 mobile-icon-sm" />
                        <span className="font-semibold text-xs mobile-text-xs">Kapasitas</span>
                      </div>
                      <div className="text-gray-900 font-medium text-sm mobile-text-sm">{venue.capacity} orang</div>
                    </div>

                    <div className="bg-green-50 p-2 mobile-p-2 rounded-lg">
                      <div className="flex items-center text-green-700 mb-1">
                        <FaMoneyBillWave className="mr-1 text-green-600 mobile-icon-sm" />
                        <span className="font-semibold text-xs mobile-text-xs">Harga</span>
                      </div>
                      <div className="text-gray-900 font-medium text-sm mobile-text-sm">
                        Rp {venue.price?.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
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

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(venue)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 mobile-px-3 mobile-py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 mobile-space-x-1 font-medium text-sm mobile-text-sm mobile-button"
                    >
                      <FaEdit className="mobile-icon-sm" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(venue.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 mobile-px-3 mobile-py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1 mobile-space-x-1 font-medium text-sm mobile-text-sm mobile-button"
                    >
                      <FaTrash className="mobile-icon-sm" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-0 z-50 overflow-y-auto">
          <div className="bg-white w-full min-h-screen sm:min-h-0 sm:max-w-2xl sm:mx-4 sm:my-4 sm:rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex flex-col h-full sm:h-auto">
              <div className="bg-white border-b border-gray-200 p-4 mobile-p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg mobile-text-lg font-bold text-gray-900">
                    {editingVenue ? "Edit Venue" : "Tambah Venue Baru"}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors mobile-touch-target"
                  >
                    <FaTimes className="text-gray-600 mobile-icon-sm" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 mobile-p-4 mobile-scroll">
                <form onSubmit={handleSubmit} className="space-y-4 mobile-space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="mobile-form-group">
                      <label className="block text-sm mobile-text-sm font-medium text-gray-700 mb-1 mobile-form-label">
                        Nama Venue
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 mobile-form-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="mobile-form-group">
                      <label className="block text-sm mobile-text-sm font-medium text-gray-700 mb-1 mobile-form-label">
                        Kategori
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 mobile-form-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="meeting">Meeting Room</option>
                        <option value="ballroom">Ballroom</option>
                        <option value="outdoor">Outdoor Venue</option>
                      </select>
                    </div>

                    <div className="mobile-form-group">
                      <label className="block text-sm mobile-text-sm font-medium text-gray-700 mb-1 mobile-form-label">
                        Kapasitas
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 mobile-form-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="mobile-form-group">
                      <label className="block text-sm mobile-text-sm font-medium text-gray-700 mb-1 mobile-form-label">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 mobile-form-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mobile-form-group">
                    <label className="block text-sm mobile-text-sm font-medium text-gray-700 mb-1 mobile-form-label">
                      URL Gambar
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mobile-form-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="mobile-form-group">
                    <label className="block text-sm mobile-text-sm font-medium text-gray-700 mb-1 mobile-form-label">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 mobile-form-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mobile-form-group">
                    <label className="block text-sm mobile-text-sm font-medium text-gray-700 mb-1 mobile-form-label">
                      Fasilitas (pisahkan dengan koma)
                    </label>
                    <textarea
                      name="amenities"
                      value={formData.amenities}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 mobile-form-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="WiFi, AC, Proyektor, Sound System"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="mr-2 mobile-touch-target"
                    />
                    <label className="text-sm mobile-text-sm font-medium text-gray-700">Venue tersedia</label>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 border-t border-gray-200 p-4 mobile-p-4 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 mobile-px-4 mobile-py-3 rounded-xl hover:bg-gray-300 transition-colors font-semibold mobile-button"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white px-4 py-3 mobile-px-4 mobile-py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 mobile-space-x-2 font-semibold mobile-button"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin mobile-icon-sm" />
                    ) : (
                      <FaSave className="mobile-icon-sm" />
                    )}
                    <span>{editingVenue ? "Perbarui" : "Simpan"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenueManagement