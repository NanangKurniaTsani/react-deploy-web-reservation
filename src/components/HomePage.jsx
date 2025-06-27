"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useBackButton } from "../hooks/UseBackButton"
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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "venues"),
      (snapshot) => {
        const venuesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || "Unnamed Venue",
          category: doc.data().category || "meeting",
          available: doc.data().available !== undefined ? doc.data().available : true
        }))
        setVenues(venuesData)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading venues:", error)
        toast.error("Failed to load venues")
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let results = venues
    if (selectedCategory !== "all") {
      results = results.filter(venue => venue.category === selectedCategory)
    }
    if (searchTerm) {
      results = results.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredVenues(results)
  }, [venues, selectedCategory, searchTerm])

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue)
    setShowDetailModal(true)
  }

  const handleBookVenue = (venue) => {
    if (userRole === "admin") {
      toast.error("Admins cannot make bookings")
      return
    }
    setVenueToBook(venue)
  }

  const handleTabChange = (tab) => {
    if (tab === "reservasi" && !currentUser) {
      toast.error("Please login to view bookings")
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
                toast.success("Booking successful!")
              }}
              onCancel={() => setVenueToBook(null)}
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
                  className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "beranda" ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Beranda
                </button>
                {currentUser && userRole === "customer" && (
                  <>
                    <button
                      onClick={() => handleTabChange("reservasi")}
                      className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                        activeTab === "reservasi" ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Reservasi Saya
                    </button>
                    <button
                      onClick={() => handleTabChange("kalender")}
                      className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                        activeTab === "kalender" ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900"
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
          <div className="text-center mb-6">
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

            <div className="flex justify-center overflow-x-auto pb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors whitespace-nowrap ${
                    selectedCategory === "all" 
                      ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedCategory("ballroom")}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors whitespace-nowrap ${
                    selectedCategory === "ballroom" 
                      ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Ballroom
                </button>
                <button
                  onClick={() => setSelectedCategory("meeting")}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors whitespace-nowrap ${
                    selectedCategory === "meeting" 
                      ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Meeting
                </button>
                <button
                  onClick={() => setSelectedCategory("outdoor")}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors whitespace-nowrap ${
                    selectedCategory === "outdoor" 
                      ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Outdoor
                </button>
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
                  key={venue.id}
                  venue={venue}
                  onViewDetails={handleViewDetails}
                  onBook={handleBookVenue}
                  userRole={userRole}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {venues.length === 0 ? "Belum Ada Venue" : "Tidak Ada Venue Ditemukan"}
              </h3>
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
      {activeTab === "kalender" && userRole === "customer" && <CalendarDashboard />}
    </div>
  )
}

export default HomePage