# Operação em produção

O portal está preparado para usar um domínio próprio, SMTP, mídia em disco S3 compatível e cópias programadas. Os valores reais são específicos do alojamento e ficam no `.env` fora do repositório. O lockfile inclui o adaptador oficial `league/flysystem-aws-s3-v3`.

## Domínio e HTTPS

Configure o DNS do domínio para o servidor e termine TLS no proxy (por exemplo, Nginx, Caddy ou o balanceador do alojamento). No `.env` de produção, defina `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://DOMINIO-DO-INSTITUTO`, `APP_FORCE_HTTPS=true` e `SESSION_SECURE_COOKIE=true`. Se houver proxy reverso, indique em `TRUSTED_PROXIES` apenas os endereços IP desse proxy, separados por vírgulas. Em seguida, execute `php artisan config:cache` e configure o servidor para servir a pasta `public/` com PHP-FPM; `php artisan serve` é destinado ao desenvolvimento.

## Envio de e-mails

Configure `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SCHEME=tls` (ou `ssl`, conforme o serviço), `MAIL_FROM_ADDRESS` e `MAIL_FROM_NAME`. A recuperação de palavra-passe usa o URL de `APP_URL`, envia uma ligação de uso único e expira em uma hora. O modo local `MAIL_MAILER=log` regista as mensagens em `storage/logs` e não as entrega a destinatários.

## Mídia e cópias externas

Para mídia num bucket público S3 compatível, configure `MEDIA_FILESYSTEM_DRIVER=s3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_ENDPOINT`, `AWS_URL` e `AWS_USE_PATH_STYLE_ENDPOINT` conforme o fornecedor. `MEDIA_PUBLIC_URL` pode apontar para o domínio CDN público do bucket. O bucket deve permitir leitura pública dos objectos publicados e bloquear listagem pública. Para Cloudflare R2, use o endpoint da conta e path-style conforme a configuração do bucket.

Para cópias, configure `BACKUP_DISK=s3` (ou outro disco Laravel definido no servidor), `BACKUP_PATH=backups/portal` e `BACKUP_RETENTION_DAYS=14`. O comando `php artisan portal:backup` cria um snapshot SQLite consistente, inclui a mídia e remove arquivos ZIP vencidos. O agendamento Laravel corre às 02:00, no fuso definido por `APP_TIMEZONE`; o alojamento precisa executar `php artisan schedule:run` a cada minuto (cron) para activar a rotina. Faça e valide uma cópia antes de ativar a retenção automática.

Depois de configurar as credenciais no ambiente de publicação, execute `composer install --no-dev --classmap-authoritative` antes de definir `MEDIA_FILESYSTEM_DRIVER=s3` ou `BACKUP_DISK=s3`.

## Revisão de dependências

Antes da publicação, execute `npm audit --omit=dev` e `composer audit` com acesso aos registos de advisories. Corrija avisos de produção, regenere os lockfiles e faça build dos assets. A ausência de avisos não substitui as credenciais, regras do bucket, domínio, TLS e processo de cópias/restauro do alojamento.
