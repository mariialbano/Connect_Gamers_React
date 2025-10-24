const axios = require('axios');
const crypto = require('crypto');

class AzureFaceService {
    constructor() {
        this.endpoint = process.env.AZURE_FACE_ENDPOINT;
        this.subscriptionKey = process.env.AZURE_FACE_SUBSCRIPTION_KEY;
        this.devMode = String(process.env.FACE_DEV_MODE || '').toLowerCase() === 'true';
        
        if (!this.endpoint || !this.subscriptionKey) {
            console.error('AVISO: Configurações do Azure Face API não encontradas no .env');
            if (this.devMode) {
                console.warn('FACE_DEV_MODE está habilitado. Usando fallback local para detecção/validação facial (apenas desenvolvimento).');
            }
        }
        
        this.apiVersion = '1.0';
        this.detectUrl = `${this.endpoint}/face/v${this.apiVersion}/detect`;
        this.verifyUrl = `${this.endpoint}/face/v${this.apiVersion}/verify`;
    }

    /**
     * Detecta rostos em uma imagem
     * @param {Buffer} imageBuffer - Buffer da imagem
     * @returns {Object} - Resultado da detecção
     */
    async detectFace(imageBuffer) {
        try {
            // Fallback de desenvolvimento quando habilitado (independente das credenciais)
            if (this.devMode) {
                // Gera um faceId determinístico baseado no hash da imagem
                const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex').slice(0, 32);
                const fakeFace = {
                    faceId: `dev_${hash}`,
                    faceRectangle: { top: 0, left: 0, width: 100, height: 100 },
                    faceAttributes: { confidence: 0.99 }
                };
                return { success: true, faces: [fakeFace], count: 1 };
            }

            if (!this.endpoint || !this.subscriptionKey) {
                throw new Error('Configurações do Azure Face API não encontradas');
            }

            const response = await axios.post(
                this.detectUrl,
                imageBuffer,
                {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey
                    },
                    params: {
                        returnFaceId: true,
                        returnFaceLandmarks: false,
                        returnFaceAttributes: 'age,gender,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
                    },
                    timeout: 30000 // 30 segundos de timeout
                }
            );

            if (response.status === 200) {
                return {
                    success: true,
                    faces: response.data,
                    count: response.data.length
                };
            } else {
                throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
            }

        } catch (error) {
            console.error('Erro na detecção facial:', error.message);
            
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
                return {
                    success: false,
                    error: error.response.data.error?.message || 'Erro na API do Azure',
                    status: error.response.status,
                    faces: []
                };
            }

            return {
                success: false,
                error: error.message,
                faces: []
            };
        }
    }

    /**
     * Verifica se dois rostos são da mesma pessoa
     * @param {string} faceId1 - ID do primeiro rosto
     * @param {string} faceId2 - ID do segundo rosto
     * @returns {Object} - Resultado da verificação
     */
    async verifyFaces(faceId1, faceId2) {
        try {
            // Fallback de desenvolvimento: compara igualdade simples dos faceIds
            if (this.devMode) {
                const isIdentical = String(faceId1) === String(faceId2);
                return {
                    success: true,
                    isIdentical,
                    confidence: isIdentical ? 0.99 : 0.0
                };
            }

            if (!this.endpoint || !this.subscriptionKey) {
                throw new Error('Configurações do Azure Face API não encontradas');
            }

            const requestBody = {
                faceId1: faceId1,
                faceId2: faceId2
            };

            const response = await axios.post(
                this.verifyUrl,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey
                    },
                    timeout: 30000 // 30 segundos de timeout
                }
            );

            if (response.status === 200) {
                const result = response.data;
                return {
                    success: true,
                    isIdentical: result.isIdentical,
                    confidence: result.confidence
                };
            } else {
                throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
            }

        } catch (error) {
            console.error('Erro na verificação facial:', error.message);
            
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
                return {
                    success: false,
                    error: error.response.data.error?.message || 'Erro na API do Azure',
                    status: error.response.status,
                    isIdentical: false,
                    confidence: 0
                };
            }

            return {
                success: false,
                error: error.message,
                isIdentical: false,
                confidence: 0
            };
        }
    }

    /**
     * Valida se a imagem atende aos requisitos mínimos
     * @param {Buffer} imageBuffer - Buffer da imagem
     * @returns {Object} - Resultado da validação
     */
    async validateImage(imageBuffer) {
        try {
            // Verificar tamanho do arquivo (máximo 6MB para Azure Face API)
            if (imageBuffer.length > 6 * 1024 * 1024) {
                return {
                    isValid: false,
                    error: 'Imagem muito grande. Máximo permitido: 6MB'
                };
            }

            // Verificar tamanho mínimo (36x36 pixels para Azure Face API)
            if (imageBuffer.length < 1024) {
                return {
                    isValid: false,
                    error: 'Imagem muito pequena. Mínimo: 36x36 pixels'
                };
            }

            // Tentar detectar rosto para validação
            const detectionResult = await this.detectFace(imageBuffer);
            
            if (!detectionResult.success) {
                return {
                    isValid: false,
                    error: detectionResult.error || 'Erro ao processar imagem'
                };
            }

            if (detectionResult.faces.length === 0) {
                return {
                    isValid: false,
                    error: 'Nenhum rosto detectado na imagem'
                };
            }

            if (detectionResult.faces.length > 1) {
                return {
                    isValid: false,
                    error: 'Múltiplos rostos detectados. Use uma imagem com apenas um rosto'
                };
            }

            const face = detectionResult.faces[0];
            const attributes = face.faceAttributes;

            // Verificar qualidade da imagem
            if (attributes.blur && attributes.blur.blurLevel === 'high') {
                return {
                    isValid: false,
                    error: 'Imagem muito desfocada. Tente uma foto mais nítida'
                };
            }

            if (attributes.exposure && (attributes.exposure.exposureLevel === 'overExposure' || attributes.exposure.exposureLevel === 'underExposure')) {
                return {
                    isValid: false,
                    error: 'Problemas de exposição na imagem. Tente em melhor iluminação'
                };
            }

            if (attributes.occlusion && (attributes.occlusion.foreheadOccluded || attributes.occlusion.eyeOccluded || attributes.occlusion.mouthOccluded)) {
                return {
                    isValid: false,
                    error: 'Rosto parcialmente obstruído. Remova óculos escuros, máscaras ou outros obstáculos'
                };
            }

            return {
                isValid: true,
                face: face,
                attributes: attributes
            };

        } catch (error) {
            console.error('Erro na validação da imagem:', error);
            return {
                isValid: false,
                error: 'Erro ao validar imagem'
            };
        }
    }

    /**
     * Verifica se o serviço está configurado corretamente
     * @returns {boolean} - True se configurado, false caso contrário
     */
    isConfigured() {
        return !!(this.endpoint && this.subscriptionKey);
    }

    /**
     * Testa a conectividade com a API do Azure
     * @returns {Object} - Resultado do teste
     */
    async testConnection() {
        try {
            if (!this.isConfigured()) {
                return {
                    success: false,
                    error: 'Serviço não configurado. Verifique as variáveis AZURE_FACE_ENDPOINT e AZURE_FACE_SUBSCRIPTION_KEY'
                };
            }

            // Criar uma imagem de teste mínima (1x1 pixel PNG)
            const testImageBuffer = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
                0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
                0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
                0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
            ]);

            const response = await axios.post(
                this.detectUrl,
                testImageBuffer,
                {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey
                    },
                    params: {
                        returnFaceId: false
                    },
                    timeout: 10000
                }
            );

            return {
                success: true,
                message: 'Conexão com Azure Face API estabelecida com sucesso',
                status: response.status
            };

        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Status 400 é esperado para imagem de teste inválida, mas indica que a API está respondendo
                return {
                    success: true,
                    message: 'Conexão com Azure Face API estabelecida (teste de conectividade)',
                    status: 400
                };
            }

            return {
                success: false,
                error: error.message,
                status: error.response?.status || 0
            };
        }
    }
}

module.exports = new AzureFaceService();