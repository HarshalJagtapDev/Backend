const XLSX = require("xlsx-js-style");

function applyStyles(ws) {
  if (!ws["!ref"]) return;

  const range = XLSX.utils.decode_range(ws["!ref"]);

  const headerStyle = {
    font: {
      bold: true,
      color: { rgb: "FFFFFF" },
    },
    fill: {
      fgColor: { rgb: "4472C4" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  const summaryHeaderStyle = {
    font: {
      bold: true,
      color: { rgb: "000000" },
    },
    fill: {
      fgColor: { rgb: "C6EFCE" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  const completedRowStyle = {
    font: {
      bold: true,
      color: { rgb: "FFFFFF" },
    },
    fill: {
      fgColor: { rgb: "548235" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  const noLPStyle = {
    fill: {
      fgColor: { rgb: "FFF2CC" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  const cellStyle = {
    alignment: {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  // ---------------------------------------
  // Find LP Given column dynamically
  // ---------------------------------------

  let lpColumnIndex = null;

  for (let C = range.s.c; C <= range.e.c; C++) {
    for (let R = range.s.r; R <= Math.min(range.e.r, 20); R++) {
      const cellRef = XLSX.utils.encode_cell({
        r: R,
        c: C,
      });

      if (
        ws[cellRef] &&
        ws[cellRef].v === "LP given"
      ) {
        lpColumnIndex = C;
        break;
      }
    }

    if (lpColumnIndex !== null) break;
  }

  // ---------------------------------------
  // Find Summary Sheet Column Indexes
  // ---------------------------------------

  let initiatedCol = null;
  let completedCol = null;

  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellRef = XLSX.utils.encode_cell({
      r: 0,
      c: C,
    });

    const value = ws[cellRef]?.v;

    if (value === "Initiated")
      initiatedCol = C;

    if (value === "Completed")
      completedCol = C;
  }

  // ---------------------------------------
  // Apply styles
  // ---------------------------------------

  for (let R = range.s.r; R <= range.e.r; R++) {
    let isNoLPRow = false;
    let isCompletedRow = false;

    if (lpColumnIndex !== null) {
      const lpCellRef =
        XLSX.utils.encode_cell({
          r: R,
          c: lpColumnIndex,
        });

      const lpValue = (
        ws[lpCellRef]?.v || ""
      )
        .toString()
        .trim()
        .toUpperCase();

      isNoLPRow =
        lpValue === "NA" ||
        lpValue === "N/A";
    }

    if (
      initiatedCol !== null &&
      completedCol !== null
    ) {
      const initiatedCell =
        XLSX.utils.encode_cell({
          r: R,
          c: initiatedCol,
        });

      const completedCell =
        XLSX.utils.encode_cell({
          r: R,
          c: completedCol,
        });

      const initiated =
        Number(
          ws[initiatedCell]?.v || 0
        );

      const completed =
        Number(
          ws[completedCell]?.v || 0
        );

      if (
        initiated > 0 &&
        initiated === completed
      ) {
        isCompletedRow = true;
      }
    }

    const firstCellRef =
      XLSX.utils.encode_cell({
        r: R,
        c: 0,
      });

    const firstCellValue =
      ws[firstCellRef]?.v;

    const isNormalHeader =
      firstCellValue ===
      "Harbinger Business Unit";

    const isSummaryHeader =
      firstCellValue === "Groups";

    for (
      let C = range.s.c;
      C <= range.e.c;
      C++
    ) {
      const cellRef =
        XLSX.utils.encode_cell({
          r: R,
          c: C,
        });

      if (!ws[cellRef]) continue;

      if (isSummaryHeader) {
        ws[cellRef].s =
          summaryHeaderStyle;
      } else if (isNormalHeader) {
        ws[cellRef].s =
          headerStyle;
      } else if (isCompletedRow) {
        ws[cellRef].s =
          completedRowStyle;
      } else if (isNoLPRow) {
        ws[cellRef].s =
          noLPStyle;
      } else {
        ws[cellRef].s =
          cellStyle;
      }
    }
  }

  // ---------------------------------------
  // Auto width
  // ---------------------------------------

  ws["!cols"] = [];

  for (
    let C = range.s.c;
    C <= range.e.c;
    C++
  ) {
    ws["!cols"].push({
      wch: 30,
    });
  }
}

function writeAOASheet(
  workbook,
  sheetName,
  data
) {
  const worksheet =
    XLSX.utils.aoa_to_sheet(data);

  applyStyles(worksheet);

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName
  );
}

function readExcel(filePath) {
  const workbook = XLSX.readFile(filePath);

  const sheetName = workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  return data.filter(row => {
    return Object.values(row).some(val => {
      if (val === undefined || val === null) return false;
      if (typeof val === 'string' && val.trim() === '') return false;
      return true;
    });
  });
}

function writeWorkbook(outputPath, sheets) {
  const workbook = XLSX.utils.book_new();

  for (const [sheetName, data] of Object.entries(sheets)) {
    const worksheet =
      XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sheetName
    );
  }

  XLSX.writeFile(workbook, outputPath);
}

module.exports = {
  readExcel,
  writeWorkbook,
  writeAOASheet,
  applyStyles
};





