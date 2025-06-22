import { useTheme } from '../theme/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  return (
    <footer className={
      theme === "dark"
        ? "bg-black text-gray-400 py-4 text-center mt-10 border-t border-pink-500"
        : "bg-[#d1d2d6] text-gray-600 py-4 text-center mt-10 border-t border-pink-500"
    }>
      <p className="text-sm">© {new Date().getFullYear()} Connect Gamers. Todos os direitos reservados.</p>
      <p className="text-sm">Desenvolvido por: Ana Gonçalves, Jessica Brito, Mariana Albano, Neemias Silva, Vinícius Gonzales.</p>
    </footer>
  );
}
