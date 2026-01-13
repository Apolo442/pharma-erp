"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Package,
  LogOut,
  Users, // Novo ícone importado
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vendas", href: "/dashboard/vendas", icon: ShoppingCart },
  { label: "Medicamentos", href: "/dashboard/medicamentos", icon: Pill },
  { label: "Estoque", href: "/dashboard/estoque", icon: Package },
  { label: "Usuários", href: "/users", icon: Users }, // Nova aba substituindo Médicos
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Pill size={32} />
          <span>PharmaOne</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          // Verifica se a rota atual começa com o href do item
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
