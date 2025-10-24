const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Serviço para integração com Face++ API
 * Documentação: https://console.faceplusplus.com/documents/5679127
 */

const FACEPP_API_KEY = process.env.FACEPP_API_KEY || 'nRBLPOvOdJZRX8HqKrAo8kPOa9gxGEuK';
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET || 'FX_W8oS2FXrDIC0qJ3xQADHwFqwv_NhCHide';
const FACEPP_BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';

/**
 * Detecta uma face na imagem e retorna o face_token
 * @param {Buffer} imageBuffer - Imagem em formato buffer
 * @returns {Promise<{face_token: string, face_rectangle: object}>}
 */
async function detectFace(imageBuffer) {
    try {
        const form = new FormData();
        form.append('api_key', FACEPP_API_KEY);
        form.append('api_secret', FACEPP_API_SECRET);
        form.append('image_file', imageBuffer, { filename: 'face.jpg' });
        form.append('return_attributes', 'none'); // Não precisamos de atributos extras

        const response = await axios.post(`${FACEPP_BASE_URL}/detect`, form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        if (!response.data.faces || response.data.faces.length === 0) {
            throw new Error('Nenhuma face detectada na imagem');
        }

        // Retorna apenas a primeira face detectada
        const face = response.data.faces[0];
        return {
            face_token: face.face_token,
            face_rectangle: face.face_rectangle,
            image_id: response.data.image_id
        };
    } catch (error) {
        if (error.response) {
            throw new Error(`Face++ API Error: ${error.response.data.error_message || error.message}`);
        }
        throw new Error(`Erro ao detectar face: ${error.message}`);
    }
}

/**
 * Compara duas faces usando face_tokens
 * @param {string} faceToken1 - Token da primeira face
 * @param {string} faceToken2 - Token da segunda face
 * @returns {Promise<{confidence: number, thresholds: object, isMatch: boolean}>}
 */
async function compareFaces(faceToken1, faceToken2) {
    try {
        const form = new FormData();
        form.append('api_key', FACEPP_API_KEY);
        form.append('api_secret', FACEPP_API_SECRET);
        form.append('face_token1', faceToken1);
        form.append('face_token2', faceToken2);

        const response = await axios.post(`${FACEPP_BASE_URL}/compare`, form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        const confidence = response.data.confidence;
        const threshold = response.data.thresholds['1e-5']; // Threshold conservador

        return {
            confidence: confidence,
            thresholds: response.data.thresholds,
            isMatch: confidence > threshold,
            similarity_percentage: confidence.toFixed(2)
        };
    } catch (error) {
        if (error.response) {
            throw new Error(`Face++ API Error: ${error.response.data.error_message || error.message}`);
        }
        throw new Error(`Erro ao comparar faces: ${error.message}`);
    }
}

/**
 * Busca uma face em um FaceSet (grupo de faces)
 * Útil para verificar se a face já existe no sistema
 * @param {string} faceToken - Token da face a buscar
 * @param {string} faceSetToken - Token do FaceSet onde buscar
 * @returns {Promise<{results: array, isFound: boolean}>}
 */
async function searchFace(faceToken, faceSetToken) {
    try {
        const form = new FormData();
        form.append('api_key', FACEPP_API_KEY);
        form.append('api_secret', FACEPP_API_SECRET);
        form.append('face_token', faceToken);
        form.append('faceset_token', faceSetToken);

        const response = await axios.post(`${FACEPP_BASE_URL}/search`, form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        const results = response.data.results || [];
        const isFound = results.length > 0 && results[0].confidence > 80; // 80% de confiança

        return {
            results: results,
            isFound: isFound,
            best_match: results[0] || null
        };
    } catch (error) {
        if (error.response) {
            throw new Error(`Face++ API Error: ${error.response.data.error_message || error.message}`);
        }
        throw new Error(`Erro ao buscar face: ${error.message}`);
    }
}

/**
 * Cria um FaceSet para armazenar faces do sistema
 * @param {string} displayName - Nome do FaceSet
 * @param {string} outerIdPrefix - Prefixo para o outer_id (ex: "connect_gamers")
 * @returns {Promise<{faceset_token: string, outer_id: string}>}
 */
async function createFaceSet(displayName, outerIdPrefix = 'connect_gamers') {
    try {
        const form = new FormData();
        form.append('api_key', FACEPP_API_KEY);
        form.append('api_secret', FACEPP_API_SECRET);
        form.append('display_name', displayName);
        form.append('outer_id', `${outerIdPrefix}_${Date.now()}`);

        const response = await axios.post(`${FACEPP_BASE_URL}/faceset/create`, form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        return {
            faceset_token: response.data.faceset_token,
            outer_id: response.data.outer_id
        };
    } catch (error) {
        if (error.response) {
            throw new Error(`Face++ API Error: ${error.response.data.error_message || error.message}`);
        }
        throw new Error(`Erro ao criar FaceSet: ${error.message}`);
    }
}

/**
 * Adiciona uma face a um FaceSet
 * @param {string} faceToken - Token da face
 * @param {string} faceSetToken - Token do FaceSet
 * @returns {Promise<{face_added: number, face_count: number}>}
 */
async function addFaceToSet(faceToken, faceSetToken) {
    try {
        const form = new FormData();
        form.append('api_key', FACEPP_API_KEY);
        form.append('api_secret', FACEPP_API_SECRET);
        form.append('face_tokens', faceToken);
        form.append('faceset_token', faceSetToken);

        const response = await axios.post(`${FACEPP_BASE_URL}/faceset/addface`, form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        return {
            face_added: response.data.face_added,
            face_count: response.data.face_count,
            faceset_token: response.data.faceset_token
        };
    } catch (error) {
        if (error.response) {
            throw new Error(`Face++ API Error: ${error.response.data.error_message || error.message}`);
        }
        throw new Error(`Erro ao adicionar face ao FaceSet: ${error.message}`);
    }
}

/**
 * Remove uma face de um FaceSet
 * @param {string} faceToken - Token da face
 * @param {string} faceSetToken - Token do FaceSet
 * @returns {Promise<{face_removed: number}>}
 */
async function removeFaceFromSet(faceToken, faceSetToken) {
    try {
        const form = new FormData();
        form.append('api_key', FACEPP_API_KEY);
        form.append('api_secret', FACEPP_API_SECRET);
        form.append('face_tokens', faceToken);
        form.append('faceset_token', faceSetToken);

        const response = await axios.post(`${FACEPP_BASE_URL}/faceset/removeface`, form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        return {
            face_removed: response.data.face_removed,
            face_count: response.data.face_count
        };
    } catch (error) {
        if (error.response) {
            throw new Error(`Face++ API Error: ${error.response.data.error_message || error.message}`);
        }
        throw new Error(`Erro ao remover face do FaceSet: ${error.message}`);
    }
}

module.exports = {
    detectFace,
    compareFaces,
    searchFace,
    createFaceSet,
    addFaceToSet,
    removeFaceFromSet
};
