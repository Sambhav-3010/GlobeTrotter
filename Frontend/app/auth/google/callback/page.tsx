"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "../../../context/UserContext"
import Cookies from "js-cookie"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useUser()

  useEffect(() => {
    const token = searchParams.get("token")
    const userDataString = searchParams.get("user")

    if (token && userDataString) {
      try {
        const user = JSON.parse(decodeURIComponent(userDataString))
        Cookies.set("token", token, { expires: 7 })
        setUser(user)
        if (user.username) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      } catch (error) {
        console.error("Failed to parse user data from URL:", error)
        router.push("/auth")
      }
    } else {
      router.push("/auth")
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-orange-500 text-white text-2xl font-bold">
      Processing Google Login...
    </div>
  )
}
