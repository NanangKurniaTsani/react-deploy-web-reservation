// src/hooks/useBackButton.js
import { useEffect, useCallback } from "react"

export const useBackButton = (onBack) => {
  const handleBackButton = useCallback(
    (event) => {
      event.preventDefault()
      if (onBack) {
        onBack()
      } else {
        window.history.pushState(null, null, window.location.pathname)
      }
    },
    [onBack],
  )

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname)
    window.addEventListener("popstate", handleBackButton)

    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [handleBackButton])

  const goBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      window.history.pushState(null, null, window.location.pathname)
    }
  }, [onBack])

  return { goBack }
}