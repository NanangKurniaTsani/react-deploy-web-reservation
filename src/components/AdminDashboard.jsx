"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        const bookingsResponse = await axios.get("https://64f841b1824680fd217f944a.mockapi.io/bookings")
        setBookings(bookingsResponse.data)
      } catch (_error) {
        console.error("Error fetching data:", _error)
        setError(_error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      {loading && <p>Loading bookings...</p>}
      {error && <p className="text-danger">Error: {error.message}</p>}
      {!loading && !error && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.name}</td>
                <td>{booking.email}</td>
                <td>{booking.phone}</td>
                <td>{booking.service}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>
                  <Link to={`/bookings/${booking.id}`} className="btn btn-sm btn-info me-1">
                    View
                  </Link>
                  <Link to={`/bookings/edit/${booking.id}`} className="btn btn-sm btn-warning me-1">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminDashboard
