export const postItem = async (endpoint, data) => {
  const response = await fetch(`http://localhost:3001/${endpoint}`, {
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

export const getItem = async (endpoint) => {
  const response = await fetch(`http://localhost:3001/${endpoint}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados de " + endpoint);
  }
  return response.json();
};
