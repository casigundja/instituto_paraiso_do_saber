const fs = require('node:fs');
const path = require('node:path');

const apiRoot = path.resolve(__dirname, '..');
const clientTarget = path.join(apiRoot, 'node_modules', '@prisma', 'client');
if (!fs.existsSync(path.join(clientTarget, 'package.json'))) {
  const rootClient = path.resolve(apiRoot, '..', '..', 'node_modules', '@prisma', 'client');
  if (!fs.existsSync(path.join(rootClient, 'package.json'))) {
    throw new Error('Instale as dependências do workspace antes de gerar o Prisma Client.');
  }
  fs.mkdirSync(path.dirname(clientTarget), { recursive: true });
  fs.cpSync(rootClient, clientTarget, { recursive: true });
}
