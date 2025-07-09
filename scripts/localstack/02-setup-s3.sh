#!/bin/bash

echo "🪣 Configurando AWS S3 no LocalStack..."

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

# Criar bucket para fotos de perfil
echo "📸 Criando bucket para fotos de perfil..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://protect-sys-profile-photos --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Bucket para fotos de perfil criado com sucesso!"
else
    echo "⚠️ Bucket já existe ou erro na criação"
fi

# Criar bucket para documentos
echo "📄 Criando bucket para documentos..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://protect-sys-documents --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Bucket para documentos criado com sucesso!"
else
    echo "⚠️ Bucket já existe ou erro na criação"
fi

# Criar bucket para logs
echo "📝 Criando bucket para logs..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://protect-sys-logs --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Bucket para logs criado com sucesso!"
else
    echo "⚠️ Bucket já existe ou erro na criação"
fi

# Configurar CORS para os buckets
echo "🌐 Configurando CORS para os buckets..."

# CORS para fotos de perfil
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
    --bucket protect-sys-profile-photos \
    --cors-configuration '{
        "CORSRules": [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
                "AllowedOrigins": ["*"],
                "ExposeHeaders": ["ETag"]
            }
        ]
    }'

# CORS para documentos
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
    --bucket protect-sys-documents \
    --cors-configuration '{
        "CORSRules": [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
                "AllowedOrigins": ["*"],
                "ExposeHeaders": ["ETag"]
            }
        ]
    }'

# Listar buckets para verificar
echo "📋 Listando buckets disponíveis..."
aws --endpoint-url=http://localhost:4566 s3 ls

echo "🎉 Configuração do AWS S3 concluída!" 