"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpDown,
  BarChart2,
  Dumbbell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Apenas 3 itens principais — sem complexidade
const navItems = [
  {
    label: "Visão Geral",
    href: "/dashboard",
    icon: LayoutDashboard,
    descricao: "Resumo financeiro",
  },
  {
    label: "Lançamentos",
    href: "/lancamentos",
    icon: ArrowUpDown,
    descricao: "Entradas e saídas",
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart2,
    descricao: "DRE e Fluxo de Caixa",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-white/5 bg-[hsl(222,47%,7%)] z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500 animate-pulse-glow">
          <Dumbbell className="w-5 h-5 text-black" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">Ourofit</p>
          <p className="text-[11px] text-white/40 font-medium">Gestão Financeira</p>
        </div>
      </div>

      {/* Navigation — simples e direto */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-amber-400" : "text-white/40 group-hover:text-white/70"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className={cn("leading-none", isActive ? "text-amber-400" : "")}>
                  {item.label}
                </p>
                <p className="text-[11px] text-white/25 mt-0.5 leading-none">
                  {item.descricao}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer — Configurações (acesso discreto) + Usuário */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors text-xs font-medium"
        >
          <Settings className="w-3.5 h-3.5" />
          Configurações
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
            IS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">Isabela Ornelas</p>
            <p className="text-[11px] text-white/30 truncate">Gerente</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
