import React from "react";

import { Link } from "react-router";
import { Button } from "@mui/material";
import { useAtom } from "jotai";

import { userAtom } from "../state/user";

function Login() {
  const [user, setUser] = useAtom(userAtom);

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        Login with your @berkeley.edu email.
      </div>
      <Link to="/courses">
        <Button variant="contained">Login with Google</Button>
        <div>User is: {user}</div>
      </Link>
    </div>
  );
}

export default Login;
