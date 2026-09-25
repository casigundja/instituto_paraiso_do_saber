const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const options = {
  entryPoints: ['resources/js/app.tsx'],
  bundle: true,
  minify: true,
  jsx: 'automatic',
  outfile: 'public/build/app.js',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
};

function copyToDist() {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const rootFiles = [
    'index.html',
    'styles.css',
    'app.js',
    'banner1.jpeg',
    'banner2.jpeg',
    'banner3.jpeg',
    'logo_paraiso_do_saber.jpeg',
    'publicidade1.mp4',
    'publicidade2.mp4',
    'publicidade3.mp4',
    'publicidade4.mp4',
    'publicidade5.mp4',
  ];

  for (const file of rootFiles) {
    const src = path.join(rootDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDir, file));
    }
  }

  const favicon = path.join(rootDir, 'public', 'favicon.ico');
  if (fs.existsSync(favicon)) {
    fs.copyFileSync(favicon, path.join(distDir, 'favicon.ico'));
  }
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
