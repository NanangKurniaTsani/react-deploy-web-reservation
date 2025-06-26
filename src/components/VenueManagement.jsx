"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore"
import { db } from "../config/firebase"
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaDatabase, FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"

const VenueManagement = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [seedingData, setSeedingData] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "meeting",
    capacity: 50,
    price: 1000000,
    description: "",
    amenities: [],
    imageUrl: "",
    images: [],
    available: true,
    rating: 4.5,
    reviews: 0,
  })

  // Data hardcoded untuk di-seed ke database
  const sampleVenues = [
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
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
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
      imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
      images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop"],
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
      imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500&h=300&fit=crop",
      images: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500&h=300&fit=crop"],
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
      imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop",
      images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop"],
      available: true,
      rating: 4.7,
      reviews: 56,
      setupOptions: [
        { type: "garden", capacity: 50, label: "Garden Style - 50 pax" },
        { type: "cocktail", capacity: 30, label: "Cocktail Setup - 30 pax" },
      ],
    },
  ]

  // Setup real-time listener for venues
  useEffect(() => {
    console.log("VenueManagement: Setting up venues listener...")
    const venuesRef = collection(db, "venues")

    const unsubscribe = onSnapshot(
      venuesRef,
      (snapshot) => {
        console.log("VenueManagement: Venues snapshot received, docs count:", snapshot.docs.length)

        const venuesFromDB = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            docId: doc.id,
            ...data,
          }
        })

        console.log("VenueManagement: Processed venues:", venuesFromDB)
        setVenues(venuesFromDB)
        setLoading(false)
      },
      (error) => {
        console.error("VenueManagement: Error in venues listener:", error)
        toast.error("Gagal memuat data venue")
        setLoading(false)
      },
    )

    return () => {
      console.log("VenueManagement: Cleaning up venues listener")
      unsubscribe()
    }
  }, [])

  // Function to seed sample data to database
  const seedSampleData = async () => {
    if (!confirm("Apakah Anda yakin ingin menambahkan data sample venue ke database?")) return

    setSeedingData(true)
    try {
      console.log("Seeding sample venues to database...")

      const batch = writeBatch(db)
      const venuesRef = collection(db, "venues")

      for (const venue of sampleVenues) {
        const venueData = {
          ...venue,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const docRef = doc(venuesRef)
        batch.set(docRef, venueData)
      }

      await batch.commit()
      toast.success(`Berhasil menambahkan ${sampleVenues.length} venue sample ke database!`)
      console.log("Sample venues seeded successfully")
    } catch (error) {
      console.error("Error seeding sample data:", error)
      toast.error("Gagal menambahkan data sample")
    } finally {
      setSeedingData(false)
    }
  }

  const handleAddVenue = async (e) => {
    e.preventDefault()
    try {
      console.log("Adding new venue:", formData)

      const venueData = {
        ...formData,
        amenities: formData.amenities.filter((a) => a.trim() !== ""),
        images: formData.images.filter((img) => img.trim() !== ""),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "venues"), venueData)
      toast.success("Venue berhasil ditambahkan!")

      // Reset form
      setFormData({
        name: "",
        category: "meeting",
        capacity: 50,
        price: 1000000,
        description: "",
        amenities: [],
        imageUrl: "",
        images: [],
        available: true,
        rating: 4.5,
        reviews: 0,
      })
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding venue:", error)
      toast.error("Gagal menambahkan venue")
    }
  }

  const handleEditVenue = async (e) => {
    e.preventDefault()
    if (!editingVenue) return

    try {
      console.log("Updating venue:", editingVenue.id, formData)

      const venueData = {
        ...formData,
        amenities: formData.amenities.filter((a) => a.trim() !== ""),
        images: formData.images.filter((img) => img.trim() !== ""),
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "venues", editingVenue.id), venueData)
      toast.success("Venue berhasil diupdate!")
      setEditingVenue(null)
      setFormData({
        name: "",
        category: "meeting",
        capacity: 50,
        price: 1000000,
        description: "",
        amenities: [],
        imageUrl: "",
        images: [],
        available: true,
        rating: 4.5,
        reviews: 0,
      })
    } catch (error) {
      console.error("Error updating venue:", error)
      toast.error("Gagal mengupdate venue")
    }
  }

  const handleDeleteVenue = async (venueId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus venue ini?")) return

    try {
      console.log("Deleting venue:", venueId)
      await deleteDoc(doc(db, "venues", venueId))
      toast.success("Venue berhasil dihapus!")
    } catch (error) {
      console.error("Error deleting venue:", error)
      toast.error("Gagal menghapus venue")
    }
  }

  const startEdit = (venue) => {
    setEditingVenue(venue)
    setFormData({
      name: venue.name || "",
      category: venue.category || "meeting",
      capacity: venue.capacity || 50,
      price: venue.price || 1000000,
      description: venue.description || "",
      amenities: venue.amenities || [],
      imageUrl: venue.imageUrl || "",
      images: venue.images || [],
      available: venue.available !== undefined ? venue.available : true,
      rating: venue.rating || 4.5,
      reviews: venue.reviews || 0,
    })
  }

  const cancelEdit = () => {
    setEditingVenue(null)
    setShowAddForm(false)
    setFormData({
      name: "",
      category: "meeting",
      capacity: 50,
      price: 1000000,
      description: "",
      amenities: [],
      imageUrl: "",
      images: [],
      available: true,
      rating: 4.5,
      reviews: 0,
    })
  }

  const handleAmenityChange = (index, value) => {
    const newAmenities = [...formData.amenities]
    newAmenities[index] = value
    setFormData({ ...formData, amenities: newAmenities })
  }

  const addAmenity = () => {
    setFormData({ ...formData, amenities: [...formData.amenities, ""] })
  }

  const removeAmenity = (index) => {
    const newAmenities = formData.amenities.filter((_, i) => i !== index)
    setFormData({ ...formData, amenities: newAmenities })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Venue Management</h2>
        <div className="flex space-x-3">
          {venues.length === 0 && (
            <button
              onClick={seedSampleData}
              disabled={seedingData}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {seedingData ? <FaSpinner className="animate-spin" /> : <FaDatabase />}
              <span>{seedingData ? "Menambahkan..." : "Tambah Data Sample"}</span>
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <FaPlus />
            <span>Tambah Venue</span>
          </button>
        </div>
      </div>

      {/* Info untuk data sample */}
      {venues.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaDatabase className="text-blue-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Database Kosong</h3>
              <p className="text-sm text-blue-600">
                Klik "Tambah Data Sample" untuk menambahkan 6 venue contoh ke database, atau "Tambah Venue" untuk
                menambah venue manual.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingVenue) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{editingVenue ? "Edit Venue" : "Tambah Venue Baru"}</h3>

          <form onSubmit={editingVenue ? handleEditVenue : handleAddVenue} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Venue</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meeting">Meeting Room</option>
                  <option value="ballroom">Ballroom</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar Utama</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas</label>
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={amenity}
                    onChange={(e) => handleAmenityChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama fasilitas"
                  />
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addAmenity} className="text-blue-500 hover:text-blue-700 text-sm">
                + Tambah Fasilitas
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="mr-2"
                />
                Tersedia
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <FaSave />
                <span>{editingVenue ? "Update" : "Simpan"}</span>
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <FaTimes />
                <span>Batal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Venues List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapasitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Belum ada venue. Klik "Tambah Data Sample" atau "Tambah Venue" untuk menambahkan venue.
                  </td>
                </tr>
              ) : (
                venues.map((venue) => (
                  <tr key={venue.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={venue.imageUrl || "/placeholder.svg"}
                            alt={venue.name}
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                          <div className="text-sm text-gray-500">{venue.description?.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {venue.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venue.capacity} orang</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {venue.price?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          venue.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {venue.available ? "Tersedia" : "Tidak Tersedia"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => startEdit(venue)} className="text-blue-600 hover:text-blue-900">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteVenue(venue.id)} className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VenueManagement
