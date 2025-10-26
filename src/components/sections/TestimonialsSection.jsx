import React from 'react';
import { Card, Button, Badge } from '../ui';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Ana Silva",
      role: "Pro Player - Valorant",
      avatar: "AS",
      rating: 5,
      text: "A melhor plataforma para encontrar teammates de qualidade. Consegui formar um squad incrível e já ganhamos 3 torneios!",
      game: "Valorant"
    },
    {
      name: "Carlos Santos",
      role: "Streamer - CS:GO",
      avatar: "CS",
      rating: 5,
      text: "A comunidade aqui é fantástica. Sempre encontro jogadores dedicados e os eventos são muito bem organizados.",
      game: "CS:GO"
    },
    {
      name: "Mariana Costa",
      role: "Coach - League of Legends",
      avatar: "MC",
      rating: 5,
      text: "Como coach, posso dizer que a plataforma facilita muito o desenvolvimento dos jogadores. Excelente ambiente competitivo!",
      game: "League of Legends"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="accent" size="lg" className="mb-4">
            ⭐ Depoimentos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            O que nossos gamers dizem
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Mais de 2.000 gamers já confiam na nossa plataforma para suas competições
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 h-full relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full -translate-y-10 translate-x-10" />
              
              <div className="relative z-10">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="w-5 h-5 text-accent-400">⭐</span>
                  ))}
                </div>
                
                {/* Testimonial text */}
                <blockquote className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Author info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {testimonial.role}
                    </div>
                    <Badge variant="gaming" size="xs" className="mt-1">
                      {testimonial.game}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">4.9</div>
            <div className="text-neutral-600 dark:text-neutral-400">Avaliação Média</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-600 dark:text-secondary-400 mb-2">2,847</div>
            <div className="text-neutral-600 dark:text-neutral-400">Gamers Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent-600 dark:text-accent-400 mb-2">156</div>
            <div className="text-neutral-600 dark:text-neutral-400">Torneios Realizados</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gaming-purple mb-2">98%</div>
            <div className="text-neutral-600 dark:text-neutral-400">Taxa de Satisfação</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;