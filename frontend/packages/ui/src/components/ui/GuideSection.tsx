import { useState } from "react";

const steps = [
  {
    title: "Upload",
    desc: "Upload your photo or PDF to get started.",
  },
  {
    title: "Choose Voice",
    desc: "Select language, tone, and voice style.",
  },
  {
    title: "Generate",
    desc: "AI creates your talking avatar instantly.",
  },
  {
    title: "Export",
    desc: "Download or share your final video.",
  },
  {
    title: "Demo Video",
    desc: "Watch the demo video to see how it works.",
  },
];

export default function GuideSection() {
  const [active, setActive] = useState(0);

  return (
    <>
      <style>{`
        .guide {
          height: 100vh;
          background: #5F9598;

          padding: 80px 60px;

          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          align-items: center;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 18px;
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
          background: #061E29;
          color: #F3F4F4;

          border-radius: 20px;
          padding: 40px;

          min-height: 320px;

          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;

          transition: all 0.4s ease;
        }

        .preview-content {
          max-width: 320px;
        }

        .preview-title {
          font-size: 22px;
          margin-bottom: 12px;
        }

        .preview-desc {
          font-size: 14px;
        }

        @media (max-width: 900px) {
          .guide {
            grid-template-columns: 1fr;
            height: auto;
            padding: 60px 20px;
          }
        }
      `}</style>

<section id="guide" className="guide">        {/* LEFT: Steps */}
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
          <div className="preview-content">
            <div className="preview-title">{steps[active].title}</div>
            <div className="preview-desc">{steps[active].desc}</div>
          </div>
        </div>
      </section>
    </>
  );
}