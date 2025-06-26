"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { FaArrowRight } from "react-icons/fa"
import { useBackButton } from "../hooks/UseBackButton.js"

const SplashScreen = ({ onComplete }) => {
  useBackButton(() => {
    localStorage.setItem("hasSeenSplash", "true")
    onComplete()
  })
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=600&fit=crop",
      title: "Venue Terbaik untuk Acara Anda",
      subtitle: "Kami menyediakan venue berkualitas tinggi untuk berbagai kebutuhan acara Anda.",
    },
    {
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&h=600&fit=crop",
      title: "Ballroom Mewah",
      subtitle: "Ballroom Santorini dengan kapasitas besar dan fasilitas premium untuk acara spesial Anda.",
    },
    {
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=600&fit=crop",
      title: "Meeting Room Modern",
      subtitle: "Ruang meeting Venice, Barcelona, dan Melizo dengan teknologi terdepan untuk produktivitas maksimal.",
    },
    {
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=600&fit=crop",
      title: "Outdoor Venue Menawan",
      subtitle: "Swimming pool area yang sempurna untuk acara outdoor dan gathering yang berkesan.",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [slides.length])

  const handleGetStarted = () => {
    localStorage.setItem("hasSeenSplash", "true")
    if (onComplete) onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem("hasSeenSplash", "true")
    if (onComplete) onComplete()
  }

  return (
    <div className="splash-screen splash-screen-container splash-screen-responsive fixed inset-0 bg-white z-50 flex flex-col">
      <div className="splash-header splash-header-container splash-header-responsive flex justify-between items-center p-4 sm:p-6">
        <div className="splash-logo splash-logo-container splash-logo-responsive w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
          <img
            src="src/assets/icon_hotel.png"
            alt="Grand Hotel"
            className="splash-logo-image splash-logo-image-responsive w-6 h-6 sm:w-8 sm:h-8 object-contain"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "block"
            }}
          />
          <span
            className="splash-logo-text splash-logo-text-responsive text-white font-bold text-lg sm:text-xl hidden"
            style={{ display: "none" }}
          >
            GH
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="splash-skip splash-skip-button splash-skip-responsive text-gray-500 hover:text-gray-700 font-medium text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="splash-content splash-content-container splash-content-responsive flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="splash-image splash-image-container splash-image-responsive w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 mb-6 sm:mb-8 relative overflow-hidden rounded-3xl shadow-2xl">
          <img
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].title}
            className="splash-slide-image splash-slide-image-responsive w-full h-full object-cover"
          />
          <div className="splash-image-overlay splash-image-overlay-responsive absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="splash-indicators splash-indicators-container splash-indicators-responsive flex space-x-2 mb-4 sm:mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`splash-dot splash-dot-responsive w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-green-500 w-6 sm:w-8" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="splash-text splash-text-container splash-text-responsive text-center mb-6 sm:mb-8 max-w-sm sm:max-w-md">
          <h1 className="splash-title splash-title-responsive text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            {slides[currentSlide].title}
          </h1>
          <p className="splash-subtitle splash-subtitle-responsive text-gray-600 leading-relaxed px-2 sm:px-4 text-sm sm:text-base">
            {slides[currentSlide].subtitle}
          </p>
        </div>
      </div>

      <div className="splash-footer splash-footer-container splash-footer-responsive p-4 sm:p-6">
        <button
          onClick={handleGetStarted}
          className="splash-button splash-button-cta splash-button-responsive w-full bg-green-500 text-white py-3 sm:py-4 px-6 rounded-2xl hover:bg-green-600 transition-colors font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg active:scale-95"
        >
          <span>Get Started</span>
          <FaArrowRight className="splash-button-icon splash-button-icon-responsive text-sm" />
        </button>
      </div>
    </div>
  )
}

SplashScreen.propTypes = {
  onComplete: PropTypes.func.isRequired,
}

export default SplashScreen
