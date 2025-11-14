import React from "react";

import { Link } from "react-router";

function TableCellNavLink({ pathname, children }) {
  return (
    <Link
      to={{ pathname: pathname }}
      style={{
        color: "#1976d2",
        cursor: "pointer",
        textDecoration: "underline",
      }}
    >
      {children}
    </Link>
  );
}

export default TableCellNavLink;
