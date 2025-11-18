import React from "react";

import { Tooltip } from "@mui/material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";

function InfoTooltip({ info, placement }) {
  return (
    <Tooltip title={info} placement={placement ? placement : "auto"}>
      <InfoOutlineIcon color="info" fontSize="small" />
    </Tooltip>
  );
}

export default InfoTooltip;
