const fs = require('fs');
for (const file of ['Home.tsx','Admin.tsx','Listing.tsx']) {
  const path = `resources/js/${file}`;
  let text = fs.readFileSync(path,'utf8').replace(/import Link from 'next\/link';/g, "import Link from './Link';");
  text = text.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*'http:\/\/localhost:4000\/api'/g, "'/api'");
  if(file==='Home.tsx') text=text.replace('await fetch(`${API}/public/leads`','const response=await fetch(`${API}/public/leads`').replace('setSent(true);form.reset()', "if(!response.ok)throw new Error('Falha ao enviar');setSent(true);form.reset()");
  fs.writeFileSync(path,text);
}
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts={dev:'php artisan serve',build:'node scripts/build.cjs','dev:assets':'node scripts/build.cjs --watch','legacy:dev':p.scripts.dev};
fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');
let env=fs.readFileSync('.env','utf8').replace(/^APP_NAME=.*$/m,'APP_NAME="Instituto Paraíso do Saber"').replace(/^APP_URL=.*$/m,'APP_URL=http://127.0.0.1:8000').replace(/^DB_DATABASE=.*\r?\n/m,'');
const old=fs.readFileSync('legacy/.env.node','utf8');
for(const key of ['ADMIN_EMAIL','ADMIN_PASSWORD']) {const match=old.match(new RegExp('^'+key+'=.*$','m'));if(match)env+='\n'+match[0];}
fs.writeFileSync('.env',env+'\n');
