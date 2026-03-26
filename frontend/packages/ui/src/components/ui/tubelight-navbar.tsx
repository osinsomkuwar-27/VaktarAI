// import React, { useEffect, useState } from "react"
// import { motion } from "framer-motion"
// import { cn } from "@workspace/ui/lib/utils"
// import { Link } from "react-router-dom"
// interface NavItem {
//   name: string
//   url: string
// }

// interface NavBarProps {
//   items: NavItem[]
//   className?: string
// }

// export function NavBar({ items, className }: NavBarProps) {
//   const [activeTab, setActiveTab] = useState(items[0].name)
//   const [isMobile, setIsMobile] = useState(false)

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
//     handleResize()
//     window.addEventListener("resize", handleResize)
//     return () => window.removeEventListener("resize", handleResize)
//   }, [])

//   return (
//     <div
//       className={cn(
//         "fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:bottom-auto sm:mt-6",
//         "pointer-events-none",
//         className
//       )}
//     >
//       <div className="flex items-center gap-3 rounded-full border border-[#F3F4F4] bg-[#F3F4F4]/80 px-1 py-1 shadow-lg backdrop-blur-lg pointer-events-auto">
//         {items.map((item) => {
//           const isActive = activeTab === item.name

//           if (item.name === "Login") {
//             return (
//               <a
//                 key={item.name}
//                 href={item.url}
//                 onClick={() => setActiveTab(item.name)}
//                 className="relative cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 hover:opacity-90"
//                 style={{ background: "#061E29", color: "#F3F4F4" }}
//               >
//                 <span className="hidden md:inline">{item.name}</span>
//                 <span className="md:hidden">{item.name[0]}</span>
//               </a>
//             )
//           }

//           return (
//             <a
//               key={item.name}
//               href={item.url}
//               onClick={() => setActiveTab(item.name)}
//               className={cn(
//                 "relative cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-colors",
//                 "text-[#1D546D]/60 hover:text-[#1D546D]",
//                 isActive && "bg-[#F3F4F4] text-[#1D546D]"
//               )}
//             >
//               <span className="hidden md:inline">{item.name}</span>
//               <span className="md:hidden">{item.name[0]}</span>

//               {isActive && (
//                 <motion.div
//                   layoutId="lamp"
//                   className="absolute inset-0 -z-10 w-full rounded-full bg-[#F3F4F4]/50"
//                   initial={false}
//                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                 >
//                   <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-[#1D546D]">
//                     <div className="absolute -top-2 -left-2 h-6 w-12 rounded-full bg-[#1D546D]/10 blur-md" />
//                     <div className="absolute -top-1 h-6 w-8 rounded-full bg-[#1D546D]/10 blur-md" />
//                     <div className="absolute top-0 left-2 h-4 w-4 rounded-full bg-[#1D546D]/10 blur-sm" />
//                   </div>
//                 </motion.div>
//               )}
//             </a>
//           )
//         })}
//       </div>
//     </div>
//   )
// }
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"
import { Link } from "react-router-dom"

interface NavItem {
  name: string
  url: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:bottom-auto sm:mt-6",
        "pointer-events-none",
        className
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-[#F3F4F4] bg-[#F3F4F4]/80 p-1 shadow-lg backdrop-blur-lg pointer-events-auto">
        
        {items.map((item) => {
          const isActive = activeTab === item.name
          const isCTA = item.name === "Login" || item.name === "Try It"

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative flex items-center justify-center h-10 px-5 rounded-full text-sm font-semibold transition-all duration-300",

                // Normal items
                !isCTA &&
                  "text-[#1D546D]/60 hover:text-[#1D546D]",

                // Active tab
                isActive && !isCTA &&
                  "bg-white text-[#1D546D]",

                // CTA buttons
                isCTA &&
                  "bg-[#061E29] text-[#F3F4F4] shadow-md hover:shadow-lg hover:scale-105"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">{item.name[0]}</span>

              {/* Active glow effect */}
              {isActive && !isCTA && (
  <motion.div
    layoutId="lamp"
    className="absolute inset-0 -z-10 rounded-full"
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {/* Base glow */}
    <div className="absolute inset-0 rounded-full bg-white" />

    {/* Top highlight (tube light effect) */}
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#1D546D]" />

    {/* Glow blur layers */}
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 rounded-full bg-[#1D546D]/20 blur-md" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-[#1D546D]/20 blur-sm" />
  </motion.div>
)}
            </Link>
          )
        })}

      </div>
    </div>
  )
}