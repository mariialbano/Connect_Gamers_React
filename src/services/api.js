export const postItem = async (endpoint, data) => {
  const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
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
  const response = await fetch(`http://localhost:5000/api/${endpoint}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados de " + endpoint);
  }
  return response.json();
};

export const patchItem = async (endpoint, id, data) => {
  const response = await fetch(`http://localhost:5000/api/${endpoint}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar dados em " + endpoint);
  }

  return response.json();
};
