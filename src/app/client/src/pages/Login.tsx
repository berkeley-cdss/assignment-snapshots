import React from "react";

import { Link } from "react-router";
import { Button } from "@mui/material";

function Login() {
  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        Login with your @berkeley.edu email.
      </div>
      <Link to="/courses">
        <Button variant="contained">Login with Google</Button>
      </Link>
    </div>
  );
}

export default Login;
