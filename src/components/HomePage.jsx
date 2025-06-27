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

const HomePage = ({ setCurrentView }) => {
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
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userRole !== "customer") {
      setActiveTab("beranda")
    }
  }, [userRole])

  useEffect(() => {
    // Load venues untuk semua user (termasuk yang belum login)
    console.log("Loading venues for all users...") // Debug log
    setLoading(true)
    setError(null)

    const unsubscribe = onSnapshot(
      collection(db, "venues"),
      (snapshot) => {
        console.log("Venues snapshot received:", snapshot.docs.length) // Debug log
        const venuesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || "Unnamed Venue",
          category: doc.data().category || "meeting",
          available: doc.data().available !== undefined ? doc.data().available : true,
        }))
        console.log("Processed venues data:", venuesData) // Debug log
        setVenues(venuesData)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading venues:", error)
        setError(error.message)
        setVenues([])
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, []) // Tidak depend pada currentUser

  useEffect(() => {
    let results = venues
    if (selectedCategory !== "all") {
      results = results.filter((venue) => venue.category === selectedCategory)
    }
    if (searchTerm) {
      results = results.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    setFilteredVenues(results)
  }, [venues, selectedCategory, searchTerm])

  const handleViewDetails = (venue) => {
    // Semua orang bisa lihat detail venue
    setSelectedVenue(venue)
    setShowDetailModal(true)
  }

  const handleBookVenue = (venue) => {
    if (userRole === "admin") {
      toast.error("Admins cannot make bookings")
      return
    }
    if (!currentUser) {
      toast.error("Please login to make bookings")
      if (setCurrentView) {
        setCurrentView("auth")
      }
      return
    }
    setVenueToBook(venue)
  }

  const handleTabChange = (tab) => {
    if (tab === "reservasi" && !currentUser) {
      toast.error("Please login to view your bookings")
      if (setCurrentView) {
        setCurrentView("auth")
      }
      return
    }
    // Kalender bisa diakses semua orang
    setActiveTab(tab)
  }

  useBackButton(() => {
    if (showDetailModal) setShowDetailModal(false)
    else if (venueToBook) setVenueToBook(null)
    else if (activeTab !== "beranda" && userRole === "customer") setActiveTab("beranda")
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {venueToBook && currentUser && (
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

      {/* Tab Navigation - Show untuk customer yang login + kalender untuk semua */}
      {(userRole === "customer" && currentUser) || !currentUser ? (
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

                {/* Tab Reservasi hanya untuk user yang login */}
                {currentUser && (
                  <button
                    onClick={() => handleTabChange("reservasi")}
                    className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                      activeTab === "reservasi" ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Reservasi Saya
                  </button>
                )}

                {/* Tab Kalender untuk semua orang */}
                <button
                  onClick={() => handleTabChange("kalender")}
                  className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "kalender" ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Kalender
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "beranda" && (
        <div className="container mx-auto px-4 py-8">
          {/* Search dan Filter untuk semua user */}
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

            <div className="grid grid-cols-4 gap-2 px-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-1 py-2 rounded-lg font-medium border transition-colors text-sm ${
                  selectedCategory === "all"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedCategory("ballroom")}
                className={`px-1 py-2 rounded-lg font-medium border transition-colors text-sm ${
                  selectedCategory === "ballroom"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Ballroom
              </button>
              <button
                onClick={() => setSelectedCategory("meeting")}
                className={`px-1 py-2 rounded-lg font-medium border transition-colors text-sm ${
                  selectedCategory === "meeting"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Meeting
              </button>
              <button
                onClick={() => setSelectedCategory("outdoor")}
                className={`px-1 py-2 rounded-lg font-medium border transition-colors text-sm ${
                  selectedCategory === "outdoor"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Outdoor
              </button>
            </div>
          </div>

          {/* Venue List untuk semua user */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Venues</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          ) : filteredVenues.length > 0 ? (
            <>
              {/* Info untuk user yang belum login */}
              {!currentUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <p className="text-blue-800 font-medium">
                      🔍 Browse our venues freely!
                      <button
                        onClick={() => setCurrentView && setCurrentView("auth")}
                        className="text-blue-600 hover:text-blue-800 underline ml-1"
                      >
                        Login to make bookings
                      </button>
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onViewDetails={handleViewDetails}
                    onBook={handleBookVenue}
                    userRole={userRole}
                    isGuest={!currentUser} // Pass info apakah user guest
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {venues.length === 0 ? "Belum Ada Venue" : "Tidak Ada Venue Ditemukan"}
              </h3>
              <p className="text-gray-500 mb-4">
                {venues.length === 0
                  ? "Belum ada venue yang ditambahkan ke sistem"
                  : "Coba ubah filter atau kata kunci pencarian"}
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
            isGuest={!currentUser} // Pass info apakah user guest
          />
        </div>
      )}

      {/* Reservasi hanya untuk user yang login */}
      {activeTab === "reservasi" && currentUser && <MyBookings />}

      {/* Kalender untuk semua orang */}
      {activeTab === "kalender" && <CalendarDashboard isGuest={!currentUser} />}
    </div>
  )
}

export default HomePage
