import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCamera, FaUpload, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { API_BASE } from '../services/apiBase';
import * as faceapi from 'face-api.js'; // Importa o face-api.js

const FacialVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('verify-token'); // verify-token, capture-photo, processing, success, error
  const [capturedImage, setCapturedImage] = useState(null);
  const [secureContext, setSecureContext] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [errorHint, setErrorHint] = useState('');
  const [showIosHelp, setShowIosHelp] = useState(false);
  const fileInputRef = useRef(null);
  const lastApiUrlRef = useRef('');

  // Resolve API base once (no ESLint warning about API_BASE deps)
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
      console.error('Falha ao resolver API_BASE, usando window.location.origin', e);
      const fallback = typeof window !== 'undefined' ? window.location.origin : '';
      return (fallback || '').replace(/\/$/, '');
    }
  };
  const resolvedApiBaseRef = useRef(resolveApiBase());

  // Helper: build URLs from the resolved base (stable)
  const buildApiUrl = useCallback((path) => {
    const cleaned = path.startsWith('/') ? path.slice(1) : path;
    const base = resolvedApiBaseRef.current || '';
    try {
      return new URL(cleaned, `${base}/`).toString();
    } catch (e) {
      console.error('URL build fallback engaged:', { base, cleaned, e });
      return `${base}/${cleaned}`;
    }
  }, []);

  // Helper: backend origin (for opening/trusting the cert on iOS)
  const getBackendOrigin = useCallback(() => {
    try {
      return new URL(resolvedApiBaseRef.current).origin;
    } catch {
      return resolvedApiBaseRef.current || '';
    }
  }, []);

  // Helper: fetch with timeout (prevents iOS from hanging on TLS/CORS failures)
  const fetchWithTimeout = useCallback(async (url, options = {}, timeoutMs = 10000) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
  }, []);

  // Token vindo da rota, query (?token=) ou hash (#token=)
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
      setErrorHint('');
      setError('Token não informado.');
      setStep('error');
      setLoading(false);
      return;
    }
    try {
      const sanitizedToken = encodeURIComponent(effectiveToken);
      const url = buildApiUrl(`/api/verification/verify-token/${sanitizedToken}`);
      lastApiUrlRef.current = url;
      setErrorHint('');
      console.log('🔍 Verificando token:', effectiveToken);
      console.log('🌐 URL completa:', url);
      console.log('🛰️ API base resolvido:', resolvedApiBaseRef.current);
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-store',
      }, 12000);
      console.log('📥 Response status:', response.status);
      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Erro ao interpretar resposta:', parseError);
      }
      if (response.ok && data) {
        console.log('✅ Token válido:', data);
        setErrorHint('');
        setTokenData(data);
        setStep('capture-photo');
      } else {
        const message = data?.error || 'Token inválido';
        console.log('❌ Token inválido:', data);
        setErrorHint('');
        setError(message);
        setStep('error');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar token:', error);
      const targetOrigin = (() => {
        try { return new URL(lastApiUrlRef.current).origin; } catch { return ''; }
      })();
      const hintPieces = [];
      if (!secureContext) {
        hintPieces.push('A página não está em HTTPS. Utilize HTTPS ou localhost para liberar a câmera e o backend.');
      }
      if (isIOS) {
        hintPieces.push('No iOS/Safari acesse o backend, toque em “Mostrar detalhes” e confie no certificado.');
      }
      try {
        const originUrl = new URL(getBackendOrigin());
        const host = originUrl.hostname;
        const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
        if (isIp) {
          hintPieces.push('Quando usar IP (ex.: 192.168.x.x), o certificado HTTPS deve conter o IP no Subject Alternative Name (SAN).');
        }
      } catch {}
      hintPieces.push(`Confirme que o backend${targetOrigin ? ` (${targetOrigin})` : ''} está acessível na mesma rede e com certificado aceito. Base atual: ${getBackendOrigin() || 'indefinida'}.`);
      setErrorHint(hintPieces.join(' '));
      setError(`Erro ao conectar com o servidor${targetOrigin ? ` (${targetOrigin})` : getBackendOrigin() ? ` (${getBackendOrigin()})` : ''}.`);
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [effectiveToken, buildApiUrl, secureContext, isIOS, fetchWithTimeout, getBackendOrigin]);

  // Executa verificação do token quando o token mudar
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      console.log('📸 Foto selecionada:', file.name, file.size, 'bytes');
      setCapturedImage(file);
      setError(''); // Limpa qualquer erro anterior
    } else {
      setError('Por favor, selecione um arquivo de imagem válido');
    }
  };

  const submitVerification = async () => {
    if (!capturedImage) {
      setErrorHint('');
      setError('Por favor, capture ou selecione uma imagem');
      return;
    }
    setStep('processing');
    setErrorHint('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', capturedImage, 'face-photo.jpg'); // Backend espera 'photo', não 'faceImage'
      formData.append('token', effectiveToken);
      
      console.log('📤 Enviando verificação facial...');
      console.log('🎫 Token:', effectiveToken);
      console.log('📸 Imagem:', capturedImage);
      
      const response = await fetchWithTimeout(buildApiUrl('/api/verification/face-verification'), {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
        cache: 'no-store',
      }, 20000);
      
      console.log('📥 Response status:', response.status);
      
      let data = null;
      try {
        data = await response.json();
        console.log('📥 Response data:', data);
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
          setError(`🚫 CONTA DUPLICADA DETECTADA!\n\n${data.error || data.message}`);
        } else {
          setError(data?.error || 'Erro na verificação facial');
        }
        console.error('❌ Erro na verificação:', data);
        setStep('capture-photo');
        setCapturedImage(null);
      }
    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      setError('Erro ao enviar imagem para verificação');
      setStep('capture-photo');
      setCapturedImage(null);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setError('');
    setErrorHint('');
  };

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError('');
    setErrorHint('');
    setStep('verify-token');
    verifyToken();
  }, [verifyToken]);

  const openBackend = useCallback(() => {
    const origin = getBackendOrigin();
    if (origin) {
      // abre em nova aba para permitir confiar no certificado
      const w = window.open(origin, '_blank', 'noopener,noreferrer');
      if (!w) window.location.href = origin;
    }
  }, [getBackendOrigin]);

  const copyBackendOrigin = useCallback(async () => {
    const origin = getBackendOrigin();
    if (!origin) return;
    try {
      await navigator.clipboard?.writeText(origin);
      setErrorHint('Endereço do servidor copiado. Abra-o no iPhone e confie no certificado.');
    } catch {
      const tmp = document.createElement('textarea');
      tmp.value = origin;
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(tmp);
      setErrorHint('Endereço do servidor copiado. Abra-o no iPhone e confie no certificado.');
    }
  }, [getBackendOrigin]);

  const caUrl = useMemo(() => {
    const origin = getBackendOrigin();
    return origin ? `${origin}/ca.crt` : '';
  }, [getBackendOrigin]);

  // Verifica contexto seguro e iOS/Safari
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSecureContext(window.isSecureContext);
    }
    if (typeof navigator !== 'undefined') {
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-pink-800 dark:text-pink-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Verificando token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verificação Facial
            </h1>
            {tokenData && (
              <p className="text-gray-600 dark:text-gray-300">
                Olá, <strong>{tokenData.user.nome}</strong>
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && step !== 'processing' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-600 dark:text-red-400 mr-2" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Token Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
              {(() => {
                const isTokenInvalid =
                  typeof error === 'string' &&
                  error.toLowerCase().includes('token') &&
                  error.toLowerCase().includes('inválido');
                return (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {isTokenInvalid ? 'Token Inválido' : 'Erro'}
                    </h2>
                    {isTokenInvalid ? (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        O link de verificação expirou ou é inválido.
                      </p>
                    ) : null}
                  </>
                );
              })()}
              <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-xs text-gray-700 dark:text-gray-300">
                <p>Não é necessário configurar VPN. No iPhone é preciso confiar no certificado do servidor HTTPS.</p>
                <button
                  onClick={() => setShowIosHelp((v) => !v)}
                  className="mt-2 text-pink-800 dark:text-pink-400 underline"
                >
                  {showIosHelp ? 'Ocultar instruções iOS' : 'Como confiar no certificado no iPhone'}
                </button>
                {showIosHelp && (
                  <div className="text-left mt-3 space-y-1">
                    <p>- No computador: gere um certificado para o IP com mkcert (ex.: mkcert 192.168.x.x).</p>
                    <p>- Localize a raiz do mkcert (root CA), normalmente “rootCA.pem”.</p>
                    <p>- Envie a root CA para o iPhone (AirDrop/Email/hosteie em {getBackendOrigin()}/ca.crt).</p>
                    <p>- No iPhone: após baixar, vá em Ajustes &gt; Geral &gt; VPN e Gerenciamento de Dispositivo &gt; Instalar o perfil.</p>
                    <p>- Depois: Ajustes &gt; Geral &gt; Sobre &gt; Confiança em Certificados &gt; Ative “Confiança total” para essa CA.</p>
                    <p>- Abra {getBackendOrigin()} no Safari, recarregue e confirme que abre sem aviso.</p>
                    <p>- Volte aqui e toque em “Tentar Novamente”.</p>
                    <p>- Alternativa rápida: use um túnel (ngrok/Cloudflare Tunnel) e aponte API_BASE/QR para o domínio HTTPS público.</p>
                  </div>
                )}
              </div>
              {errorHint && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 px-4">
                  {errorHint}
                </p>
              )}
              <div className="space-y-2">
                <button
                  onClick={handleRetry}
                  className="w-full bg-pink-800 hover:bg-pink-900 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={openBackend}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Abrir servidor (confiar certificado)
                </button>
                <button
                  onClick={copyBackendOrigin}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Copiar endereço do servidor
                </button>
                {caUrl && (
                  <a
                    href={caUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Baixar CA (root) para iPhone
                  </a>
                )}
                <button
                  onClick={() => navigate('/perfil')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Voltar ao Perfil
                </button>
              </div>
            </div>
          )}

          {/* Photo Capture */}
          {step === 'capture-photo' && (
            <div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Instruções para uma boa foto:
                </h3>
                <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                  <li>• Boa iluminação no rosto</li>
                  <li>• Olhe diretamente para a câmera</li>
                  <li>• Retire óculos escuros ou máscaras</li>
                  <li>• Mantenha expressão neutra</li>
                </ul>
              </div>

              {!capturedImage ? (
                <div className="space-y-4">
                  {/* Botão principal para tirar foto (abre câmera nativa do celular) */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-pink-800 hover:bg-pink-900 text-white py-4 px-4 rounded-lg font-medium flex items-center justify-center text-lg"
                  >
                    <FaCamera className="mr-2 text-2xl" />
                    Tirar Foto
                  </button>
                  
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    Abrirá a câmera do seu celular
                  </div>
                  
                  {/* Input oculto que abre a câmera nativa */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <img
                    src={URL.createObjectURL(capturedImage)}
                    alt="Imagem capturada"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {/* Actions after capture */}
              {capturedImage && (
                <div className="space-y-2">
                  <button
                    onClick={submitVerification}
                    className="w-full bg-pink-800 hover:bg-pink-900 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Enviar para Verificação
                  </button>
                  <button
                    onClick={resetCapture}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Capturar Novamente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-pink-800 dark:text-pink-400 text-4xl mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verificando sua identidade...
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Aguarde enquanto processamos sua foto facial.
              </p>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="text-center py-8">
              <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verificação Concluída!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sua verificação facial foi realizada com sucesso.
              </p>
              <button
                onClick={() => navigate('/perfil')}
                className="w-full bg-pink-800 hover:bg-pink-900 text-white px-6 py-2 rounded-lg font-medium"
              >
                Voltar ao Perfil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacialVerification;
