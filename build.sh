#!/bin/bash

# Script de build para Vercel
echo "🚀 Iniciando build para Vercel..."

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm ci

# Build del frontend
echo "🔨 Compilando frontend..."
npm run build

echo "✅ Build completado exitosamente!"
