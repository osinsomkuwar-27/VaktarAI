export default function TeamSection() {
  const team = [
    { name: "Bhargavi Tambe", image: "/Team/Bhargavi.jpeg" },
    { name: "Kshitij Kumavat", image: "/Team/Kshitij.jpeg" },
    { name: "Osin Somkuwar", image: "/Team/osin.jpeg" },
    { name: "Shreeja Mahale", image: "/Team/Shreeja.jpeg" },
    { name: "Soham Yeola", image: "/Team/Soham.jpeg" },
    { name: "Tanishka Gadilkar", image: "/Team/Tanishka.jpeg" },
  ]

  return (
    <>
      <style>{`
        .team {
          min-height: 100vh;
          background: #5F9598;
          padding: 96px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 48px;
        }

        .team-copy {
          max-width: 720px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .team-kicker {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 12px;
          font-weight: 700;
          color: #061E29;
        }

        .team-heading {
          margin: 0;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.05;
          font-family: 'Cormorant Garamond', serif;
          color: #061E29;
        }

        .team-subtitle {
          margin: 0 auto;
          max-width: 620px;
          font-size: 15px;
          line-height: 1.7;
          color: #1D546D;
        }

        .team-grid {
  width: min(720px, 100%);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px 0px;
}

        .member {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          transition: transform 0.28s ease;
        }

        .member:hover {
          transform: translateY(-6px);
        }

        .avatar-shell {
          width: 168px;
          height: 168px;
          border-radius: 999px;
          padding: 6px;
          background: #F3F4F4;
          border: 1px solid rgba(95, 149, 152, 0.24);
          box-shadow: inset 0 0 0 1px rgba(29, 84, 109, 0.06);
        }

        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 999px;
          overflow: hidden;
          background: #5F9598;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .member-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
          max-width: 220px;
        }

        .name {
          margin: 0;
          font-weight: 700;
          color: #061E29;
          font-size: 18px;
          line-height: 1.3;
        }

        .role-chip {
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(95, 149, 152, 0.14);
          color: #1D546D;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        @media (max-width: 980px) {
          .team {
            padding: 72px 24px;
          }

          .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .team-grid {
            grid-template-columns: 1fr;
          }

          .avatar-shell {
            width: 152px;
            height: 152px;
          }
        }
      `}</style>

      <section id="people" className="team">
        <div className="team-copy">
          <p className="team-kicker">People Behind Vaktar AI</p>
          <h2 className="team-heading">Meet the Team</h2>
        </div>

        <div className="team-grid">
          {team.map((member, i) => (
            <div key={i} className="member">
              <div className="avatar-shell">
                <div className="avatar">
                  <img src={member.image} alt={member.name} />
                </div>
              </div>

              <div className="member-meta">
                <p className="name">{member.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
