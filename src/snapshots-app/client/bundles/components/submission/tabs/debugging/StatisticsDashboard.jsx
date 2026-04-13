import React, { useMemo } from "react";

import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

import InfoTooltip from "../../../common/InfoTooltip";

const Histogram = ({ title, tooltip, xLabels, studentValue, data }) => {
  /**
   * Finds the correct xLabel bin for a given student value.
   * @param {number} value - The student's numerical score.
   * @param {string[]} labels - Array of bin strings (e.g., ["0-10", "50+"])
   * @returns {string|null} - The matching bin string.
   */
  const findBin = (value, labels) => {
    return (
      labels.find((label) => {
        // Handle the "50+" or "100+" case
        if (label.includes("+")) {
          const floor = parseFloat(label.replace("+", ""));
          return value >= floor;
        }

        // Handle ranges like "10-20"
        const [min, max] = label.split("-").map(Number);

        // Standard histogram logic: inclusive of min, exclusive of max [min, max)
        return value >= min && value < max;
      }) || null
    );
  };

  const studentBin = useMemo(
    () => findBin(studentValue, xLabels),
    [studentValue, xLabels],
  );

  console.log("student bin:", studentBin);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <InfoTooltip info={tooltip} />
      </Box>
      <BarChart
        xAxis={[
          {
            scaleType: "band",
            data: xLabels,
            colorMap: {
              type: "ordinal",
              values: xLabels,
              // If the label matches the studentValue, turn it red; otherwise, use default blue
              colors: xLabels.map((bin) =>
                bin === studentBin ? "red" : "blue",
              ),
            },
          },
        ]}
        series={[{ data }]}
        height={300}
      />
    </Box>
  );
};

const StatisticsDashboard = ({
  title,
  tooltip,
  xLabels,
  studentValue,
  data,
}) => {
  // Calculate the stats based on the full dataset
  const stats = useMemo(() => {
    const values = data.sort((a, b) => a - b);
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
        <Histogram
          title={title}
          tooltip={tooltip}
          xLabels={xLabels}
          studentValue={studentValue}
          data={data}
        />
      </div>
    </div>
  );
};

export default StatisticsDashboard;
