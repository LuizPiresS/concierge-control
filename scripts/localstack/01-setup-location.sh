#!/bin/bash

echo "🚀 Configurando AWS Location Service no LocalStack..."

# Aguardar o LocalStack estar pronto
echo "⏳ Aguardando LocalStack estar pronto..."
while ! curl -s http://localhost:4566/_localstack/health > /dev/null; do
    sleep 2
done

echo "✅ LocalStack está pronto!"

# Configurar variáveis de ambiente para AWS CLI
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566

# Criar Place Index para geocodificação
echo "🗺️ Criando Place Index para geocodificação..."

aws --endpoint-url=http://localhost:4566 location create-place-index \
    --index-name "protect-sys-place-index" \
    --data-source "Here" \
    --description "Place index para geocodificação do Protect-Sys-ERP" \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Place Index criado com sucesso!"
else
    echo "⚠️ Place Index já existe ou erro na criação"
fi

# Listar Place Indexes para verificar
echo "📋 Listando Place Indexes disponíveis..."
aws --endpoint-url=http://localhost:4566 location list-place-indexes --region us-east-1

echo "🎉 Configuração do AWS Location Service concluída!" 