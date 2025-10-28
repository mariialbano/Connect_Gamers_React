import React from 'react';
import { Button, Card, Badge } from '../ui';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate(); // <-- Hook para navegar programaticamente

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900 via-pink-800 to-blue-900" />
      
      {/* Elementos decorativos */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      </div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <Badge variant="primary" size="lg" className="mb-6">
            🎮 Plataforma de Gaming #1 do Brasil
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
            Conecte-se,
            <span className="block bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Compita e
            </span>
            <span className="block">Conquiste!</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            A plataforma definitiva para gamers apaixonados. Participe de torneios épicos, 
            forme sua equipe e domine os rankings em Valorant, CS:GO, League of Legends e muito mais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="xl" 
              variant="accent"
              className="shadow-glow-lg"
              onClick={() => navigate('/login')}
            >
              ▶ Começar Agora
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              className="border-white text-white shadow-glow-lg"
              onClick={() => navigate('/jogos')}
            >
              Ver Eventos
            </Button>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card variant="glass" className="p-4 text-center">
              <div className="w-8 h-8 text-pink-400 mx-auto mb-2">👥</div>
              <div className="text-2xl font-bold text-white">2,847</div>
              <div className="text-sm text-white/70">Gamers Ativos</div>
            </Card>
            
            <Card variant="glass" className="p-4 text-center">
              <div className="w-8 h-8 text-yellow-400 mx-auto mb-2">🏆</div>
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-sm text-white/70">Torneios</div>
            </Card>
            
            <Card variant="glass" className="p-4 text-center">
              <div className="w-8 h-8 text-blue-400 mx-auto mb-2">🔥</div>
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-sm text-white/70">Squads Ativos</div>
            </Card>
            
            <Card variant="glass" className="p-4 text-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold">🎯</span>
              </div>
              <div className="text-2xl font-bold text-white">4.8</div>
              <div className="text-sm text-white/70">Avaliação</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;