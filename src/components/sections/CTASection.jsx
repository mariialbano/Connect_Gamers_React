import React from 'react';
import { Button, Card } from '../ui';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate(); // <-- Hook para navegar programaticamente

  const features = [
    "Torneios diários com prêmios",
    "Sistema de ranking avançado",
    "Chat em tempo real",
    "Moderação por IA",
    "Estatísticas detalhadas",
    "Comunidade ativa"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Pronto para dominar?
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
            Junte-se a milhares de gamers e comece sua jornada competitiva hoje mesmo. 
            É grátis e leva menos de 2 minutos para começar!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <Card variant="glass" className="p-8 text-left">
              <h3 className="text-2xl font-bold text-white mb-4">Para Gamers</h3>
              <ul className="space-y-3 mb-6">
                {features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center text-white/80">
                    <span className="w-5 h-5 text-accent-400 mr-3">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                variant="accent"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                ▶ Começar Agora
              </Button>
            </Card>
            
            <Card variant="glass" className="p-8 text-left">
              <h3 className="text-2xl font-bold text-white mb-4">Para Organizadores</h3>
              <ul className="space-y-3 mb-6">
                {features.slice(3).map((feature, index) => (
                  <li key={index} className="flex items-center text-white/80">
                    <span className="w-5 h-5 text-accent-400 mr-3">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full border-white text-white shadow-glow-lg"
              >
                Criar Evento
              </Button>
            </Card>
          </div>
          
          <div className="text-center">
            <p className="text-white/60 mb-4">
              Mais de 2.000 gamers já confiam na nossa plataforma
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-white/80 font-medium">
                + 2.000 gamers ativos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;