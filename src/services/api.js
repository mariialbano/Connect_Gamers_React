export const postItem = async (endpoint, data) => {
  const response = await fetch(`http://localhost:3001/squads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar dados para " + endpoint);
  }

  return response.json();
};
