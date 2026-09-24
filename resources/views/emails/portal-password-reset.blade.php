<!DOCTYPE html>
<html lang="pt-AO">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Recuperar palavra-passe</title></head>
<body style="margin:0;padding:32px 14px;background:#f3f5f7;color:#18334c;font-family:Arial,sans-serif">
<main style="max-width:560px;margin:auto;padding:36px;background:#fff;border-top:5px solid #c1dc75;border-radius:8px">
    <p style="font-size:12px;color:#174e45;letter-spacing:1px;font-weight:bold">INSTITUTO PARAÍSO DO SABER</p>
    <h1 style="font-size:26px">Recuperação da palavra-passe</h1>
    <p style="font-size:15px;line-height:1.7">Recebemos um pedido para redefinir a palavra-passe da sua conta administrativa. Use a ligação abaixo para escolher uma nova palavra-passe. A ligação expira em 60 minutos.</p>
    <p style="margin:28px 0"><a href="{{ $resetUrl }}" style="display:inline-block;padding:14px 20px;background:#174e45;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold">Definir nova palavra-passe</a></p>
    <p style="font-size:12px;line-height:1.7;color:#687876">Se não pediu esta alteração, ignore esta mensagem. A sua palavra-passe não será alterada.</p>
    <p style="font-size:12px;color:#687876">Se o botão não abrir, copie esta ligação para o navegador:<br><a href="{{ $resetUrl }}" style="color:#174e45;overflow-wrap:anywhere">{{ $resetUrl }}</a></p>
</main>
</body>
</html>
