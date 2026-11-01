<!DOCTYPE html>
<html lang="pt-PT">
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
    <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png?v=2">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2">
    <link rel="shortcut icon" href="/favicon.ico?v=2">
    <link rel="stylesheet" href="/site.css?v={{ @filemtime(public_path('site.css')) ?: 3 }}">
    <link rel="stylesheet" href="/portal.css?v={{ @filemtime(public_path('portal.css')) ?: 3 }}">
    <link rel="stylesheet" href="/institutional.css?v={{ @filemtime(public_path('institutional.css')) ?: 3 }}">
    <link rel="stylesheet" href="/theme.css?v={{ @filemtime(public_path('theme.css')) ?: 3 }}">
    <script defer src="/build/app.js?v={{ @filemtime(public_path('build/app.js')) ?: 3 }}"></script>
</head>
<body><div id="app"></div></body>
</html>
