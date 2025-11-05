import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCamera, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaTimes } from 'react-icons/fa';
import { API_BASE } from '../services/apiBase';

const FacialVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('verify-token'); // verify-token, capture-photo, processing, success, error
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [instructionText, setInstructionText] = useState('Posicione seu rosto dentro do oval');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ovalCanvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const lastApiUrlRef = useRef('');

  // Resolve API base
  const resolveApiBase = () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const protocol = typeof window !== 'undefined' ? window.location.protocol : '';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const candidate = (API_BASE && API_BASE.trim()) || origin || '';
      const baseUrl = new URL(candidate, origin || undefined);
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(baseUrl.hostname) && hostname) {
        baseUrl.hostname = hostname;
      }
      if (protocol === 'https:' && baseUrl.protocol !== 'https:') {
        baseUrl.protocol = 'https:';
      }
      return baseUrl.toString().replace(/\/$/, '');
    } catch (e) {
      console.error('Falha ao resolver API_BASE', e);
      const fallback = typeof window !== 'undefined' ? window.location.origin : '';
      return (fallback || '').replace(/\/$/, '');
    }
  };
  
  const resolvedApiBaseRef = useRef(resolveApiBase());

  const buildApiUrl = useCallback((path) => {
    const cleaned = path.startsWith('/') ? path.slice(1) : path;
    const base = resolvedApiBaseRef.current || '';
    try {
      return new URL(cleaned, `${base}/`).toString();
    } catch (e) {
      return `${base}/${cleaned}`;
    }
  }, []);

  const fetchWithTimeout = useCallback(async (url, options = {}, timeoutMs = 10000) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
  }, []);

  const effectiveToken = useMemo(() => {
    let t = token;
    if (typeof window !== 'undefined') {
      if (!t) {
        const qs = new URLSearchParams(window.location.search);
        t = qs.get('token') || t;
      }
      if (!t && window.location.hash) {
        const raw = window.location.hash.replace(/^#\?/, '').replace(/^#/, '');
        const hp = new URLSearchParams(raw);
        t = hp.get('token') || t;
      }
    }
    return (t || '').trim();
  }, [token]);

  const verifyToken = useCallback(async () => {
    if (!effectiveToken) {
      setError('Token não informado.');
      setStep('error');
      setLoading(false);
      return;
    }
    try {
      const sanitizedToken = encodeURIComponent(effectiveToken);
      const url = buildApiUrl(`/api/verification/verify-token/${sanitizedToken}`);
      lastApiUrlRef.current = url;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-store',
      }, 12000);

      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Erro ao interpretar resposta:', parseError);
      }

      if (response.ok && data) {
        console.log('✅ Token válido:', data);
        setTokenData(data);
        setStep('capture-photo');
      } else {
        const message = data?.error || 'Token inválido';
        setError(message);
        setStep('error');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar token:', error);
      setError('Erro ao conectar com o servidor');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [effectiveToken, buildApiUrl, fetchWithTimeout]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // Carrega MediaPipe Face Detection
  useEffect(() => {
    const loadMediaPipe = async () => {
      if (typeof window !== 'undefined' && !window.FaceMesh) {
        try {
          // Carrega MediaPipe via CDN
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
          document.head.appendChild(script);

          const script2 = document.createElement('script');
          script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
          document.head.appendChild(script2);

          const script3 = document.createElement('script');
          script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
          document.head.appendChild(script3);

          console.log('✅ MediaPipe scripts carregados');
        } catch (e) {
          console.error('❌ Erro ao carregar MediaPipe:', e);
        }
      }
    };
    
    loadMediaPipe();
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      console.log('📸 Iniciando câmera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error('Erro no play:', e));
        };
      }

      // Inicia detecção de face
      startFaceDetection();
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      setError(error.name === 'NotAllowedError' 
        ? 'Permita o acesso à câmera' 
        : 'Erro ao acessar câmera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setIsCameraActive(false);
    setFaceDetected(false);
  };

  const startFaceDetection = () => {
    // Simulação simples de detecção (em produção usar face-api.js ou MediaPipe)
    detectionIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        // Aqui você integraria face-api.js para detecção real
        setFaceDetected(true);
        setInstructionText('✅ Rosto detectado! Clique em "Capturar"');
      }
    }, 100);
  };

  const drawOval = () => {
    const canvas = ovalCanvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = canvas.width * 0.25;
    const radiusY = canvas.height * 0.35;

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear oval area
    ctx.clearRect(centerX - radiusX, centerY - radiusY, radiusX * 2, radiusY * 2);

    // Draw oval border
    ctx.strokeStyle = faceDetected ? '#10b981' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw corner indicators
    const cornerSize = 30;
    ctx.strokeStyle = faceDetected ? '#10b981' : '#fbbf24';
    ctx.lineWidth = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(centerX - radiusX, centerY - radiusY);
    ctx.lineTo(centerX - radiusX + cornerSize, centerY - radiusY);
    ctx.moveTo(centerX - radiusX, centerY - radiusY);
    ctx.lineTo(centerX - radiusX, centerY - radiusY + cornerSize);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(centerX + radiusX, centerY - radiusY);
    ctx.lineTo(centerX + radiusX - cornerSize, centerY - radiusY);
    ctx.moveTo(centerX + radiusX, centerY - radiusY);
    ctx.lineTo(centerX + radiusX, centerY - radiusY + cornerSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(centerX - radiusX, centerY + radiusY);
    ctx.lineTo(centerX - radiusX + cornerSize, centerY + radiusY);
    ctx.moveTo(centerX - radiusX, centerY + radiusY);
    ctx.lineTo(centerX - radiusX, centerY + radiusY - cornerSize);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(centerX + radiusX, centerY + radiusY);
    ctx.lineTo(centerX + radiusX - cornerSize, centerY + radiusY);
    ctx.moveTo(centerX + radiusX, centerY + radiusY);
    ctx.lineTo(centerX + radiusX, centerY + radiusY - cornerSize);
    ctx.stroke();

    requestAnimationFrame(drawOval);
  };

  useEffect(() => {
    if (isCameraActive) {
      drawOval();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive, faceDetected]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError('Erro ao capturar foto');
      return;
    }

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        console.log('✅ Foto capturada:', blob.size, 'bytes');
        setCapturedImage(blob);
        stopCamera();
      } else {
        setError('Erro ao processar imagem');
      }
    }, 'image/jpeg', 0.95);
  };

  const submitVerification = async () => {
    if (!capturedImage) {
      setError('Por favor, capture uma imagem');
      return;
    }

    setStep('processing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', capturedImage, 'face-photo.jpg');
      formData.append('token', effectiveToken);

      const url = buildApiUrl('/api/verification/face-verification');
      console.log('📤 Enviando verificação facial...');
      console.log('📤 URL:', url);
      console.log('📤 Token:', effectiveToken);
      console.log('📤 Foto tamanho:', capturedImage?.size);

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
        cache: 'no-store',
      }, 20000);

      console.log('📥 Resposta status:', response.status);

      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Erro ao interpretar resposta:', parseError);
      }

      if (response.ok && data?.success) {
        console.log('✅ Verificação bem-sucedida!');
        setStep('success');
        setTimeout(() => {
          navigate('/perfil');
        }, 3000);
      } else {
        if (data?.duplicate) {
          setError(`🚫 CONTA DUPLICADA!\n${data.error}`);
        } else {
          setError(data?.error || 'Erro na verificação');
        }
        setStep('capture-photo');
        setCapturedImage(null);
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Erro tipo:', error.constructor.name);
      console.error('❌ Erro mensagem:', error.message);
      console.error('❌ Erro stack:', error.stack);
      
      // Mostrar erro detalhado
      const errorMsg = `Erro: ${error.message}\nTipo: ${error.constructor.name}\nURL: ${buildApiUrl('/api/verification/face-verification')}`;
      alert(errorMsg); // Temporário para debug
      
      setError(`Erro ao enviar foto: ${error.message}`);
      setStep('capture-photo');
      setCapturedImage(null);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-pink-500 mx-auto mb-4" />
          <p className="text-gray-300">Verificando token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Verificação Facial</h1>
            {tokenData && <p className="text-pink-100">Olá, {tokenData.user.nome}</p>}
          </div>

          <div className="p-6">
            {/* Error */}
            {error && step !== 'processing' && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mr-3 mt-1" />
                  <p className="text-red-100 whitespace-pre-line">{error}</p>
                </div>
              </div>
            )}

            {/* Capture State */}
            {step === 'capture-photo' && (
              <div>
                {!isCameraActive && !capturedImage && (
                  <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-100 mb-3">📸 Instruções:</h3>
                      <ul className="text-blue-100 text-sm space-y-2">
                        <li>✓ Boa iluminação no rosto</li>
                        <li>✓ Posicione seu rosto dentro do oval</li>
                        <li>✓ Olhe direto para a câmera</li>
                        <li>✓ Sem óculos escuros ou máscara</li>
                      </ul>
                    </div>

                    <button
                      onClick={startCamera}
                      className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white py-4 rounded-lg font-bold flex items-center justify-center text-lg transition"
                    >
                      <FaCamera className="mr-3 text-2xl" />
                      Iniciar Câmera
                    </button>
                  </div>
                )}

                {isCameraActive && !capturedImage && (
                  <div>
                    <div className="relative w-full mb-6 rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '4/5' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas
                        ref={ovalCanvasRef}
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 mb-4 text-center">
                      <p className="text-yellow-100 font-semibold text-sm">{instructionText}</p>
                    </div>

                    <div className="space-x-3 flex">
                      <button
                        onClick={capturePhoto}
                        disabled={!faceDetected}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
                      >
                        ✓ Capturar
                      </button>
                      <button
                        onClick={stopCamera}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition"
                      >
                        <FaTimes className="mr-2" /> Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div>
                    <img
                      src={URL.createObjectURL(capturedImage)}
                      alt="Capturada"
                      className="w-full rounded-xl mb-4"
                    />
                    <div className="space-y-3">
                      <button
                        onClick={submitVerification}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
                      >
                        ✓ Confirmar e Enviar
                      </button>
                      <button
                        onClick={resetCapture}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
                      >
                        🔄 Tirar Outra Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-pink-500 text-5xl mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Verificando...</h2>
                <p className="text-gray-400">Processando sua foto facial</p>
              </div>
            )}

            {/* Success */}
            {step === 'success' && (
              <div className="text-center py-12">
                <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Verificado! ✓</h2>
                <p className="text-gray-400 mb-6">Sua identidade foi confirmada com sucesso</p>
                <button
                  onClick={() => navigate('/perfil')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
                >
                  Voltar ao Perfil
                </button>
              </div>
            )}

            {/* Error */}
            {step === 'error' && (
              <div className="text-center py-12">
                <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-4">{error}</h2>
                <button
                  onClick={() => navigate('/perfil')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
                >
                  Voltar ao Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default FacialVerification;
