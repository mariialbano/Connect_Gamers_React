// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-4 text-center mt-10 border-t border-pink-500">
      <p className="text-sm">© {new Date().getFullYear()} Connect Gamers. Todos os direitos reservados.</p>
      <p className="text-sm">Desenvolvido por: Ana Gonçalves, Jessica Brito, Mariana Albano, Neemias Silva, Vinícius Gonzales.</p>
    </footer>
  );
}
