import { useTheme } from "../theme/ThemeContext";

export default function FAQ() {
  const { theme } = useTheme();
  return (
    <div className={`text-center mt-10 ${theme === "dark" ? "text-white" : "text-black"}`}>
      <h1 className="text-3xl font-bold">Página FAQ</h1>
    </div>
  );
}
