"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
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
      description:
        "Ballroom mewah dengan kapasitas besar, dilengkapi dengan fasilitas premium untuk acara pernikahan, gala dinner, dan event besar lainnya.",
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
      description:
        "Ruang meeting modern dengan teknologi terdepan, ideal untuk presentasi bisnis, workshop, dan meeting corporate.",
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
      const fetchAllData = async () => {
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

      fetchAllData()
    }
  }, [userRole])

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

      // Refresh data after initialization
      const querySnapshot = await getDocs(collection(db, "venues"))
      const venuesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setVenues(venuesData)
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

      // Refresh data after save
      const querySnapshot = await getDocs(collection(db, "venues"))
      const venuesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setVenues(venuesData)
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

        // Refresh data after delete
        const querySnapshot = await getDocs(collection(db, "venues"))
        const venuesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setVenues(venuesData)
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
      <div className="venue-management-access venue-management-access-container venue-management-access-responsive min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="venue-management-access-content venue-management-access-content-responsive text-center p-4 sm:p-6">
          <h2 className="venue-management-access-title venue-management-access-title-responsive text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h2>
          <p className="venue-management-access-text venue-management-access-text-responsive text-gray-600 text-sm sm:text-base">
            Anda tidak memiliki akses ke manajemen venue.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="venue-management venue-management-container venue-management-responsive space-y-4 sm:space-y-6">
      <div className="venue-management-header venue-management-header-container venue-management-header-responsive flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="venue-management-title venue-management-title-container venue-management-title-responsive flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="venue-management-back venue-management-back-responsive p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="venue-management-heading venue-management-heading-responsive text-xl sm:text-2xl font-bold text-gray-900">
              Manajemen Venue
            </h2>
            <p className="venue-management-subtitle venue-management-subtitle-responsive text-gray-600 text-xs sm:text-sm">
              Kelola venue hotel dan fasilitas
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="venue-management-add venue-management-add-responsive bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 font-semibold text-sm sm:text-base active:scale-95"
        >
          <FaPlus className="text-xs sm:text-sm" />
          <span>Tambah Venue</span>
        </button>
      </div>

      {loading ? (
        <div className="venue-management-loading venue-management-loading-container venue-management-loading-responsive flex items-center justify-center py-8 sm:py-12">
          <FaSpinner className="animate-spin text-2xl sm:text-4xl text-blue-500" />
        </div>
      ) : venues.length === 0 ? (
        <div className="venue-management-empty venue-management-empty-container venue-management-empty-responsive text-center py-8 sm:py-12">
          <FaBuilding className="venue-management-empty-icon venue-management-empty-icon-responsive text-4xl sm:text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="venue-management-empty-title venue-management-empty-title-responsive text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Belum Ada Venue
          </h3>
          <p className="venue-management-empty-text venue-management-empty-text-responsive text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Tambahkan venue pertama untuk hotel Anda
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="venue-management-empty-button venue-management-empty-button-responsive bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold text-sm sm:text-base active:scale-95"
          >
            Tambah Venue Pertama
          </button>
        </div>
      ) : (
        <div className="venue-management-grid venue-management-grid-container venue-management-grid-responsive grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getCategoryName={getCategoryName}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <VenueModal
          editingVenue={editingVenue}
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />
      )}
    </div>
  )
}

// Separate VenueCard component for better organization
const VenueCard = ({ venue, onEdit, onDelete, getCategoryName }) => (
  <div className="venue-management-card venue-management-card-container venue-management-card-responsive bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
    <div className="venue-management-card-image venue-management-card-image-container venue-management-card-image-responsive relative aspect-video bg-gradient-to-br from-gray-100 to-blue-100">
      <img
        src={venue.imageUrl || "/placeholder.svg"}
        alt={venue.name}
        className="venue-management-card-img venue-management-card-img-responsive w-full h-full object-cover"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"
        }}
      />
      <div className="venue-management-card-status venue-management-card-status-responsive absolute top-2 left-2">
        <span
          className={`venue-management-status-badge venue-management-status-badge-responsive px-2 py-1 rounded-full text-xs font-medium ${
            venue.available ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
          }`}
        >
          {venue.available ? "Tersedia" : "Tidak Tersedia"}
        </span>
      </div>
      <div className="venue-management-card-category venue-management-card-category-responsive absolute top-2 right-2">
        <span className="venue-management-category-badge venue-management-category-badge-responsive bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {getCategoryName(venue.category)}
        </span>
      </div>
    </div>

    <div className="venue-management-card-content venue-management-card-content-container venue-management-card-content-responsive p-4">
      <div className="venue-management-card-info venue-management-card-info-container venue-management-card-info-responsive space-y-3">
        <div>
          <h3 className="venue-management-card-name venue-management-card-name-responsive text-base sm:text-lg font-bold text-gray-900 mb-1">
            {venue.name}
          </h3>
          <p className="venue-management-card-description venue-management-card-description-responsive text-gray-600 text-xs sm:text-sm line-clamp-2">
            {venue.description}
          </p>
        </div>

        <div className="venue-management-card-stats venue-management-card-stats-container venue-management-card-stats-responsive grid grid-cols-2 gap-2">
          <div className="venue-management-card-stat venue-management-card-stat-responsive bg-blue-50 p-2 rounded-lg">
            <div className="venue-management-stat-header venue-management-stat-header-responsive flex items-center text-blue-700 mb-1">
              <FaUsers className="mr-1 text-blue-600 text-xs" />
              <span className="font-semibold text-xs">Kapasitas</span>
            </div>
            <div className="venue-management-stat-value venue-management-stat-value-responsive text-gray-900 font-medium text-xs sm:text-sm">
              {venue.capacity} orang
            </div>
          </div>

          <div className="venue-management-card-stat venue-management-card-stat-responsive bg-green-50 p-2 rounded-lg">
            <div className="venue-management-stat-header venue-management-stat-header-responsive flex items-center text-green-700 mb-1">
              <FaMoneyBillWave className="mr-1 text-green-600 text-xs" />
              <span className="font-semibold text-xs">Harga</span>
            </div>
            <div className="venue-management-stat-value venue-management-stat-value-responsive text-gray-900 font-medium text-xs sm:text-sm">
              Rp {venue.price?.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {venue.amenities && venue.amenities.length > 0 && (
          <div className="venue-management-card-amenities venue-management-card-amenities-container venue-management-card-amenities-responsive flex flex-wrap gap-1">
            {venue.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="venue-management-amenity venue-management-amenity-responsive bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="venue-management-amenity-more venue-management-amenity-more-responsive text-blue-600 text-xs font-semibold">
                +{venue.amenities.length - 3} lainnya
              </span>
            )}
          </div>
        )}

        <div className="venue-management-card-actions venue-management-card-actions-container venue-management-card-actions-responsive flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onEdit(venue)}
            className="venue-management-edit venue-management-edit-responsive flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 font-medium text-xs sm:text-sm active:scale-95"
          >
            <FaEdit className="text-xs" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(venue.id)}
            className="venue-management-delete venue-management-delete-responsive flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1 font-medium text-xs sm:text-sm active:scale-95"
          >
            <FaTrash className="text-xs" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  </div>
)

// Separate VenueModal component for better organization
const VenueModal = ({ editingVenue, formData, loading, onInputChange, onSubmit, onClose }) => (
  <div className="venue-management-modal venue-management-modal-overlay venue-management-modal-responsive fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-0 z-50 overflow-y-auto">
    <div className="venue-management-modal-container venue-management-modal-container-responsive bg-white w-full min-h-screen sm:min-h-0 sm:max-w-2xl sm:mx-4 sm:my-4 sm:rounded-2xl overflow-hidden shadow-2xl">
      <div className="venue-management-modal-content venue-management-modal-content-responsive flex flex-col h-full sm:h-auto">
        <div className="venue-management-modal-header venue-management-modal-header-container venue-management-modal-header-responsive bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="venue-management-modal-title venue-management-modal-title-responsive flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {editingVenue ? "Edit Venue" : "Tambah Venue Baru"}
            </h3>
            <button
              onClick={onClose}
              className="venue-management-modal-close venue-management-modal-close-responsive w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors active:scale-95"
            >
              <FaTimes className="text-gray-600 text-xs sm:text-sm" />
            </button>
          </div>
        </div>

        <div className="venue-management-modal-body venue-management-modal-body-container venue-management-modal-body-responsive flex-1 overflow-y-auto p-4">
          <form onSubmit={onSubmit} className="venue-management-form venue-management-form-responsive space-y-4">
            <div className="venue-management-form-grid venue-management-form-grid-responsive grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="venue-management-form-group venue-management-form-group-responsive">
                <label className="venue-management-form-label venue-management-form-label-responsive block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nama Venue
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  className="venue-management-form-input venue-management-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div className="venue-management-form-group venue-management-form-group-responsive">
                <label className="venue-management-form-label venue-management-form-label-responsive block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                  className="venue-management-form-select venue-management-form-select-responsive w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="meeting">Meeting Room</option>
                  <option value="ballroom">Ballroom</option>
                  <option value="outdoor">Outdoor Venue</option>
                </select>
              </div>

              <div className="venue-management-form-group venue-management-form-group-responsive">
                <label className="venue-management-form-label venue-management-form-label-responsive block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Kapasitas
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={onInputChange}
                  className="venue-management-form-input venue-management-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div className="venue-management-form-group venue-management-form-group-responsive">
                <label className="venue-management-form-label venue-management-form-label-responsive block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={onInputChange}
                  className="venue-management-form-input venue-management-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="venue-management-form-group venue-management-form-group-responsive">
              <label className="venue-management-form-label venue-management-form-label-responsive block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                URL Gambar
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={onInputChange}
                className="venue-management-form-input venue-management-form-input-responsive w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="venue-management-form-group venue-management-form-group-responsive">
              <label className="venue-management-form-label venue-management-form-label-responsive block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows="3"
                className="venue-management-form-textarea venue-management-form-textarea-responsive w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div className="venue-management-form-group venue-management-form-group-responsive">
              <label className="venue-management-form-label venue-management-form-label-responsive block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Fasilitas (pisahkan dengan koma)
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={onInputChange}
                rows="2"
                className="venue-management-form-textarea venue-management-form-textarea-responsive w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="WiFi, AC, Proyektor, Sound System"
              />
            </div>

            <div className="venue-management-form-checkbox venue-management-form-checkbox-responsive flex items-center">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={onInputChange}
                className="venue-management-checkbox venue-management-checkbox-responsive mr-2"
              />
              <label className="venue-management-checkbox-label venue-management-checkbox-label-responsive text-xs sm:text-sm font-medium text-gray-700">
                Venue tersedia
              </label>
            </div>
          </form>
        </div>

        <div className="venue-management-modal-footer venue-management-modal-footer-container venue-management-modal-footer-responsive bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
          <div className="venue-management-modal-actions venue-management-modal-actions-responsive flex gap-3">
            <button
              onClick={onClose}
              className="venue-management-cancel venue-management-cancel-responsive flex-1 bg-gray-200 text-gray-800 px-4 py-2 sm:py-3 rounded-xl hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base active:scale-95"
            >
              Batal
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="venue-management-save venue-management-save-responsive flex-1 bg-blue-500 text-white px-4 py-2 sm:py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base active:scale-95"
            >
              {loading ? (
                <FaSpinner className="animate-spin text-xs sm:text-sm" />
              ) : (
                <FaSave className="text-xs sm:text-sm" />
              )}
              <span>{editingVenue ? "Perbarui" : "Simpan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// PropTypes for VenueCard
VenueCard.propTypes = {
  venue: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    amenities: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    available: PropTypes.bool.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  getCategoryName: PropTypes.func.isRequired,
}

// PropTypes for VenueModal
VenueModal.propTypes = {
  editingVenue: PropTypes.object,
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    capacity: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amenities: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    available: PropTypes.bool.isRequired,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default VenueManagement
