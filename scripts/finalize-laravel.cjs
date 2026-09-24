const fs=require('fs');
const file='resources/js/Admin.tsx';
let text=fs.readFileSync(file,'utf8');
text=text.replace("tab==='courses'?['ACTIVE','INACTIVE','CLOSED']:['UPCOMING','ONGOING','ENDED']","tab==='courses'?['ACTIVE','INACTIVE','CLOSED']:['news','campaigns'].includes(tab)?['DRAFT','PUBLISHED','SCHEDULED','ARCHIVED']:['UPCOMING','ONGOING','ENDED']");
text=text.replace("onClick={()=>{localStorage.removeItem('ps_token');","onClick={()=>{void request('/auth/logout',{method:'POST'}).catch(()=>{});localStorage.removeItem('ps_token');");
fs.writeFileSync(file,text);
fs.writeFileSync('README.md',`# Instituto Paraíso do Saber — Laravel

Aplicação Laravel 12 com PHP 8.2+, SQLite e telas React servidas pelo próprio Laravel. Site, painel e API usam a mesma origem; Next.js e NestJS não são necessários para executar esta versão.

## Executar

O ambiente local já foi instalado e configurado. Na raiz:

\`\`\`sh
php artisan serve
\`\`\`

Site: http://127.0.0.1:8000 — painel: http://127.0.0.1:8000/admin.
O comando Laravel é \`serve\`. As credenciais administrativas são ADMIN_EMAIL e ADMIN_PASSWORD no arquivo local .env.

## Nova instalação

1. Execute \`composer install\` e \`npm install\`.
2. Copie .env.example para .env e configure ADMIN_EMAIL e ADMIN_PASSWORD.
3. Execute \`php artisan key:generate\`.
4. Crie database/database.sqlite vazio, se ainda não existir.
5. Execute \`php artisan migrate --seed\`, \`npm run build\` e \`php artisan serve\`.

O PHP precisa das extensões PDO SQLite, mbstring, fileinfo, openssl, XML e curl. O banco local fica em database/database.sqlite. Preserve este arquivo e storage/app/public nos backups.

## Desenvolvimento e validação

- \`npm run build\`: compila resources/js em public/build/app.js.
- \`composer dev\`: inicia o servidor e recompila JavaScript ao editar.
- \`php artisan test\`: testes com SQLite em memória, separado do banco local.
- CSS: public/site.css; telas: resources/js; API: routes/api.php e app/Http/Controllers/PortalController.php.
- Uploads: storage/app/public/media, servidos em /media. Para vídeos grandes, ajuste upload_max_filesize e post_max_size do PHP para 100M e 110M.

## Funcionalidades

Site institucional, cursos, eventos, notícias, galeria, formulário persistente de interessados, login com tokens de 8 horas, permissões ADMIN/EDITOR/ATTENDANCE, gestão de conteúdo, configurações, secções da página inicial, uploads, auditoria e exportação CSV. Senhas usam hash; tokens são armazenados somente como hash e revogados ao terminar sessão.

## Versão anterior

apps/api e apps/web preservam os fontes NestJS/Next.js. legacy contém a documentação e uma cópia local da configuração anterior. O docker-compose.yml existente pertence à versão anterior e não é necessário para Laravel.

A base SQLite foi inicializada com os três cursos e as configurações do Instituto. Dados adicionais eventualmente existentes em PostgreSQL ou no localStorage da demonstração antiga não foram importados. O PostgreSQL não estava disponível durante a conversão. Os arquivos originais de mídia foram preservados.
`);
