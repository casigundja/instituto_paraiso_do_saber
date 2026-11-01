const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const options = {
  entryPoints: ['resources/js/app.tsx'],
  bundle: true,
  minify: true,
  jsx: 'automatic',
  outfile: 'public/build/app.js',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
};

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (entry === 'index.php' || entry === '.htaccess' || entry === 'hot') continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function copyToDist() {
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.join(rootDir, 'public');
  const distDir = path.join(rootDir, 'dist');

  try {
    if (fs.existsSync(path.join(rootDir, 'database', 'database.sqlite'))) {
      execSync('php scripts/export-db.php', { cwd: rootDir, stdio: 'inherit' });
    }
  } catch (e) {
    console.warn('Skipping DB export:', e.message);
  }

  fs.mkdirSync(distDir, { recursive: true });
  copyRecursive(publicDir, distDir);

  const ver = Date.now();
  const spaHtml = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Instituto Paraíso do Saber | Formação que transforma</title>
    <meta name="description" content="Formação profissional na área da saúde em Luanda. Conheça os cursos técnicos do Instituto Paraíso do Saber.">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Instituto Paraíso do Saber">
    <meta property="og:title" content="Instituto Paraíso do Saber">
    <meta property="og:description" content="Formação profissional na área da saúde.">
    <meta property="og:image" content="/banner1.jpeg">
    <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png?v=2">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2">
    <link rel="shortcut icon" href="/favicon.ico?v=2">
    <link rel="stylesheet" href="/site.css?v=${ver}">
    <link rel="stylesheet" href="/portal.css?v=${ver}">
    <link rel="stylesheet" href="/institutional.css?v=${ver}">
    <link rel="stylesheet" href="/theme.css?v=${ver}">
    <script defer src="/build/app.js?v=${ver}"></script>
</head>
<body><div id="app"></div></body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), spaHtml, 'utf8');
}

if (process.argv.includes('--watch')) {
  esbuild.context(options).then((ctx) => ctx.watch());
} else {
  esbuild
    .build(options)
    .then(() => {
      copyToDist();
      console.log('Static assets prepared in dist/');
    })
    .catch(() => process.exit(1));
}
