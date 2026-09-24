# Instituto Paraíso do Saber

Portal institucional e painel administrativo em monorepo:

- `apps/web`: Next.js, React e TypeScript; site público, páginas de cursos/eventos/notícias, galeria e administração.
- `apps/api`: NestJS e TypeScript; API REST, JWT, permissões por função, auditoria e uploads.
- PostgreSQL com Prisma; Docker Compose para execução local.

O logotipo oficial, os banners e os cinco vídeos fornecidos pelo Instituto estão em `apps/web/public`.

## Execução recomendada com Docker

1. Instale Docker Desktop e copie `.env.example` para `.env`.
2. Antes de publicar, altere `JWT_SECRET`, `ADMIN_PASSWORD` e as credenciais do PostgreSQL no `.env`.
3. Inicie a aplicação com `docker compose up --build`.
4. Abra `http://localhost:3000`; o painel está em `http://localhost:3000/admin`.

O primeiro arranque prepara o schema PostgreSQL e cria o utilizador administrador e os cursos iniciais. A conta local de demonstração usa o `ADMIN_EMAIL` e `ADMIN_PASSWORD` definidos no `.env`. Troque a palavra-passe inicial antes de qualquer uso público.

## Execução sem Docker

Requer Node.js 22 ou superior e PostgreSQL 16.

1. Copie `.env.example` para `.env` e configure `DATABASE_URL` para a sua instância PostgreSQL.
2. Instale os pacotes: `npm install`.
3. Gere o cliente, aplique o schema e carregue os dados iniciais:

   ```sh
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. Inicie o portal e a API: `npm run dev`.

O portal fica em `http://localhost:3000`, a API em `http://localhost:4000/api` e o painel em `http://localhost:3000/admin`.

## Áreas administrativas

- Visão geral com indicadores do portal.
- Cursos, eventos, publicidade, notícias e uploads de mídia: criar, editar e remover.
- Interessados: consultar, actualizar estado e descarregar CSV.
- Utilizadores com funções `ADMIN`, `EDITOR` e `ATTENDANCE`.
- Página inicial: activar/desactivar secções, alterar títulos, descrições e ordem.
- Configurações de contactos, redes sociais, logotipo e SEO.
- Registo de alterações administrativas.

Campanhas e notícias agendadas são publicadas de acordo com as datas configuradas. O formulário público guarda os pedidos de contacto na base de dados.

## API principal

- Público: `GET /api/public/home`, `/courses`, `/courses/:slug`, `/events`, `/news`, `/media`; `POST /api/public/leads`.
- Sessão: `POST /api/auth/login`, `GET /api/auth/me`.
- Administração autenticada: `GET/POST /api/admin/:entity`, `PUT/DELETE /api/admin/:entity/:id`, configurações, upload e exportação CSV.

As chamadas administrativas exigem `Authorization: Bearer <token>`. Os papéis restringem as áreas acessíveis. A API usa bcrypt para as senhas, Helmet para cabeçalhos de segurança, JWT com validade e registos de auditoria.

## Operação antes de publicar

Configure domínio, HTTPS, proxy reverso, política de backups testada e armazenamento externo/CDN para mídia. O Compose incluído é para desenvolvimento e não provisiona certificados TLS nem backups automáticos. Configure também os endereços das redes sociais e o número WhatsApp em Configurações. O envio de e-mail e a recuperação de senha por e-mail dependem da configuração de um provedor SMTP, que ainda não está incluído.
