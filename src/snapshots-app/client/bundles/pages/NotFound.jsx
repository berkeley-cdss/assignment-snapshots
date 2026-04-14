import React, { useEffect } from "react";

// this just redirects to react on rails 404.html page
function NotFound() {
  useEffect(() => {
    // This forces a full browser reload to the static file
    window.location.replace("/404.html");
  }, []);

  return null; // Render nothing while redirecting
}

export default NotFound;