"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { FaArrowRight } from "react-icons/fa"
import {useBackButton} from "../hooks/UseBackButton.js"


const SplashScreen = ({ onComplete }) => {
  useBackButton(() => {
    localStorage.setItem("hasSeenSplash", "true")
    onComplete()
  });
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
          <img
            src="src/assets/icon_hotel.png"
            alt="Grand Hotel"
            className="w-6 h-6 object-contain"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "block"
            }}
          />
          <span className="text-white font-bold text-lg hidden" style={{ display: "none" }}>
            GH
          </span>
        </div>
        <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 font-medium">
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Image */}
        <div className="w-80 h-80 mb-8 relative overflow-hidden rounded-3xl shadow-2xl">
          <img
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Dots Indicator */}
        <div className="flex space-x-2 mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-green-500 w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Text Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{slides[currentSlide].title}</h1>
          <p className="text-gray-600 leading-relaxed px-4">{slides[currentSlide].subtitle}</p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6">
        <button
          onClick={handleGetStarted}
          className="w-full bg-green-500 text-white py-4 rounded-2xl hover:bg-green-600 transition-colors font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Get Started</span>
          <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  )
}

SplashScreen.propTypes = {
  onComplete: PropTypes.func.isRequired,
}

export default SplashScreen
