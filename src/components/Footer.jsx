export default function Footer() {
  return (
    <footer className="bg-[#d1d2d6] dark:bg-black text-gray-600 dark:text-gray-400 py-4 text-center mt-32 dark:mt-32 border-t border-pink-800">
      <p className="text-sm">© {new Date().getFullYear()} Connect Gamers. Todos os direitos reservados.</p>
      <p className="text-sm">Desenvolvido por: Ana Gonçalves, Jessica Brito, Mariana Albano, Neemias Silva, Vinícius Gonzales.</p>
    </footer>
  );
}
