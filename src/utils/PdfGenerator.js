export const generateVenuePDF = (venue) => {
  return import("jspdf").then(({ default: jsPDF }) => {
    const doc = new jsPDF()

    // Header dengan logo area
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, 210, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, "bold")
    doc.text("KING ROYAL HOTEL", 20, 25)

    doc.setFontSize(14)
    doc.setFont(undefined, "normal")
    doc.text("VENUE INFORMATION", 20, 35)

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Venue Image placeholder
    doc.setFillColor(240, 240, 240)
    doc.rect(20, 50, 170, 60, "F")
    doc.setFontSize(10)
    doc.text("Venue Image", 95, 85)

    // Venue Details Section
    let yPos = 130

    // Venue Name
    doc.setFontSize(18)
    doc.setFont(undefined, "bold")
    doc.text(venue.name, 20, yPos)
    yPos += 15

    // Category Badge
    doc.setFillColor(52, 152, 219)
    doc.roundedRect(20, yPos - 8, 40, 12, 3, 3, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(venue.category.toUpperCase(), 25, yPos - 2)
    doc.setTextColor(0, 0, 0)
    yPos += 20

    // Details Grid
    doc.setFontSize(12)
    const details = [
      ["Capacity", `${venue.capacity} people`],
      ["Price", formatPrice(venue.price) + "/day"],
      ["Rating", venue.rating ? `${venue.rating}/5 (${venue.reviews} reviews)` : "Not rated"],
      ["Location", "King Royal Hotel"],
    ]

    details.forEach(([label, value], index) => {
      const xPos = index % 2 === 0 ? 20 : 110
      const currentY = yPos + Math.floor(index / 2) * 15

      doc.setFont(undefined, "bold")
      doc.text(label + ":", xPos, currentY)
      doc.setFont(undefined, "normal")
      doc.text(value, xPos + 30, currentY)
    })

    yPos += 40

    // Description
    doc.setFont(undefined, "bold")
    doc.text("Description:", 20, yPos)
    yPos += 10

    doc.setFont(undefined, "normal")
    const splitDescription = doc.splitTextToSize(venue.description, 170)
    doc.text(splitDescription, 20, yPos)
    yPos += splitDescription.length * 5 + 15

    // Amenities
    if (venue.amenities && venue.amenities.length > 0) {
      doc.setFont(undefined, "bold")
      doc.text("Amenities:", 20, yPos)
      yPos += 10

      doc.setFont(undefined, "normal")
      venue.amenities.forEach((amenity, index) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`• ${amenity}`, 25, yPos)
        yPos += 7
      })
      yPos += 10
    }

    // Setup Options
    if (venue.setupOptions && venue.setupOptions.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont(undefined, "bold")
      doc.text("Setup Options:", 20, yPos)
      yPos += 10

      doc.setFont(undefined, "normal")
      venue.setupOptions.forEach((setup) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`• ${setup.label}`, 25, yPos)
        yPos += 7
      })
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text("King Royal Hotel - Premium Venue Services", 20, 285)
      doc.text("Phone: +62 21 1234 5678 | Website: www.kingroyalhotel.com", 20, 290)
      doc.text(`Generated on: ${new Date().toLocaleDateString("id-ID")} | Page ${i} of ${pageCount}`, 20, 295)
    }

    return doc
  })
}

export const generateBookingPDF = (booking) => {
  return import("jspdf").then(({ default: jsPDF }) => {
    const doc = new jsPDF()

    // Header
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, 210, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, "bold")
    doc.text("KING ROYAL HOTEL", 20, 25)

    doc.setFontSize(14)
    doc.text("BOOKING CONFIRMATION", 20, 35)

    doc.setTextColor(0, 0, 0)

    // Booking ID
    doc.setFontSize(16)
    doc.setFont(undefined, "bold")
    doc.text(`Booking ID: ${booking.id}`, 20, 60)

    // Status Badge
    const statusColor =
      booking.status === "confirmed" ? [46, 204, 113] : booking.status === "pending" ? [241, 196, 15] : [231, 76, 60]
    doc.setFillColor(...statusColor)
    doc.roundedRect(20, 70, 30, 10, 2, 2, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(booking.status.toUpperCase(), 25, 77)
    doc.setTextColor(0, 0, 0)

    // Booking Details
    let yPos = 100
    doc.setFontSize(12)

    const bookingDetails = [
      ["Booking Name", booking.bookingName],
      ["Event Name", booking.eventName],
      ["Venue", booking.venueName || booking.roomName],
      ["Check In", new Date(booking.checkIn || booking.eventDate).toLocaleDateString("id-ID")],
      ["Check Out", booking.checkOut ? new Date(booking.checkOut).toLocaleDateString("id-ID") : "Same day"],
      ["Time Slot", booking.timeSlotDetails?.label || "Full Day"],
      ["Setup", booking.venueSetupDetails?.label || "Standard"],
      ["Guests", `${booking.guestCapacity || booking.guests || booking.guestCount} people`],
      ["Total Amount", `Rp ${(booking.totalAmount || booking.roomPrice || 0).toLocaleString("id-ID")}`],
      ["Payment Method", booking.paymentType === "cash" ? "Cash on Site" : "Bank Transfer"],
      ["Payment Status", booking.paymentStatus || "Pending"],
    ]

    bookingDetails.forEach(([label, value]) => {
      doc.setFont(undefined, "bold")
      doc.text(label + ":", 20, yPos)
      doc.setFont(undefined, "normal")
      doc.text(String(value), 80, yPos)
      yPos += 12
    })

    // Special Requests
    if (booking.specialRequests) {
      yPos += 10
      doc.setFont(undefined, "bold")
      doc.text("Special Requests:", 20, yPos)
      yPos += 10
      doc.setFont(undefined, "normal")
      const splitRequests = doc.splitTextToSize(booking.specialRequests, 170)
      doc.text(splitRequests, 20, yPos)
      yPos += splitRequests.length * 5 + 10
    }

    // Terms and Conditions
    yPos += 20
    doc.setFont(undefined, "bold")
    doc.text("Terms and Conditions:", 20, yPos)
    yPos += 10
    doc.setFont(undefined, "normal")
    doc.setFontSize(10)
    const terms = [
      "• Payment must be completed before the event date",
      "• Cancellation must be made 48 hours before the event",
      "• Additional charges may apply for extra services",
      "• Venue must be returned in original condition",
    ]
    terms.forEach((term) => {
      doc.text(term, 20, yPos)
      yPos += 7
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text("King Royal Hotel - Premium Venue Services", 20, 285)
    doc.text("Phone: +62 21 1234 5678 | Website: www.kingroyalhotel.com", 20, 290)
    doc.text(`Generated on: ${new Date().toLocaleDateString("id-ID")}`, 20, 295)

    return doc
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}
