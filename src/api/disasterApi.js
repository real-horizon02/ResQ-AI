// Disaster API calls
export const fetchDisasters = async () => {
  const res = await fetch("http://localhost:5000/api/disasters");
  return await res.json();
};

export const fetchFireDisasters = fetchDisasters;