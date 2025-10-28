import React from 'react';
import { Card, Button, Badge } from '../ui';
import { useNavigate } from 'react-router-dom';

const EventsSection = ({ eventos }) => {
  const navigate = useNavigate(); // <-- Hook para navegar programaticamente

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="primary" size="lg" className="mb-4">
            🏆 Eventos em Destaque
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Próximos Torneios
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Participe dos maiores eventos de gaming do Brasil. Forme sua equipe e dispute prêmios incríveis!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos?.map((evento, index) => (
            <Card key={index} hover className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="gaming" size="sm">
                  {evento.jogo}
                </Badge>
                <Badge variant="accent" size="sm">
                  {evento.nivel}
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                {evento.nome}
              </h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                  <span className="w-5 h-5 mr-2">📅</span>
                  <span>{evento.dia}</span>
                </div>
                <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                  <span className="w-5 h-5 mr-2">🕐</span>
                  <span>{evento.horario}</span>
                </div>
                <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                  <span className="w-5 h-5 mr-2">👥</span>
                  <span>{evento.participantes || '0'} participantes</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Prêmio: <span className="font-semibold text-accent-600">R$ {evento.premio || '500'}</span>
                </div>
                <Button size="sm" variant="primary" onClick={() => navigate(`/inscreva-se?jogo=${encodeURIComponent(evento.jogo)}&eventoId=${evento.id}`)}>
                  Inscrever-se
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" onClick={() => navigate('/jogos')}>
            Ver Todos os Eventos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;