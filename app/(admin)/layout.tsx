import { Sidebar } from "@/app/components/Sidebar/Sidebar";
import "../globals.css"; // Caminho corrigido anteriormente

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Container pai com display flex ocupa toda a altura
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* 2. A Sidebar fica na esquerda */}
      <Sidebar />

      {/* 3. O Main ocupa o espaço restante (flex: 1) */}
      <main style={{ flex: 1, padding: "24px", background: "#f5f5f5" }}>
        {children}
      </main>
    </div>
  );
}
