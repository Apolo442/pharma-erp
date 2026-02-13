"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import {
  LayoutDashboard,
  Pill,
  Store, // Mudamos ShoppingCart para Store (Fica mais "Ponto de Venda")
  Package,
  LogOut,
  Users,
  Wallet,
  FileText,
} from "lucide-react";

const menuItems = [
  { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Balcão (PDV)", href: "/dashboard/vendas", icon: Store },
  { label: "Caixa / Pagamento", href: "/dashboard/caixa", icon: Wallet },
  { label: "Produtos & Estoque", href: "/dashboard/produtos", icon: Package },
  { label: "Histórico", href: "/dashboard/historico", icon: FileText },
  { label: "Usuários", href: "/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          {/* Usei a cor primária no ícone */}
          <div className={styles.logoIcon}>
            <Pill size={28} />
          </div>
          <span>PharmaOne</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutButton}>
          <LogOut size={20} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
