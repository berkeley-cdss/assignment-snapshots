import React from "react";

import { Link } from "react-router";
import { Button } from "@mui/material";
import { useAtomValue } from "jotai";

import { userAtom } from "../state/atoms";

function Login() {
  const user = useAtomValue(userAtom);

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        Login with your @berkeley.edu email. User is: {user}
      </div>
      <Link to="/courses">
        <Button variant="contained">Login with Google</Button>
      </Link>
    </div>
  );
}

export default Login;
