import React, { useState, useEffect } from 'react';
import { HeroSection, EventsSection, TestimonialsSection, CTASection } from '../components/sections';
import { LoadingSpinner } from '../components/ui';
import { eventosTeste } from "../data/eventos.js";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      try {
        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Processar eventos dos dados existentes
        const eventosProcessados = [];
        Object.entries(eventosTeste).forEach(([jogo, eventosJogo]) => {
          eventosJogo.forEach(evento => {
            eventosProcessados.push({
              ...evento,
              jogo,
              participantes: Math.floor(Math.random() * 50) + 10,
              premio: Math.floor(Math.random() * 1000) + 500,
              nivel: ['Iniciante', 'Intermediário', 'Avançado', 'Competitivo'][Math.floor(Math.random() * 4)]
            });
          });
        });
        
        setEventos(eventosProcessados.slice(0, 6)); // Mostrar apenas 6 eventos
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Carregando plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Events Section */}
      <EventsSection eventos={eventos} />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
