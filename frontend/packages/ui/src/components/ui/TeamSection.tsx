export default function TeamSection() {
  const team = [
    { name: "Bhargavi Tambe", image: "/Team/Bhargavi.jpeg" },
    { name: "Kshitij Kumavat", image: "/Team/Kshitij.jpeg" },
    { name: "Osin Somkuwar", image: "/Team/Tanishka.jpeg" },
    { name: "Shreeja Mahale", image: "/Team/Shreeja.jpeg" },
    { name: "Soham Yeola", image: "/Team/Soham.jpeg" },
    { name: "Tanishka Gadilkar", image: "/Team/Tanishka.jpeg" },
  ];

  return (
    <>
      <style>{`
        .team {
          min-height: 100vh;
          background: #F3F4F4;
          padding: 100px 60px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 60px;
        }

        .team-heading {
          font-size: 40px;
          font-family: 'Cormorant Garamond', serif;
          color: #061E29;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 60px; /* increased spacing */
        }

        .member {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px; /* increased spacing */
          transition: transform 0.3s ease;
        }

        .member:hover {
          transform: translateY(-6px);
        }

        .avatar {
          width: 160px; /* increased size */
          height: 160px;
          border-radius: 50%;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .name {
          font-weight: 600;
          color: #061E29;
          font-size: 16px;
        }

        @media (max-width: 900px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <section id="people" className="team">
        <h2 className="team-heading">Meet the Team</h2>

        <div className="team-grid">
          {team.map((member, i) => (
            <div key={i} className="member">
              <div className="avatar">
                <img src={member.image} alt={member.name} />
              </div>

              <div className="name">{member.name}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}