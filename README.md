# Mapa Comportamental Azevedo 🎯

Plataforma de Avaliação Comportamental e Seleção Psicométrica baseada no modelo **Big Five (OCEAN)** e Indicadores Operacionais de Desempenho.

---

## 🚀 Funcionalidades

- **Painel do Recrutador:** Gestão completa de candidatos e status das avaliações em tempo real.
- **Importação em Lote via Excel (.xlsx, .csv):** Leitura de planilhas de candidatos com geração automática de links únicos.
- **Modo Claro & Escuro (Light / Dark Mode):** Suporte nativo a temas visuais com persistência da preferência do usuário.
- **Relatório Comportamental Integrado:** Gráficos de radar dos 5 grandes fatores psicométricos, cálculo de aderência a perfis operacionais e perguntas sugeridas para entrevista.
- **Integração Supabase:** Banco de dados seguro com Row Level Security (RLS) e exclusão em cascata.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Planilhas:** SheetJS (`xlsx`)
- **Backend & Database:** Supabase (PostgreSQL, Auth, RLS)
- **Deploy:** Vercel

---

## 📦 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd mapa-comportamental-cc
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
   ```env
   VITE_SUPABASE_URL=https://lhbjkxpbhzfmzmrqdswq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---

## 📤 Como Subir no GitHub

Execute os comandos no terminal dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "feat: Mapa Comportamental Azevedo completo pronto para Vercel"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

---

## 🌐 Como Publicar na Vercel

1. Acesse o painel da [Vercel](https://vercel.com) e clique em **"Add New Project"**.
2. Importe o repositório do **GitHub**.
3. Em **Environment Variables**, adicione as duas variáveis:
   - `VITE_SUPABASE_URL`: `https://lhbjkxpbhzfmzmrqdswq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1...`
4. Clique em **"Deploy"**. O projeto será construído e publicado automaticamente com suporte a URLs amigáveis.
