import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"
import { useLocation, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../../firebase"
import { useAuth } from "../../context/AuthContext"

interface NavItem {
  name: string
  url: string
}

interface NavBarProps {
  items?: NavItem[]
  className?: string
}

const loggedOutItems: NavItem[] = [
  { name: "Home", url: "/" },
  { name: "About", url: "/#about" },
  { name: "Guide", url: "/#guide" },
  { name: "Sectors", url: "/#sectors" },
  { name: "People", url: "/#people" },
  { name: "Login", url: "/login" },
]

const loggedInItems: NavItem[] = [
  { name: "Home", url: "/" },
  { name: "Chat", url: "/chat" },
  { name: "Gallery", url: "/gallery" },
]

export function NavBar({ items, className }: NavBarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Home")
  const [isMobile, setIsMobile] = useState(false)

  const navItems = useMemo(() => {
    if (items?.length) return items
    return user ? loggedInItems : loggedOutItems
  }, [items, user])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const currentHash = location.hash || window.location.hash
    const matchedItem = navItems.find((item) => {
      const [pathname, hash] = item.url.split("#")
      const normalizedHash = hash ? `#${hash}` : ""

      return pathname === location.pathname && normalizedHash === currentHash
    })

    if (matchedItem) {
      setActiveTab(matchedItem.name)
      return
    }

    const pathnameMatch = navItems.find((item) => item.url === location.pathname)
    setActiveTab(pathnameMatch?.name ?? navItems[0]?.name ?? "Home")
  }, [location.hash, location.pathname, navItems])

  const handleLogout = async () => {
    await signOut(auth)
    setActiveTab("Home")
    navigate("/")
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:bottom-auto sm:mt-6",
        "pointer-events-none",
        className
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-[#F3F4F4] bg-[#F3F4F4]/80 p-1 shadow-lg backdrop-blur-lg pointer-events-auto">
        {user && (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white text-[#1D546D] shadow-sm">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                viewBox="0 0 512 512"
                aria-hidden="true"
                className={cn("fill-current", isMobile ? "h-4 w-4" : "h-5 w-5")}
              >
                <path d="M256 288a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm-96 32C71.6 320 0 391.6 0 480c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32c0-88.4-71.6-160-160-160H160z" />
              </svg>
            )}
          </div>
        )}

        {navItems.map((item) => {
          const isActive = activeTab === item.name
          const isCTA = item.name === "Login"

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative flex items-center justify-center h-10 px-5 rounded-full text-sm font-semibold transition-all duration-300",
                isCTA
                  ? "bg-[#061E29] text-[#F3F4F4] shadow-md hover:scale-105 hover:shadow-lg"
                  : "text-[#1D546D]/60 hover:text-[#1D546D]",
                isActive && !isCTA && "bg-white text-[#1D546D]"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">{item.name[0]}</span>

              {/* Active glow effect */}
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 -z-10 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute inset-0 rounded-full bg-white" />
                  <div className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#1D546D]" />
                  <div className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rounded-full bg-[#1D546D]/20 blur-md" />
                  <div className="absolute top-0 left-1/2 h-3 w-6 -translate-x-1/2 rounded-full bg-[#1D546D]/20 blur-sm" />
                </motion.div>
              )}
            </a>
          )
        })}

        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="relative flex h-10 items-center justify-center rounded-full bg-[#061E29] px-5 text-sm font-semibold text-[#F3F4F4] shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="hidden md:inline">Logout</span>
            <span className="md:hidden">L</span>
          </button>
        )}
      </div>
    </div>
  )
}
