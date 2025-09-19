import { Link, useLocation } from "react-router";
import BreadcrumbNav from "./BreadcrumbNav";

function Header() {
  const berkeleyBlue = "#002676";

  return (
    <div style={{ position: "sticky", top: 0, width: "100%", zIndex: 1000 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          color: "#fff",
          background: berkeleyBlue,
          borderBottom: "1px solid #eee",
          padding: "1rem",
          fontWeight: "bold",
        }}
      >
        <div
          style={{
            flex: 2,
          }}
        >
          Assignment Snapshots
        </div>
        {useLocation().pathname !== "/" && (
          <Link style={{ flex: 1, color: "white", textAlign: "right" }} to="/">
            Log Out
          </Link>
        )}
      </div>
      {useLocation().pathname !== "/" && <BreadcrumbNav />}
    </div>
  );
}

export default Header;
