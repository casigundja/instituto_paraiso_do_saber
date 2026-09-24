<!DOCTYPE html>
<html lang="pt-AO">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>{{ $metaTitle ?? 'Instituto Paraíso do Saber | Formação que transforma' }}</title>
    <meta name="description" content="{{ $metaDescription ?? 'Formação profissional na área da saúde. Conheça os cursos do Instituto Paraíso do Saber.' }}">
    <link rel="canonical" href="{{ $canonicalUrl ?? url('/') }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Instituto Paraíso do Saber">
    <meta property="og:title" content="{{ $metaTitle ?? 'Instituto Paraíso do Saber' }}">
    <meta property="og:description" content="{{ $metaDescription ?? 'Formação profissional na área da saúde.' }}">
    <meta property="og:image" content="{{ $metaImage ?? url('/banner1.jpeg') }}">
    <meta property="og:url" content="{{ $canonicalUrl ?? url('/') }}">
    <meta name="twitter:card" content="summary_large_image">
    @if(!empty($noindex))<meta name="robots" content="noindex,nofollow">@endif
    <link rel="icon" href="/logo_paraiso_do_saber.jpeg">
    <link rel="stylesheet" href="/site.css">
    <link rel="stylesheet" href="/portal.css">
    <link rel="stylesheet" href="/institutional.css">
    <link rel="stylesheet" href="/theme.css">
    <script defer src="/build/app.js"></script>
</head>
<body><div id="app"></div></body>
</html>
