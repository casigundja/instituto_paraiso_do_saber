FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate && npm run build && cp -R generated dist/generated
EXPOSE 4000
CMD ["sh","-c","npx prisma db push && npx tsx prisma/seed.ts && node dist/src/main.js"]
