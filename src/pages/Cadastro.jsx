import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { postItem, getItem } from "../services/api";
import { useTheme } from "../theme/ThemeContext";

export default function Cadastro() {
  const [jogoSelecionado, setJogoSelecionado] = useState("");
  const [eventoSelecionado, setEventoSelecionado] = useState("");
  const [integrantes, setIntegrantes] = useState([""]);
  const [nomeSquad, setNomeSquad] = useState("");
  const [nivel, setNivel] = useState("");

  // Eventos carregados do backend
  const [eventos, setEventos] = useState({}); 

  const location = useLocation();
  const { theme } = useTheme();

  // Inicializa primeiro integrante com usuário logado se existir (rota já protegida)
  useEffect(() => {
    const usuario = localStorage.getItem("usuarioLogado");
    if (usuario) setIntegrantes([usuario]);
  }, []);


  const jogos = Object.keys(eventos);
  const eventosFiltrados = jogoSelecionado ? eventos[jogoSelecionado] || [] : [];

  useEffect(() => {
    let ativo = true;
    async function carregarEventos() {
      try {
        const data = await getItem('eventos');
        if (!ativo) return;
        setEventos(data || {});
        // aplicar query params
        const params = new URLSearchParams(location.search);
        const jogoParam = params.get('jogo');
        const eventoIdParam = params.get('eventoId');
        if (jogoParam && data && data[jogoParam]) {
          setJogoSelecionado(jogoParam);
          if (eventoIdParam) {
            const evInt = parseInt(eventoIdParam, 10);
            const existe = (data[jogoParam] || []).some(ev => ev.id === evInt);
            if (existe) setEventoSelecionado(String(evInt));
          }
        }
      } catch (e) {
        if (!ativo) return;
        setEventos({});
      }
    }
    carregarEventos();
    return () => { ativo = false; };
  }, [location.search]);

  const handleIntegranteChange = (index, value) => {
    const novaLista = [...integrantes];
    novaLista[index] = value;
    setIntegrantes(novaLista);
  };

  const adicionarIntegrante = () => {
    if (integrantes.length >= 5) return;
    setIntegrantes([...integrantes, ""]);
  };

  const removerIntegrante = (index) => {
    const novaLista = [...integrantes];
    novaLista.splice(index, 1);
    setIntegrantes(novaLista);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomeSquad || !nivel || !jogoSelecionado || !eventoSelecionado || integrantes.some((nome) => nome === "")) {
      alert("Preencha todos os campos antes de cadastrar.");
      return;
    }

    const dadosCadastro = {
      nomeSquad,
      integrantes,
      jogo: jogoSelecionado,
      eventoId: parseInt(eventoSelecionado),
      nivel,
      dataCadastro: new Date().toISOString(),
    };

    try {
      await postItem("squads", dadosCadastro);
      alert("Squad cadastrado com sucesso!");

      // Resetar campos
      setNomeSquad("");
      setNivel("");
      setJogoSelecionado("");
      setEventoSelecionado("");
      setIntegrantes([""]);
    } catch (err) {
      alert("Erro ao cadastrar: " + err.message);
    }
  };

  return (
    <div className="flex justify-center py-20">
      <div className={
        theme === "dark"
          ? "bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl text-white"
          : "bg-[#d9dbe2] p-8 rounded-xl shadow-lg w-full max-w-xl text-black"
      }>
        {!localStorage.getItem('usuarioLogado') && (
          <div className="mb-6 p-3 rounded-md text-sm font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-300 dark:border-pink-700">
            Faça login para continuar o cadastro.
          </div>
        )}
  <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-8">
          Cadastre seu Squad!
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="form-squad-title">
          <h2 id="form-squad-title" className="sr-only">Formulário de cadastro de squad</h2>

          {/* Nome do Squad */}
          <div className="flex flex-col gap-1">
            <label htmlFor="nomeSquad" className="text-sm font-medium">Nome do Squad <span className="sr-only">(obrigatório)</span></label>
            <input
              id="nomeSquad"
              type="text"
              placeholder="Nome do Squad"
              value={nomeSquad}
              onChange={(e) => setNomeSquad(e.target.value)}
              className={
                theme === "dark"
                  ? "w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
                  : "w-full px-4 py-2 rounded-md bg-[#f3f4f6] text-black placeholder-gray-500"
              }
              aria-required="true"
            />
          </div>

          {/* Nível */}
          <div className="flex flex-col gap-1">
            <label htmlFor="nivelSquad" className="text-sm font-medium">Nível do Squad</label>
            <select
              id="nivelSquad"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className={
                theme === "dark"
                  ? "w-full px-4 py-2 rounded-md bg-gray-700 text-white"
                  : "w-full px-4 py-2 rounded-md bg-[#f3f4f6] text-black"
              }
            >
              <option value="">Selecione o nível do squad</option>
              <option>Iniciante</option>
              <option>Intermediário</option>
              <option>Avançado</option>
              <option>Competitivo</option>
            </select>
          </div>

          {/* Jogo */}
          <div className="flex flex-col gap-1">
            <label htmlFor="jogoSelect" className="text-sm font-medium">Jogo</label>
            <select
              id="jogoSelect"
              value={jogoSelecionado}
              onChange={(e) => {
                setJogoSelecionado(e.target.value);
                setEventoSelecionado("");
              }}
              className={
                theme === "dark"
                  ? "w-full px-4 py-2 rounded-md bg-gray-700 text-white"
                  : "w-full px-4 py-2 rounded-md bg-[#f3f4f6] text-black"
              }
            >
              <option value="">Selecione o jogo</option>
              {jogos.map((jogo) => (
                <option key={jogo} value={jogo}>{jogo}</option>
              ))}
            </select>
          </div>

          {/* Evento */}
          {jogoSelecionado && (
            <div className="flex flex-col gap-1">
              <label htmlFor="eventoSelect" className="text-sm font-medium">Evento</label>
              <select
                id="eventoSelect"
                value={eventoSelecionado}
                onChange={(e) => setEventoSelecionado(e.target.value)}
                className={
                  theme === "dark"
                    ? "w-full px-4 py-2 rounded-md bg-gray-700 text-white"
                    : "w-full px-4 py-2 rounded-md bg-[#f3f4f6] text-black"
                }
              >
                <option value="">Selecione o evento</option>
                {eventosFiltrados.map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nome} - {evento.dia} ({evento.horario})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Integrantes */}
          <div className="space-y-2" aria-labelledby="integrantes-label">
            <p id="integrantes-label" className="text-sm font-medium mb-1">Integrantes (máx. 5)</p>
            {integrantes.map((nome, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 flex flex-col">
                  <label htmlFor={`integrante-${index}`} className="sr-only">{index === 0 ? "Integrante 1 (você)" : `Integrante ${index + 1}`}</label>
                  <input
                    id={`integrante-${index}`}
                    type="text"
                    placeholder={index === 0 ? "Você" : `Integrante ${index + 1}`}
                    value={nome}
                    onChange={(e) => handleIntegranteChange(index, e.target.value)}
                    disabled={index === 0}
                    title={index === 0 ? "Este é o seu usuário" : "Nome do integrante"}
                    className={
                      theme === "dark"
                        ? `px-4 py-2 rounded-md bg-gray-700 text-white ${index===0 ? 'opacity-80 cursor-not-allowed' : ''}`
                        : `px-4 py-2 rounded-md bg-[#f3f4f6] text-black ${index===0 ? 'opacity-80 cursor-not-allowed' : ''}`
                    }
                  />
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removerIntegrante(index)}
                    aria-label={`Remover integrante ${index+1}`}
                    className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-1.5 rounded-md text-sm font-semibold transition"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={adicionarIntegrante}
              className={`text-pink-800 dark:text-pink-300 hover:underline mt-2 ${integrantes.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={integrantes.length >= 5}
              aria-label="Adicionar novo integrante"
            >
              + Adicionar Integrante
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Cadastrar Squad
          </button>
        </form>
      </div>
    </div>
  );
}
