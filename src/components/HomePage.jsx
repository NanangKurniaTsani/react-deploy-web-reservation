"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useBackButton } from "../hooks/UseBackButton.js"
import VenueCard from "./VenueCard"
import VenueDetailModal from "./VenueDetailModal"
import BookingForm from "./BookingForm"
import MyBookings from "./MyBookings"
import CalendarDashboard from "./CalendarDashboard"
import { FaSearch } from "react-icons/fa"
import toast from "react-hot-toast"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../config/firebase"

const HomePage = () => {
  const { currentUser, userRole } = useAuth()
  const [venues, setVenues] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [venueToBook, setVenueToBook] = useState(null)
  const [activeTab, setActiveTab] = useState("beranda")

  useBackButton(() => {
    if (showDetailModal) setShowDetailModal(false)
    else if (venueToBook) setVenueToBook(null)
    else if (activeTab !== "beranda") setActiveTab("beranda")
  })

  const setupVenuesListener = () => {
    try {
      const venuesRef = collection(db, "venues")
      return onSnapshot(venuesRef, (snapshot) => {
        const venuesFromDB = snapshot.docs.map((doc) => ({
          id: doc.id,
          docId: doc.id,
          name: doc.data().name || "Unnamed Venue",
          category: doc.data().category || "meeting",
          capacity: doc.data().capacity || 50,
          price: doc.data().price || 1000000,
          description: doc.data().description || "Venue description not available",
          available: doc.data().available !== undefined ? doc.data().available : true,
          rating: doc.data().rating || 4.5,
          reviews: doc.data().reviews || 0,
          amenities: doc.data().amenities || [],
          images: doc.data().images || [],
          imageUrl: doc.data().imageUrl || "",
        }))
        setVenues(venuesFromDB)
        setLoading(false)
      }, (error) => {
        console.error("Error in venues listener:", error)
        toast.error("Gagal memuat data venue")
        setVenues([])
        setLoading(false)
      })
    } catch (error) {
      console.error("Error setting up venues listener:", error)
      toast.error("Gagal menghubungkan ke database")
      setVenues([])
      setLoading(false)
      return null
    }
  }

  useEffect(() => {
    const unsubscribe = setupVenuesListener()
    return () => unsubscribe && unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = venues
    if (selectedCategory !== "all") filtered = filtered.filter(v => v.category === selectedCategory)
    if (searchTerm) filtered = filtered.filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVenues(filtered)
  }, [venues, selectedCategory, searchTerm])

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue)
    setShowDetailModal(true)
  }

  const handleBookVenue = (venue) => {
    if (userRole === "admin") return toast.error("Admin tidak dapat melakukan pemesanan")
    setVenueToBook(venue)
  }

  const handleTabChange = (tab) => {
    if (tab === "reservasi" && !currentUser) return toast.error("Anda perlu login untuk melihat reservasi")
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
                toast.success("Booking berhasil!")
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
              <div className="button-container">
                <div className="button-scroll-wrapper">
                  <button
                    onClick={() => handleTabChange("beranda")}
                    className={`nav-button ${activeTab === "beranda" ? "active" : "inactive"}`}
                  >
                    Beranda
                  </button>
                  {currentUser && userRole === "customer" && (
                    <>
                      <button
                        onClick={() => handleTabChange("reservasi")}
                        className={`nav-button ${activeTab === "reservasi" ? "active" : "inactive"}`}
                      >
                        Reservasi Saya
                      </button>
                      <button
                        onClick={() => handleTabChange("kalender")}
                        className={`nav-button ${activeTab === "kalender" ? "active" : "inactive"}`}
                      >
                        Kalender
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "beranda" || userRole === "admin") && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="button-container">
                <div className="button-scroll-wrapper">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`nav-button ${selectedCategory === "all" ? "active" : "inactive"}`}
                  >
                    Semua Venue
                  </button>
                  <button
                    onClick={() => setSelectedCategory("ballroom")}
                    className={`nav-button ${selectedCategory === "ballroom" ? "active" : "inactive"}`}
                  >
                    Ballroom
                  </button>
                  <button
                    onClick={() => setSelectedCategory("meeting")}
                    className={`nav-button ${selectedCategory === "meeting" ? "active" : "inactive"}`}
                  >
                    Meeting Room
                  </button>
                  <button
                    onClick={() => setSelectedCategory("outdoor")}
                    className={`nav-button ${selectedCategory === "outdoor" ? "active" : "inactive"}`}
                  >
                    Outdoor
                  </button>
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
          ) : venues.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Venue</h3>
              <p className="text-gray-500 mb-4">
                {userRole === "admin" 
                  ? "Silakan tambahkan venue melalui menu Admin > Venues" 
                  : "Venue sedang dalam proses setup. Silakan coba lagi nanti."}
              </p>
              {userRole === "admin" && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Refresh Data
                </button>
              )}
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
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}

          <VenueDetailModal
            venue={selectedVenue}
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            onBook={handleBookVenue}
            userRole={userRole}
          />
        </div>
      )}

      {activeTab === "reservasi" && userRole === "customer" && <MyBookings />}
      {activeTab === "kalender" && userRole === "customer" && <CalendarDashboard userRole={userRole} />}
    </div>
  )
}

export default HomePage