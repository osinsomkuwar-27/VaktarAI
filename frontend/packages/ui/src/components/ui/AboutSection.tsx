const features = [
  {
    title: "Avatar Creation",
    body: "Upload a portrait, choose a background, and turn it into a speaking avatar.",
  },
  {
    title: "Voice & Language",
    body: "Pick a voice and language to shape how your avatar sounds.",
  },
  {
    title: "Document to Video",
    body: "Use summarized document content to generate avatar-led explainers faster.",
  },
  {
    title: "Avatar Chat",
    body: "Chat with your avatar experience in a guided interface for more interactive conversations and demos.",
  },
]

function AboutSection() {
  return (
    <section id="about" className="w-full bg-[#F3F4F4] py-18 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5F9598]">
            About VaktarAI
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-[#061E29] md:text-5xl">
            One simple workspace for creating talking avatars.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#1D546D]">
            VaktarAI combines portrait animation, voice generation, and guided editing into a clean flow that helps you move from input to final video quickly.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title, body }) => (
            <article
              key={title}
              className="rounded-[24px] border border-[#5F9598]/18 bg-white p-6 shadow-[0_14px_32px_rgba(6,30,41,0.06)]"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-[#061E29]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#1D546D]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export { AboutSection }
