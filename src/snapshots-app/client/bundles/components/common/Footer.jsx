import React from "react";

import { Link } from "@mui/material";

function Footer() {
  return (
    <div
      style={{
        // position: "fixed",
        bottom: 0,
        width: "100%",
        color: "#808080",
        background: "#fff",
        padding: "1rem",
        borderTop: "1px solid #eee",
        fontSize: "0.95rem",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span style={{ flex: 1, textAlign: "left" }}>
        Copyright &copy; {new Date().getFullYear()} Regents of the University of
        California and respective authors.
      </span>
      {/* TODO why does this go off to page to the right? */}
      <span style={{ flex: 1, textAlign: "right" }}>
        This app is a{" "}
        <Link href="https://github.com/berkeley-cdss">Seamless Learning</Link>{" "}
        project. Edit it on{" "}
        <Link href="https://github.com/berkeley-cdss/assignment-snapshots">
          GitHub
        </Link>
        .
      </span>
    </div>
  );
}

export default Footer;
