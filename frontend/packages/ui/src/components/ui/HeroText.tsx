import { useEffect, useRef } from "react"

export function HeroText() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.8s ease, transform 0.8s ease"
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
    })
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", padding: "2rem" }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "black", opacity: 0.5 }}>
        Portfolio — 2025
      </p>

      <h1
        ref={headingRef}
        style={{ fontFamily: "'Syne', sans-serif",
fontWeight: 800,
fontStyle: "normal",
letterSpacing: "-0.02em",


overflow: "hidden",
whiteSpace: "nowrap",
fontSize: "3.5rem",
 }}
      >
        Vaktar<br />AI
      </h1>

      <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300, color: "black", opacity: 0.65, maxWidth: "26ch", lineHeight: 1.7, borderLeft: "1.5px solid black", paddingLeft: "1rem", marginTop: "0.5rem",fontSize: "1rem", }}>
        Building intelligent systems<br />that think ahead.
      </p>
    </div>
  )
}