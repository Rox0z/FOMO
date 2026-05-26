#!/bin/sh

echo "🛠️ Sincronizando a Base de Dados (Drizzle Push)..."
npx drizzle-kit push

echo "🌱 Seeding Dados de Teste (Admin, Vendor e Evento)..."
npx tsx src/db/seed.ts

echo "▶️ Iniciando o Servidor NestJS em Modo Desenvolvimento..."
npm run start:dev