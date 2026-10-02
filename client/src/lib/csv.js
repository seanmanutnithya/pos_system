// Spreadsheet apps run a cell that starts with one of these as a formula, so
// such cells get a leading ' to keep them as plain text
const FORMULA_START = /^[=+\-@\t\r]/;

const escapeCell = (value) => {
  let text = value == null ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

// columns: [{ header, value(row) }]
export const toCsv = (rows, columns) =>
  [
    columns.map((column) => escapeCell(column.header)),
    ...rows.map((row) => columns.map((column) => escapeCell(column.value(row)))),
  ]
    .map((cells) => cells.join(","))
    .join("\r\n");

export const downloadCsv = (filename, rows, columns) => {
  // The byte order mark makes Excel open the file as UTF-8
  const blob = new Blob(["﻿", toCsv(rows, columns)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
