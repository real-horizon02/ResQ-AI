export const parseCSV = (csvText) => {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    let obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = values[i];
    });

    return obj;
  });
};