#!/bin/bash

echo "🔐 Configurando AWS Secrets Manager no LocalStack..."

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

# Criar secret para configuração de email
echo "📧 Criando secret para configuração de email..."
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
    --name "protect-sys/email-config" \
    --description "Configuração de email do Protect-Sys-ERP" \
    --secret-string '{
        "host": "smtp.gmail.com",
        "port": 587,
        "username": "noreply@protect-sys.com",
        "password": "your-email-password",
        "from": "noreply@protect-sys.com"
    }' \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Secret para configuração de email criado com sucesso!"
else
    echo "⚠️ Secret já existe ou erro na criação"
fi

# Criar secret para configuração de JWT
echo "🔑 Criando secret para configuração de JWT..."
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
    --name "protect-sys/jwt-config" \
    --description "Configuração de JWT do Protect-Sys-ERP" \
    --secret-string '{
        "secret": "your-super-secret-jwt-key-change-in-production",
        "expiresIn": "24h",
        "refreshExpiresIn": "7d"
    }' \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Secret para configuração de JWT criado com sucesso!"
else
    echo "⚠️ Secret já existe ou erro na criação"
fi

# Criar secret para configuração de pagamento
echo "💳 Criando secret para configuração de pagamento..."
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
    --name "protect-sys/payment-config" \
    --description "Configuração de pagamento do Protect-Sys-ERP" \
    --secret-string '{
        "provider": "stripe",
        "apiKey": "sk_test_your-stripe-test-key",
        "webhookSecret": "whsec_your-webhook-secret"
    }' \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Secret para configuração de pagamento criado com sucesso!"
else
    echo "⚠️ Secret já existe ou erro na criação"
fi

# Listar secrets para verificar
echo "📋 Listando secrets disponíveis..."
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets --region us-east-1

echo "🎉 Configuração do AWS Secrets Manager concluída!" 