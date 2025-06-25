/**
 * Format date to Indonesian locale
 * @param {Date|string|object} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "Tanggal tidak tersedia"

  try {
    let dateObj

    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === "function") {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string date
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle timestamp number
    else if (typeof date === "number") {
      dateObj = new Date(date)
    }
    // Handle object with seconds (Firestore format)
    else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Tanggal tidak valid"
    }

    return dateObj.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Tanggal tidak valid"
  }
}

/**
 * Format date and time to Indonesian locale
 * @param {Date|string|object} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return "Tanggal tidak tersedia"

  try {
    let dateObj

    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === "function") {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string date
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle timestamp number
    else if (typeof date === "number") {
      dateObj = new Date(date)
    }
    // Handle object with seconds (Firestore format)
    else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Tanggal tidak valid"
    }

    return dateObj.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting datetime:", error)
    return "Tanggal tidak valid"
  }
}

/**
 * Format date to short format
 * @param {Date|string|object} date - Date to format
 * @returns {string} Formatted short date string
 */
export const formatDateShort = (date) => {
  if (!date) return "Tanggal tidak tersedia"

  try {
    let dateObj

    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === "function") {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string date
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle timestamp number
    else if (typeof date === "number") {
      dateObj = new Date(date)
    }
    // Handle object with seconds (Firestore format)
    else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Tanggal tidak valid"
    }

    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting short date:", error)
    return "Tanggal tidak valid"
  }
}

/**
 * Format time only
 * @param {Date|string|object} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return "Waktu tidak tersedia"

  try {
    let dateObj

    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === "function") {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string date
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle timestamp number
    else if (typeof date === "number") {
      dateObj = new Date(date)
    }
    // Handle object with seconds (Firestore format)
    else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Waktu tidak valid"
    }

    return dateObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting time:", error)
    return "Waktu tidak valid"
  }
}

/**
 * Get relative time (e.g., "2 hari yang lalu")
 * @param {Date|string|object} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return "Waktu tidak tersedia"

  try {
    let dateObj

    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === "function") {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string date
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle timestamp number
    else if (typeof date === "number") {
      dateObj = new Date(date)
    }
    // Handle object with seconds (Firestore format)
    else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Waktu tidak valid"
    }

    const now = new Date()
    const diffInMs = now - dateObj
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return "Baru saja"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`
    } else if (diffInDays < 7) {
      return `${diffInDays} hari yang lalu`
    } else {
      return formatDateShort(dateObj)
    }
  } catch (error) {
    console.error("Error getting relative time:", error)
    return "Waktu tidak valid"
  }
}

/**
 * Check if date is today
 * @param {Date|string|object} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false

  try {
    let dateObj

    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === "function") {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string date
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle timestamp number
    else if (typeof date === "number") {
      dateObj = new Date(date)
    }
    // Handle object with seconds (Firestore format)
    else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return false
    }

    const today = new Date()
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    )
  } catch (error) {
    console.error("Error checking if date is today:", error)
    return false
  }
}

/**
 * Check if date is in the past
 * @param {Date|string|object} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false

  try {
    let dateObj

    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === "function") {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string date
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle timestamp number
    else if (typeof date === "number") {
      dateObj = new Date(date)
    }
    // Handle object with seconds (Firestore format)
    else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day
    dateObj.setHours(0, 0, 0, 0) // Set to start of day

    return dateObj < today
  } catch (error) {
    console.error("Error checking if date is past:", error)
    return false
  }
}

/**
 * Get days between two dates
 * @param {Date|string|object} startDate - Start date
 * @param {Date|string|object} endDate - End date
 * @returns {number} Number of days between dates
 */
export const getDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0

  try {
    let startObj, endObj

    // Handle start date
    if (startDate.toDate && typeof startDate.toDate === "function") {
      startObj = startDate.toDate()
    } else if (startDate instanceof Date) {
      startObj = startDate
    } else {
      startObj = new Date(startDate)
    }

    // Handle end date
    if (endDate.toDate && typeof endDate.toDate === "function") {
      endObj = endDate.toDate()
    } else if (endDate instanceof Date) {
      endObj = endDate
    } else {
      endObj = new Date(endDate)
    }

    // Check if dates are valid
    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      return 0
    }

    const diffInMs = Math.abs(endObj - startObj)
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  } catch (error) {
    console.error("Error calculating days between dates:", error)
    return 0
  }
}
