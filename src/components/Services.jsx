import React from "react";

const services = [
  {
    id: 1,
    name: "Classic Haircut",
    description: "A clean and professional haircut tailored to your style.",
    price: 120,
    duration: "30 min",
    icon: "✂️",
  },
  {
    id: 2,
    name: "Fade",
    description: "A sharp fade with clean lines and a smooth finish.",
    price: 140,
    duration: "40 min",
    icon: "💈",
  },
  {
    id: 3,
    name: "Haircut + Beard",
    description: "Complete haircut and beard trim for a fresh look.",
    price: 160,
    duration: "50 min",
    icon: "🧔",
  },
  {
    id: 4,
    name: "Beard Trim",
    description: "Shape, trim and line up your beard professionally.",
    price: 70,
    duration: "20 min",
    icon: "🪒",
  },
  {
    id: 5,
    name: "Kids Haircut",
    description: "A stylish and comfortable haircut for kids.",
    price: 100,
    duration: "30 min",
    icon: "👦",
  },
  {
    id: 6,
    name: "VIP Cut",
    description: "The full Elite Cuts experience with premium styling.",
    price: 200,
    duration: "60 min",
    icon: "👑",
  },
];

function Services({ onBook }) {
  return (
    <section className="services" id="services">
      <div className="services-header">
        <p className="section-subtitle">OUR SERVICES</p>

        <h2>
          Look Sharp.
          <span> Feel Confident.</span>
        </h2>

        <p className="services-intro">
          Choose from our professional barbering services and book your
          appointment in just a few clicks.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.id}>
            <div className="service-icon">{service.icon}</div>

            <h3>{service.name}</h3>

            <p className="service-description">
              {service.description}
            </p>

            <div className="service-details">
              <span>{service.duration}</span>

              <strong>R{service.price}</strong>
            </div>

            <button
              className="book-service-btn"
              onClick={() => onBook(service)}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;