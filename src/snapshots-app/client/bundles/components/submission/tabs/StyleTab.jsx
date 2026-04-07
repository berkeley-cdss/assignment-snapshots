import React, { useRef, useState, useMemo } from "react";

import FileViewer from "../FileViewer";


function StyleTab({ lintErrors = [], code, language, lightMode }) {
  const editorRef = useRef(null);
  const [expandedCodes, setExpandedCodes] = useState(new Set()); //for accordions
  const [sortBy, setSortBy] = useState("frequency"); // defaults to sort by frequency
  const [filterCode, setFilterCode] = useState(null); // null = show all

  // group lint errors by code, sorted by frequency desc
  const groupedErrors = useMemo(() => {
    const groups = {};
    for (const error of lintErrors) {
      if (!groups[error.code]) {
        groups[error.code] = { code: error.code, message: error.message, errors: [] };
      }
      groups[error.code].errors.push(error);
    }

    // sort groups based on sortBy value
    const sorted = Object.values(groups);
    if (sortBy === "frequency") {
      sorted.sort((a, b) => b.errors.length - a.errors.length);
    } else {
      sorted.sort((a, b) => a.code.localeCompare(b.code));
    }

    return sorted;
  }, [lintErrors, sortBy]);

  const visibleGroups = filterCode
    ? groupedErrors.filter((g) => g.code === filterCode)
    : groupedErrors;

  function toggleAccordion(code) {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }



  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* left sidebar */}
      <div style={{ width: "33%", overflowY: "auto", borderRight: "1px solid #ccc", padding: "1rem" }}>
        {/* sort/filter controls placeholder */}
        <div style={{ marginBottom: "1rem" }}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="frequency">Sort: Most Frequent</option>
            <option value="code">Sort: Code A–Z</option>
          </select>
          {filterCode && (
            <button onClick={() => setFilterCode(null)}>Clear Filter</button>
          )}
        </div>

        {/* insert accordions */}
        
      </div>


      <div style={{ width: "67%", padding: "1rem" }}>
        {/* placeholder for FileViewer */}
      </div>
    </div>
  );
}

export default StyleTab;