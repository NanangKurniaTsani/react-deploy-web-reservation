"use client"

import { createContext, useContext, useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "../config/firebase"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setCurrentUser(user)
            setUserRole(userData.role)
          } else {
            const newUserData = {
              email: user.email,
              name: user.displayName || user.email.split("@")[0],
              role: "customer",
              createdAt: new Date(),
            }
            await setDoc(doc(db, "users", user.uid), newUserData)
            setCurrentUser(user)
            setUserRole("customer")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Gagal memuat data user", {
            duration: 2000,
          })
        }
      } else {
        setCurrentUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login gagal", {
        duration: 2000,
      })
      throw error
    }
  }

  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName,
        })
      }

      await setDoc(doc(db, "users", result.user.uid), {
        email: email,
        name: displayName || email.split("@")[0],
        role: "customer",
        createdAt: new Date(),
      })

      return result
    } catch (error) {
      console.error("Signup error:", error)
      toast.error("Pendaftaran gagal", {
        duration: 2000,
      })
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("Login dengan Google gagal", {
        duration: 2000,
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success("Berhasil logout!", {
        duration: 2000,
      })
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Gagal logout", {
        duration: 2000,
      })
      throw error
    }
  }

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
