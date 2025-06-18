"use client"

import { useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"

const DebugBookings = () => {
  const { currentUser } = useAuth()
  const [debugData, setDebugData] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkFirestore = async () => {
    setLoading(true)
    try {
      // Check all bookings
      const allBookingsQuery = await getDocs(collection(db, "bookings"))
      const allBookings = allBookingsQuery.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Check user-specific bookings
      const userBookingsQuery = query(collection(db, "bookings"), where("userId", "==", currentUser.uid))
      const userBookingsSnapshot = await getDocs(userBookingsQuery)
      const userBookings = userBookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setDebugData({
        currentUserId: currentUser.uid,
        currentUserEmail: currentUser.email,
        totalBookings: allBookings.length,
        userBookings: userBookings.length,
        allBookingsData: allBookings,
        userBookingsData: userBookings,
      })
    } catch (error) {
      console.error("Debug error:", error)
      setDebugData({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Debug Firestore</h3>

      <button
        onClick={checkFirestore}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Firestore"}
      </button>

      {debugData && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <pre>{JSON.stringify(debugData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default DebugBookings
