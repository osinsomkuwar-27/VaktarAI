import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
interface AccordionItemData {
  id: number
  title: string
  imageUrl: string
}

interface AccordionItemProps {
  item: AccordionItemData
  isActive: boolean
  onMouseEnter: () => void
}

const accordionItems: AccordionItemData[] = [
  { id: 1, title: "Aira", imageUrl: "/avatars_sample/avatar1.avif" },
  { id: 2, title: "Kael", imageUrl: "/avatars_sample/avatar4.avif" },
  { id: 3, title: "Zayn", imageUrl: "/avatars_sample/avatar5.jpg" },
  { id: 4, title: "Nyra", imageUrl: "/avatars_sample/avatar3.avif" },
  { id: 5, title: "Elara", imageUrl: "/avatars_sample/avatar2.avif" },
]

const AccordionItem = ({ item, isActive, onMouseEnter }: AccordionItemProps) => {
  return (
    <div
      className={`relative h-[450px] cursor-pointer overflow-hidden rounded-2xl transition-all duration-700 ease-in-out ${
        isActive ? "w-[400px]" : "w-[60px]"
      }`}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = "https://placehold.co/400x450/e5e5e5/404040?text=Image+Error"
        }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <span
        className={`absolute text-lg font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
          isActive
            ? "bottom-6 left-1/2 -translate-x-1/2 rotate-0"
            : "bottom-24 left-1/2 -translate-x-1/2 rotate-90"
        }`}
        style={{ color: "#F3F4F4" }}
      >
        {item.title}
      </span>
    </div>
  )
}

export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState<number>(4)
  const { user } = useAuth()

  return (
    <div className="font-sans h-full">
      <section className="container mx-auto px-4 h-full flex items-center">
        <div className="flex flex-col items-center justify-between gap-12 w-full md:flex-row">

          {/* Left */}
          <div className="w-full text-center md:w-1/2 md:text-left">
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#F3F4F4" }}
            >
              Next-Gen AI Avatars
            </p>
            <h1
              className="text-5xl leading-none font-bold tracking-tighter md:text-7xl"
              style={{ color: "#F3F4F4" }}
            >
              VAKTAR
              <br />
              <span style={{ color: "#F3F4F4" }}>AI</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-sm text-base leading-relaxed md:mx-0"
              style={{ color: "#F3F4F4" }}
            >
              Create lifelike AI avatars that bring your identity to life. Powered by cutting-edge generative models.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row md:justify-start justify-center">
              <Link
                to={user ? "/avatar" : "/login"}
                state={user ? undefined : { redirectTo: "/avatar" }}
                className="inline-block rounded-full px-8 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                style={{ background: "#F3F4F4", color: "#061E29" }}
              >
                Try Now →
              </Link>
              <a
                href="#about"
                className="inline-block rounded-full px-8 py-3 font-semibold transition-all duration-300"
                style={{ border: "1px solid #F3F4F4", color: "#F3F4F4" }}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right */}
          <div className="w-full md:w-1/2">
            <div className="flex flex-row items-center justify-center gap-4 p-4">
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
