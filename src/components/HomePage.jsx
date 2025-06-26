"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useBackButton } from "../hooks/UseBackButton.js"
import VenueCard from "./VenueCard"
import VenueDetailModal from "./VenueDetailModal"
import BookingForm from "./BookingForm.jsx"
import { FaSearch } from "react-icons/fa"
import toast from "react-hot-toast"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "../config/firebase"
import MyBookings from "./MyBookings"
import CalendarDashboard from "./CalendarDashboard"

const HomePage = () => {
  const { currentUser, userRole } = useAuth()
  const [venues, setVenues] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState(userRole === "admin" ? "admin" : "beranda")
  const [userBookings, setUserBookings] = useState([])
  const [venueToBook, setVenueToBook] = useState(null)

  const kingRoyalVenues = [
    {
      docId: "santorini-ballroom",
      id: "santorini-ballroom",
      name: "Santorini Ballroom",
      category: "ballroom",
      capacity: 250,
      price: 5000000,
      description: "Ballroom mewah dengan kapasitas besar, dilengkapi dengan fasilitas premium untuk acara pernikahan, gala dinner, dan event besar lainnya.",
      amenities: ["Sound System Premium", "Lighting Professional", "AC Central", "Catering Kitchen", "WiFi High Speed", "Proyektor 4K", "Stage Besar", "Chandelier Kristal", "Lantai Marmer", "Backdrop LED"],
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1464366400600-48f60103fc96?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop"
      ],
      available: true,
      rating: 4.9,
      reviews: 127,
      setupOptions: [
        { type: "clash-room", capacity: 175, label: "Clash Room - 175 pax" },
        { type: "round", capacity: 125, label: "Round Table - 125 pax" },
        { type: "theater", capacity: 250, label: "Theater Style - 250 pax" }
      ],
    },
    {
      docId: "venice-meeting-room",
      id: "venice-meeting-room",
      name: "Venice Meeting Room",
      category: "meeting",
      capacity: 35,
      price: 2000000,
      description: "Ruang meeting modern dengan teknologi terdepan, ideal untuk presentasi bisnis, workshop, dan meeting corporate.",
      amenities: ["Smart TV 65 inch", "Video Conference", "Whiteboard Digital", "AC", "WiFi Gratis", "Coffee Station", "Ergonomic Chairs", "Wireless Presentation", "Flipchart"],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=500&h=300&fit=crop"
      ],
      available: true,
      rating: 4.8,
      reviews: 89,
      setupOptions: [
        { type: "clash-room", capacity: 25, label: "Clash Room - 25 pax" },
        { type: "u-shape", capacity: 20, label: "U Shape - 20 pax" },
        { type: "round", capacity: 10, label: "Round Table - 10 pax" },
        { type: "theater", capacity: 35, label: "Theater Style - 35 pax" }
      ],
    },
    {
      docId: "swimming-pool-area",
      id: "swimming-pool-area",
      name: "Swimming Pool Area",
      category: "outdoor",
      capacity: 125,
      price: 3000000,
      description: "Area kolam renang yang sempurna untuk acara outdoor, pool party, dan gathering santai.",
      amenities: ["Pool Access", "Outdoor Seating", "BBQ Area", "Sound System Outdoor", "Lighting", "Gazebo", "Pool Deck", "Lounge Chairs", "Umbrella Tables", "Poolside Bar"],
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"
      ],
      available: true,
      rating: 4.8,
      reviews: 92,
      setupOptions: [
        { type: "u-shape", capacity: 20, label: "U Shape - 20 pax" },
        { type: "round-large", capacity: 125, label: "Round Large - 125 pax" },
        { type: "round-small", capacity: 25, label: "Round Small - 25 pax" },
        { type: "cocktail", capacity: 10, label: "Cocktail Setup - 10 pax" }
      ],
    }
  ]

  useBackButton(() => {
    if (showDetailModal) {
      setShowDetailModal(false)
    } else if (venueToBook) {
      setVenueToBook(null)
    } else if (activeTab !== "beranda") {
      setActiveTab("beranda")
    }
  })

  const fetchUserBookings = async () => {
    if (!currentUser) return

    try {
      const q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const bookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUserBookings(bookingsData)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Gagal memuat data reservasi")
    }
  }

  useEffect(() => {
    setVenues(kingRoyalVenues)
    setLoading(false)
    if (currentUser) fetchUserBookings()
  }, [currentUser])

  useEffect(() => {
    filterVenues()
  }, [venues, selectedCategory, searchTerm, userBookings])

  const filterVenues = () => {
    let filtered = venues

    if (selectedCategory !== "all") {
      filtered = filtered.filter((venue) => venue.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (venue) =>
          venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered = filtered.map((venue) => {
      const venueBooking = userBookings.find((booking) => booking.venueId === venue.id)
      return {
        ...venue,
        bookingStatus: venueBooking?.status || null,
        bookingDate: venueBooking?.eventDate || null,
      }
    })

    setFilteredVenues(filtered)
  }

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue)
    setShowDetailModal(true)
  }

  const handleBookVenue = (venue) => {
    if (userRole === "admin") {
      toast.error("Admin tidak dapat melakukan pemesanan")
      return
    }
    setVenueToBook(venue)
  }

  const handleTabChange = (tab) => {
    if (tab === "reservasi" && !currentUser) {
      toast.error("Anda perlu login untuk melihat reservasi")
      return
    }
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {venueToBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BookingForm
              selectedRoom={venueToBook}
              onSuccess={() => {
                setVenueToBook(null)
                setActiveTab("reservasi")
                fetchUserBookings()
              }}
              onCancel={() => setVenueToBook(null)}
              onNavigateHome={() => {
                setVenueToBook(null)
                setActiveTab("beranda")
              }}
            />
          </div>
        </div>
      )}

      {userRole !== "admin" && (
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => handleTabChange("beranda")}
                  className={`px-4 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "beranda" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Beranda
                </button>
                {currentUser && userRole === "customer" && (
                  <>
                    <button
                      onClick={() => handleTabChange("reservasi")}
                      className={`px-4 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeTab === "reservasi" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Reservasi Saya
                    </button>
                    <button
                      onClick={() => handleTabChange("kalender")}
                      className={`px-4 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeTab === "kalender" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Kalender
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "beranda" || userRole === "admin") && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="relative max-w-md mx-auto mb-6">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-md md:max-w-full">
                  <div className="hidden md:flex justify-center gap-2 mb-4">
                    {["all", "ballroom", "meeting", "outdoor"].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap border ${
                          selectedCategory === category
                            ? "bg-blue-500 text-white border-blue-500"
                            : "text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {category === "all" ? "Semua Venue" : 
                         category === "ballroom" ? "Ballroom" :
                         category === "meeting" ? "Meeting Room" : "Outdoor"}
                      </button>
                    ))}
                  </div>

                  <div className="md:hidden overflow-x-auto pb-2">
                    <div className="flex gap-2 w-max px-4">
                      {["all", "ballroom", "meeting", "outdoor"].map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap border flex-shrink-0 ${
                            selectedCategory === category
                              ? "bg-blue-500 text-white border-blue-500"
                              : "text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {category === "all" ? "Semua Venue" : 
                           category === "ballroom" ? "Ballroom" :
                           category === "meeting" ? "Meeting Room" : "Outdoor"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.docId || venue.id}
                  venue={venue}
                  onBook={handleBookVenue}
                  onViewDetails={handleViewDetails}
                  userRole={userRole}
                  bookingStatus={venue.bookingStatus}
                  bookingDate={venue.bookingDate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak Ada Venue Ditemukan</h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `Tidak ada venue yang sesuai dengan pencarian "${searchTerm}".`
                  : "Tidak ada venue yang sesuai dengan filter yang dipilih."}
              </p>
            </div>
          )}

          <VenueDetailModal
            venue={selectedVenue}
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            onBook={handleBookVenue}
            userRole={userRole}
            bookingStatus={selectedVenue?.bookingStatus}
          />
        </div>
      )}

      {activeTab === "reservasi" && userRole === "customer" && <MyBookings />}
      {activeTab === "kalender" && userRole === "customer" && <CalendarDashboard userRole={userRole} />}
    </div>
  )
}

export default HomePage