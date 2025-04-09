import React from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import ErrorIcon from "@mui/icons-material/Error";
import DoneIcon from "@mui/icons-material/Done";
import LoopIcon from "@mui/icons-material/Loop";

type ButtonVariant = "outlined" | "contained" | "text";

function Timeline() {
  // TODO how to generalize this? array of variants?
  const [variant0, setVariant0] = React.useState<ButtonVariant>("outlined");
  const [variant1, setVariant1] = React.useState<ButtonVariant>("outlined");
  const [variant2, setVariant2] = React.useState<ButtonVariant>("contained");

  const handleClick0 = () => {
    setVariant0((prevVariant) =>
      prevVariant === "contained" ? "outlined" : "contained"
    );
    setVariant1("outlined");
    setVariant2("outlined");
  };

  const handleClick1 = () => {
    setVariant0("outlined");
    setVariant1((prevVariant) =>
      prevVariant === "contained" ? "outlined" : "contained"
    );
    setVariant2("outlined");
  };

  const handleClick2 = () => {
    setVariant0("outlined");
    setVariant1("outlined");
    setVariant2((prevVariant) =>
      prevVariant === "contained" ? "outlined" : "contained"
    );
  };

  const buttons = [
    <Button variant={variant0} onClick={handleClick0} key="one">
      04/09/25 09:00 AM PST <ErrorIcon sx={{ marginLeft: "10px" }} />
    </Button>,
    <Button variant={variant1} onClick={handleClick1} key="two">
      04/09/25 10:00 AM PST <LoopIcon sx={{ marginLeft: "10px" }} />
    </Button>,
    <Button variant={variant2} onClick={handleClick2} key="three">
      04/09/25 11:00 AM PST <DoneIcon sx={{ marginLeft: "10px" }} />
    </Button>,
  ];

  return (
    <div>
      <h2>Timeline</h2>
      <ButtonGroup orientation="vertical" aria-label="Vertical button group">
        {buttons}
      </ButtonGroup>
    </div>
  );
}

export default Timeline;
