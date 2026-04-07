import React, { useState } from "react";

function SummaryTab({}) {
  const items = [
    { id: 1, text: "Statistic 1" },
    { id: 2, text: "Statistic 2" },
    { id: 3, text: "Statistic 3" },
  ];
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display: "flex", gap: "16px", padding: "16px" }}>
      <aside
        style={{ flex: 1, padding: "16px", borderRight: "1px solid #ddd" }}
      >
        <h3 style={{ fontSize: "1.5rem" }}>Stats</h3>
        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          {items.map((item) => (
            <li
              key={item.id}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderRadius: "4px",
                backgroundColor:
                  hovered === item.id ? "#f0f0f0" : "transparent",
              }}
            >
              {item.text}
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, padding: "16px", borderRight: "1px solid #ddd" }}>
        <h3 style={{ fontSize: "1.5rem" }}>Current Stat</h3>
        <p>display a graph</p>
      </main>

      <aside style={{ flex: 1, padding: "16px" }}>
        <h3 style={{ fontSize: "1.5rem" }}>Stat Summary</h3>
        <p> Radar chart </p>
      </aside>
    </div>
  );
}

export default SummaryTab;
