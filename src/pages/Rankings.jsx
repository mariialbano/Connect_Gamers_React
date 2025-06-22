// src/pages/Home.jsx
import { useTheme } from "../theme/ThemeContext";

export default function Rankings() {
  const { theme } = useTheme();
  return (
    <div className={`text-center mt-10 ${theme === "dark" ? "text-white" : "text-black"}`}>
      <h1 className="text-3xl font-bold">Página Rankings</h1>
    </div>
  );
}
