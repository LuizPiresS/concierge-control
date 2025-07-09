#!/bin/bash

echo "🚀 Inicializando LocalStack para o Protect-Sys-ERP..."
echo "=================================================="

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se o AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não está instalado. Por favor, instale o AWS CLI primeiro."
    echo "📖 Instruções: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Iniciar o LocalStack
echo "🔧 Iniciando LocalStack..."
docker-compose up -d localstack

# Aguardar o LocalStack estar pronto
echo "⏳ Aguardando LocalStack estar pronto..."
while ! curl -s http://localhost:4566/_localstack/health > /dev/null; do
    echo "   Aguardando..."
    sleep 5
done

echo "✅ LocalStack está pronto!"

# Executar scripts de configuração
echo "📋 Executando scripts de configuração..."

# Configurar Location Service
echo "🗺️ Configurando Location Service..."
./scripts/localstack/01-setup-location.sh

# Configurar S3
echo "🪣 Configurando S3..."
./scripts/localstack/02-setup-s3.sh

# Configurar SNS
echo "📢 Configurando SNS..."
./scripts/localstack/03-setup-sns.sh

# Configurar Secrets Manager
echo "🔐 Configurando Secrets Manager..."
./scripts/localstack/04-setup-secretsmanager.sh

echo ""
echo "🎉 Configuração do LocalStack concluída!"
echo ""
echo "📊 Status dos serviços:"
echo "   - LocalStack: http://localhost:4566"
echo "   - S3: http://localhost:4566 (via AWS CLI)"
echo "   - SNS: http://localhost:4566 (via AWS CLI)"
echo "   - Location: http://localhost:4566 (via AWS CLI)"
echo "   - Secrets Manager: http://localhost:4566 (via AWS CLI)"
echo ""
echo "🔧 Para testar os serviços, use:"
echo "   aws --endpoint-url=http://localhost:4566 s3 ls"
echo "   aws --endpoint-url=http://localhost:4566 sns list-topics"
echo "   aws --endpoint-url=http://localhost:4566 location list-place-indexes"
echo "   aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets"
echo ""
echo "📝 Lembre-se de copiar o arquivo env.example para .env e configurar as variáveis!" 