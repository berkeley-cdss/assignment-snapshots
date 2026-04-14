import React, { useMemo } from "react";

import { Box, Typography } from "@mui/material";
import { Chart } from "react-google-charts";

import InfoTooltip from "../../../common/InfoTooltip";

const Histogram = ({ title, tooltip, data }) => {
  const options = {
    histogram: {
      bucketSize: 10,
      minValue: 0,
      maxValue: 50,

    }, 
    
    hAxis: {
      // manually sets the scale of the X-axis
      viewWindow: {
        min: 0,
        max: 50,
      }
    },
    legend: { position: "none" },
    
  };
  

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <InfoTooltip info={tooltip} />
      </Box>

      <Chart
        chartType="Histogram"
        width="100%"
        height="100%"
        data={data}
        options={options}
      />
    </Box>
  );
};



const ScoreDashboard = ({ title, tooltip, studentValue, data }) => {
  // Calculate the stats based on the full dataset
  const stats = useMemo(() => {
    const values = data
      .slice(1)
      .map((row) => row[1])
      .sort((a, b) => a - b);
    const n = values.length;

    if (n === 0) return null;

    const min = values[0];
    const max = values[n - 1];
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const median =
      n % 2 === 0
        ? (values[n / 2 - 1] + values[n / 2]) / 2
        : values[Math.floor(n / 2)];

    const stdDev = Math.sqrt(
      values.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n,
    );

    return { min, max, mean, median, stdDev };
  }, [data]);

  

  return (
    <div
      className="stat-container"
      style={{ marginBottom: "20px", fontFamily: "sans-serif" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          background: "#f4f4f9",
          borderRadius: "8px",
          marginBottom: "10px",
          fontSize: "0.9rem",
        }}
      >
        <div>
          <strong>Student:</strong> {studentValue}
        </div>
        <div>
          <strong>Min:</strong> {stats.min.toFixed(2)}
        </div>
        <div>
          <strong>Mean:</strong> {stats.mean.toFixed(2)}
        </div>
        <div>
          <strong>Median:</strong> {stats.median.toFixed(2)}
        </div>
        <div>
          <strong>Max:</strong> {stats.max.toFixed(2)}
        </div>
        <div>
          <strong>Std Dev:</strong> {stats.stdDev.toFixed(2)}
        </div>
      </div>

      <div className="chart-placeholder">
        <Histogram title={title} tooltip={tooltip} data={data} />
      </div>
    </div>
  );
};

export default ScoreDashboard;
