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
    let errorMessage = "Erro ao enviar dados para " + endpoint;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
        if (errorData.mensagem) {
          errorMessage += " - " + errorData.mensagem;
        }
        if (errorData.usuariosInvalidos) {
          errorMessage += " - Usuários inválidos: " + errorData.usuariosInvalidos.join(', ');
        }
      }
    } catch (parseError) {
      // Se não conseguir fazer parse do JSON, usar mensagem padrão
    }
    throw new Error(errorMessage);
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