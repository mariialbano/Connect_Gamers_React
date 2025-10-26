import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { postItem, getItem } from "../services/api";
import { useTheme } from "../theme/ThemeContext";
import LayoutWrapper from "../components/LayoutWrapper";
import { Card, Button, Badge } from "../components/ui";

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
    <LayoutWrapper variant="default" className="flex items-center justify-center py-20">
      <Card variant="glass" className="p-8 w-full max-w-xl text-neutral-900 dark:text-neutral-100">
        {/* Header com branding */}
        <div className="text-center mb-8">
          <Badge variant="primary" size="lg" className="mb-4">
            🏆 Cadastre seu Squad
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            Forme sua equipe vencedora!
          </h1>
          <p className="text-white/80">
            Cadastre seu squad e participe dos maiores torneios de gaming do Brasil
          </p>
        </div>

        {!localStorage.getItem('usuarioLogado') && (
          <Badge variant="warning" size="sm" className="mb-6 w-full justify-center">
            Faça login para continuar o cadastro
          </Badge>
        )}

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
              className="w-full px-4 py-2 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        ? `px-4 py-2 rounded-md bg-neutral-800 text-neutral-100 ${index===0 ? 'opacity-80 cursor-not-allowed' : ''} border border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent`
                        : `px-4 py-2 rounded-md bg-neutral-50 text-neutral-900 ${index===0 ? 'opacity-80 cursor-not-allowed' : ''} border border-neutral-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent`
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
              className={`text-primary-600 dark:text-primary-400 hover:underline mt-2 ${integrantes.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={integrantes.length >= 5}
              aria-label="Adicionar novo integrante"
            >
              + Adicionar Integrante
            </button>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full shadow-glow"
          >
            ▶ Cadastrar Squad
          </Button>
        </form>
      </Card>
    </LayoutWrapper>
  );
}
