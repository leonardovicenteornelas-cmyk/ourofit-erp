import { Settings, Database, Users, BookOpen, Building2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const secoes = [
  {
    icon: Building2,
    titulo: "Academia",
    descricao: "Nome, CNPJ, logo, regime tributário e dados cadastrais",
    status: "pendente",
    cor: "amber",
  },
  {
    icon: Database,
    titulo: "Banco de Dados",
    descricao: "Conectar PostgreSQL (Supabase ou local) para persistir lançamentos",
    status: "pendente",
    cor: "rose",
  },
  {
    icon: BookOpen,
    titulo: "Plano de Contas",
    descricao: "Adicionar, editar ou desativar categorias do plano de contas",
    status: "configurado",
    cor: "emerald",
    href: "/plano-de-contas",
  },
  {
    icon: Users,
    titulo: "Usuários e Acessos",
    descricao: "Cadastrar recepcionistas, gerentes e definir permissões por perfil",
    status: "pendente",
    cor: "sky",
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          Configurações
        </h1>
        <p className="text-sm text-white/40 mt-0.5">
          Parâmetros do sistema · Academia Ourofit
        </p>
      </div>

      {/* Alerta de banco de dados */}
      <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-4">
        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-rose-400">Banco de dados não conectado</p>
          <p className="text-rose-300/70">
            O sistema está rodando com dados de demonstração. Para ativar lançamentos reais,
            configure uma conexão PostgreSQL no arquivo{" "}
            <code className="bg-rose-500/10 px-1 rounded font-mono">.env</code> e execute{" "}
            <code className="bg-rose-500/10 px-1 rounded font-mono">npm run db:push</code>.
          </p>
          <p className="text-rose-300/50 mt-2">
            Sugestão gratuita: crie um projeto em{" "}
            <a href="https://supabase.com" target="_blank" className="underline hover:text-rose-300">
              supabase.com
            </a>{" "}
            e copie a connection string para o arquivo .env.
          </p>
        </div>
      </div>

      {/* Cards de configuração */}
      <div className="space-y-3">
        {secoes.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.titulo}
              className={cn(
                "flex items-center gap-4 rounded-xl border px-5 py-4 bg-[hsl(222,47%,9%)] transition-all hover:bg-[hsl(222,47%,11%)] cursor-pointer",
                s.status === "configurado" ? "border-emerald-500/15" : "border-white/5"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0",
                s.status === "configurado" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/80">{s.titulo}</p>
                <p className="text-xs text-white/30 mt-0.5">{s.descricao}</p>
              </div>
              <span className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0",
                s.status === "configurado"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              )}>
                {s.status === "configurado" ? "Configurado" : "Pendente"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Próximos passos */}
      <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-5">
        <h2 className="text-sm font-bold text-white/70 mb-3">📋 Próximos passos</h2>
        <ol className="space-y-2 text-xs text-white/40 list-decimal list-inside">
          <li>Responder o questionário enviado à Isabela (Blocos 1–5)</li>
          <li>Criar projeto gratuito no Supabase e configurar a DATABASE_URL no .env</li>
          <li>Executar <code className="text-amber-400/70">npm run db:push</code> para criar as tabelas</li>
          <li>Executar <code className="text-amber-400/70">npm run db:seed</code> para popular o plano de contas</li>
          <li>Importar os dados históricos da planilha (Abr–Set/2025)</li>
          <li>Fase 2: módulo de alunos e cobrança automatizada</li>
        </ol>
      </div>
    </div>
  );
}
