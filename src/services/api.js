import { API_BASE } from './apiBase';

export const postItem = async (endpoint, data) => {
  const response = await fetch(`${API_BASE}/api/${endpoint}`, {
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
  const response = await fetch(`${API_BASE}/api/${endpoint}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados de " + endpoint);
  }
  return response.json();
};

export const patchItem = async (endpoint, id, data) => {
  const response = await fetch(`${API_BASE}/api/${endpoint}/${id}`, {
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
