#!/bin/bash

echo "📢 Configurando AWS SNS no LocalStack..."

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

# Criar tópico para notificações de usuários
echo "👥 Criando tópico para notificações de usuários..."
aws --endpoint-url=http://localhost:4566 sns create-topic \
    --name "protect-sys-user-notifications" \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Tópico para notificações de usuários criado com sucesso!"
else
    echo "⚠️ Tópico já existe ou erro na criação"
fi

# Criar tópico para notificações de pagamento
echo "💳 Criando tópico para notificações de pagamento..."
aws --endpoint-url=http://localhost:4566 sns create-topic \
    --name "protect-sys-payment-notifications" \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Tópico para notificações de pagamento criado com sucesso!"
else
    echo "⚠️ Tópico já existe ou erro na criação"
fi

# Criar tópico para notificações de sistema
echo "⚙️ Criando tópico para notificações de sistema..."
aws --endpoint-url=http://localhost:4566 sns create-topic \
    --name "protect-sys-system-notifications" \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Tópico para notificações de sistema criado com sucesso!"
else
    echo "⚠️ Tópico já existe ou erro na criação"
fi

# Listar tópicos para verificar
echo "📋 Listando tópicos disponíveis..."
aws --endpoint-url=http://localhost:4566 sns list-topics --region us-east-1

echo "🎉 Configuração do AWS SNS concluída!" 