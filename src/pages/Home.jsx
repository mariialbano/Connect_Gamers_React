import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="flex justify-center py-10 px-4">
      <div className="bg-[#d9dbe2] dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-4xl text-black dark:text-white relative">
  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-600 rounded-full opacity-20 -mt-10 -mr-10"></div>

        <h2 className="text-4xl font-bold mb-6 text-black dark:text-white">
          NOSSO <br /> <span className="text-pink-800 dark:text-pink-400">OBJETIVO</span>
        </h2>

        <p className="text-justify leading-relaxed">
          Proporcionamos uma plataforma dedicada para todos os gamers, permitindo que eles se inscrevam e participem de competições
          emocionantes em jogos populares como Valorant, Counter-Strike: Global Offensive, League of Legends, entre outros. A proposta central é oferecer um espaço onde os alunos possam desafiar suas habilidades em
          disputas de alto nível, testando seu desempenho, enquanto formam equipes e fortalecem laços dentro da comunidade gamer.
          <br /><br />
          Além disso, o site visa criar um ambiente inclusivo e estimulante, onde os jogadores não apenas competem, mas também se conectam com outros colegas com interesses semelhantes, possibilitando o desenvolvimento
          de novas amizades e a construção de equipes sólidas para futuras competições. A plataforma busca promover a interação, o espírito de equipe e o aprendizado coletivo, essencial para quem deseja aprimorar suas habilidades
          no universo dos games de forma competitiva e divertida.
          <br /><br />
          Ao unir tecnologia, comunidade e eSports, a<span className="text-pink-800 dark:text-pink-400 font-semibold">Connect Gamers</span> se posiciona como um ponto de encontro para todos que vivem e respiram o universo gamer.
        </p>

        <div className="mt-6 text-right">
          <Link
            to="/comunidade"
            className="inline-flex items-center gap-2 text-pink-800 dark:text-pink-400 hover:underline font-semibold group"
            aria-label="Ir para Comunidade"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            <span>Ir para Comunidade</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
