import { useState } from "react"

const steps = [
  {
    title: "Upload Portrait",
    desc: "Start by uploading a portrait photo or capturing one from your device.",
    images: ["/guide_photos/guide1.png"],
  },
  {
    title: "Choose Background",
    desc: "Open the background picker and choose a scene from the curated categories.",
    images: [
      "/guide_photos/guide2.png",
      "/guide_photos/guide3.png",
    ],
  },
  {
    title: "Write the Message",
    desc: "Type the script your avatar should speak before generating the video.",
    images: ["/guide_photos/guide4.png"],
  },
  {
    title: "Choose the Voice",
    desc: "Select the speaker and language that best match your final output.",
    images: ["/guide_photos/guide5.png"],
  },
  {
    title: "Generate Video",
    desc: "Click generate to create the final talking avatar from your settings.",
    images: ["/guide_photos/guide6.png"],
  },
  {
    title: "Download Result",
    desc: "Once the video is ready, download it directly from the preview area.",
    images: ["/guide_photos/guide7.png"],
  },
]

export default function GuideSection() {
  const [active, setActive] = useState(0)

  return (
    <>
      <style>{`
        .guide {
          min-height: 100vh;
          background: #5F9598;
          padding: 80px 60px;
          display: grid;
          grid-template-columns: minmax(280px, 0.92fr) minmax(420px, 1.35fr);
          gap: 40px;
          align-items: start;
        }

        .guide-intro {
          grid-column: 1 / -1;
          max-width: 760px;
          margin-bottom: 8px;
        }

        .guide-kicker {
          margin: 0 0 10px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(243, 244, 244, 0.82);
        }

        .guide-heading {
          margin: 0 0 12px;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.04;
          color: #061E29;
          font-weight: 800;
        }

        .guide-subtitle {
          margin: 0;
          max-width: 620px;
          font-size: 15px;
          line-height: 1.7;
          color: rgba(6, 30, 41, 0.84);
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding-top: 6px;
        }

        .step {
          padding: 16px 18px;
          border-radius: 14px;
          cursor: pointer;

          background: #F3F4F4;
          color: #061E29;

          transition: all 0.3s ease;

          box-shadow: 0 4px 10px rgba(6, 30, 41, 0.1);
        }

        .step.active {
          background: #061E29;
          color: #F3F4F4;
        }

        .step:hover {
          background: #1D546D;
          color: #F3F4F4;
        }

        .step-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .step-desc {
          font-size: 13px;
        }

        .preview {
          position: sticky;
          top: 88px;
          background: #061E29;
          color: #F3F4F4;
          border-radius: 20px;
          padding: 22px;
          transition: all 0.4s ease;
          box-shadow: 0 18px 40px rgba(6, 30, 41, 0.18);
          align-self: start;
        }

        .preview-image-wrap {
          border-radius: 16px;
          overflow: hidden;
          background: rgba(243, 244, 244, 0.06);
          border: 1px solid rgba(243, 244, 244, 0.08);
        }

        .preview-gallery {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .preview-gallery.dual {
          grid-template-columns: 1fr 1fr;
        }

        .preview-image {
          width: 100%;
          height: auto;
          display: block;
        }

        @media (max-width: 900px) {
          .guide {
            grid-template-columns: 1fr;
            padding: 60px 20px;
          }

          .preview {
            position: static;
          }

          .preview-gallery.dual {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section id="guide" className="guide">
        <div className="guide-intro">
          <p className="guide-kicker">How It Works</p>
          <h2 className="guide-heading">Create your avatar in a few guided steps</h2>
          <p className="guide-subtitle">
            Follow the product flow from portrait upload to final download, with each screen shown exactly in sequence.
          </p>
        </div>

        {/* LEFT: Steps */}
        <div className="steps">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`step ${active === i ? "active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
        {/* RIGHT: Preview */}
        <div className="preview">
          <div className={`preview-gallery ${steps[active].images.length > 1 ? "dual" : ""}`}>
            {steps[active].images.map((image, index) => (
              <div className="preview-image-wrap" key={image}>
                <img
                  className="preview-image"
                  src={image}
                  alt={`${steps[active].title} ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
