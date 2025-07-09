#!/bin/bash

# Script para instalar AWS CLI no ambiente WSL/Ubuntu
# Baseado em: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

set -e

echo "🚀 Instalando AWS CLI..."

# Verificar se já está instalado
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI já está instalado:"
    aws --version
    exit 0
fi

# Verificar se unzip está instalado
if ! command -v unzip &> /dev/null; then
    echo "📦 Instalando unzip..."
    sudo apt-get update
    sudo apt-get install -y unzip
fi

# Criar diretório temporário
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "📥 Baixando AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

echo "📦 Descompactando..."
unzip awscliv2.zip

echo "🔧 Instalando..."
sudo ./aws/install

echo "🧹 Limpando arquivos temporários..."
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "✅ AWS CLI instalado com sucesso!"
aws --version

echo ""
echo "🔧 Configurando AWS CLI para LocalStack..."
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set default.region us-east-1
aws configure set default.output json

echo "✅ Configuração concluída!"
echo "💡 Para usar com LocalStack, adicione --endpoint-url=http://localhost:4566 aos comandos"
echo "   Exemplo: aws s3 ls --endpoint-url=http://localhost:4566" 