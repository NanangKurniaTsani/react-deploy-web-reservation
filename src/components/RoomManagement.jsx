"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../config/firebase"
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaUsers, FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"

const RoomManagement = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "standard",
    capacity: "",
    price: "",
    description: "",
    amenities: "",
    imageUrl: "",
  })

  // Room categories with proper labels
  const roomCategories = [
    { value: "standard", label: "Standard Room" },
    { value: "deluxe", label: "Deluxe Room" },
    { value: "suite", label: "Suite Room" },
    { value: "presidential", label: "Presidential Suite" },
    { value: "ballroom", label: "Ballroom" },
    { value: "meeting", label: "Meeting Room" },
    { value: "conference", label: "Conference Hall" },
    { value: "banquet", label: "Banquet Hall" },
  ]

  useEffect(() => {
    fetchRooms()
  }, [])

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
      toast.error("Gagal memuat data kamar")
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const roomData = {
        id: formData.id,
        name: formData.name,
        category: formData.category,
        capacity: Number.parseInt(formData.capacity),
        price: Number.parseInt(formData.price),
        description: formData.description,
        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
        imageUrl: formData.imageUrl || "/placeholder.svg?height=200&width=300",
        updatedAt: new Date(),
      }

      if (editingRoom) {
        await updateDoc(doc(db, "rooms", editingRoom.docId), roomData)
        toast.success("Kamar berhasil diperbarui!")
      } else {
        await addDoc(collection(db, "rooms"), {
          ...roomData,
          createdAt: new Date(),
        })
        toast.success("Kamar berhasil ditambahkan!")
      }

      setShowModal(false)
      setEditingRoom(null)
      resetForm()
      fetchRooms()
    } catch (error) {
      console.error("Error saving room:", error)
      toast.error("Gagal menyimpan kamar")
    }
    setSubmitting(false)
  }

  const handleEdit = (room) => {
    setEditingRoom(room)
    setFormData({
      id: room.id,
      name: room.name,
      category: room.category || "standard",
      capacity: room.capacity.toString(),
      price: room.price.toString(),
      description: room.description || "",
      amenities: room.amenities ? room.amenities.join(", ") : "",
      imageUrl: room.imageUrl || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (room) => {
    if (window.confirm(`Yakin ingin menghapus kamar ${room.name}?`)) {
      try {
        await deleteDoc(doc(db, "rooms", room.docId))
        toast.success("Kamar berhasil dihapus!")
        fetchRooms()
      } catch (error) {
        console.error("Error deleting room:", error)
        toast.error("Gagal menghapus kamar")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      category: "standard",
      capacity: "",
      price: "",
      description: "",
      amenities: "",
      imageUrl: "",
    })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRoom(null)
    resetForm()
  }

  const getCategoryLabel = (category) => {
    const cat = roomCategories.find((c) => c.value === category)
    return cat ? cat.label : category
  }

  const getCategoryColor = (category) => {
    const colors = {
      standard: "bg-gray-100 text-gray-700",
      deluxe: "bg-blue-100 text-blue-700",
      suite: "bg-purple-100 text-purple-700",
      presidential: "bg-yellow-100 text-yellow-700",
      ballroom: "bg-pink-100 text-pink-700",
      meeting: "bg-green-100 text-green-700",
      conference: "bg-indigo-100 text-indigo-700",
      banquet: "bg-red-100 text-red-700",
    }
    return colors[category] || colors.standard
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manajemen Kamar</h2>
          <p className="text-gray-600 text-sm mt-1">Kelola kamar dan fasilitas hotel</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
        >
          <FaPlus className="text-sm" />
          <span>Tambah Kamar</span>
        </button>
      </div>

      {/* Room Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {roomCategories.map((category) => (
          <div
            key={category.value}
            className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.value)}`}
          >
            {category.label}
          </div>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.docId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Image */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center overflow-hidden">
              {room.imageUrl && room.imageUrl !== "/placeholder.svg?height=200&width=300" ? (
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
                <FaImage className="text-gray-400 text-2xl mx-auto mb-2" />
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(room.category)}`}
                  >
                    {getCategoryLabel(room.category)}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(room)}
                    className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
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
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Kamar</h3>
          <p className="text-gray-500">Tambahkan kamar pertama untuk memulai.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editingRoom ? "Edit Kamar" : "Tambah Kamar"}</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Kamar *</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ballroom-a"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kamar *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ballroom A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Kamar *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {roomCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas *</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga per Hari *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Gambar</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Deskripsi kamar dan fasilitas yang tersedia..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AC, Proyektor, Sound System, WiFi (pisahkan dengan koma)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  <span>{submitting ? "Menyimpan..." : "Simpan"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomManagement
