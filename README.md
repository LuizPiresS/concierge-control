# Concierge Control

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/NestJS-11.x-red.svg" alt="NestJS Version" />
  <img src="https://img.shields.io/badge/Prisma-6.x-blue.svg" alt="Prisma Version" />
  <img src="https://img.shields.io/badge/License-UNLICENSED-lightgrey.svg" alt="License" />
</p>

## 📝 Descrição

**Concierge Control** é uma aplicação de back-end robusta e escalável, construída com o framework NestJS. O projeto serve como um sistema de gerenciamento para condomínios, implementando uma arquitetura limpa para garantir a separação de responsabilidades e a manutenibilidade do código a longo prazo.

## ✨ Principais Funcionalidades e Tecnologias

- **Core Framework**: NestJS (TypeScript)
- **Arquitetura**: Baseada em princípios de Arquitetura Limpa (Clean Architecture), com uma clara separação entre Domínio, Aplicação e Infraestrutura.
- **Banco de Dados**: PostgreSQL com Prisma como ORM.
- **Serviços AWS**: Integração com serviços da AWS, simulados localmente com LocalStack para um desenvolvimento eficiente.
  - **S3**: Armazenamento de arquivos (fotos de perfil, documentos).
  - **SES**: Envio de e-mails transacionais.
  - **Outros**: SNS, SQS, Location Service, Secrets Manager.
- **Qualidade de Código**:
  - **ESLint**: Para padronização de código.
  - **Prettier**: Para formatação automática.
  - **Husky & lint-staged**: Para garantir que o código seja verificado e formatado antes de cada commit.
  - **Commitlint**: Para padronizar as mensagens de commit.
- **Testes**: Cobertura de testes unitários e de integração com Jest.
- **Containerização**: Ambiente de desenvolvimento totalmente containerizado com Docker e Docker Compose.

---

## 🚀 Guia de Configuração do Ambiente

Siga estes passos para configurar e executar o projeto localmente.

### Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados:

- **Node.js**: Versão 18.x ou superior (versão LTS recomendada).
- **Docker** & **Docker Compose**: Para orquestrar os containers.

### 1. Clonar o Repositório

```bash
git clone <url-do-seu-repositorio>
cd concierge-control
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`. Os valores padrão já estão configurados para funcionar com o ambiente Docker local.

```bash
cp .env.example .env
```

### 3. Instalar Dependências

Instale todas as dependências do Node.js:

```bash
npm install
```

### 4. Instalar e Configurar a AWS CLI (Apenas na primeira vez)

Para interagir com o LocalStack a partir do seu terminal, você precisa da AWS CLI. Este script irá instalá-la (se necessário) e configurar um perfil `localstack` para facilitar a comunicação.

> **Importante**: Você só precisa executar este comando **uma vez por máquina**.

```bash
npm run aws:setup
```

### 5. Iniciar o Ambiente Docker

Use o comando principal do projeto para subir todos os containers e configurar os serviços da AWS no LocalStack automaticamente.

```bash
npm run dev:up
```

**O que este script faz?**
1.  Verifica se o Docker e a AWS CLI estão disponíveis.
2.  Para e remove containers antigos para garantir um ambiente limpo.
3.  Sobe todos os serviços (`app`, `db`, `redis`, `localstack`) em background.
4.  O LocalStack executa automaticamente os scripts em `scripts/localstack/`, criando buckets S3, identidade SES, etc.
5.  Aguarda até que o ambiente esteja totalmente pronto para uso.

### 6. Rodar as Migrações do Banco de Dados

Com o container do banco de dados em execução, aplique as migrações do Prisma:

```bash
npx prisma migrate dev
```

🎉 **Pronto!** Seu ambiente de desenvolvimento está configurado e em execução.

---

## ⚙️ Comandos Úteis

### Executando a Aplicação

- **Modo de desenvolvimento com watch:**
  ```bash
  npm run start:dev
  ```

- **Modo de produção:**
  ```bash
  npm run build
  npm run start:prod
  ```

### Executando Testes

- **Rodar todos os testes unitários e de integração:**
  ```bash
  npm run test
  ```

- **Gerar relatório de cobertura de testes:**
  ```bash
  npm run test:cov
  ```

### Documentação da API

A API é documentada com Swagger (OpenAPI). Após iniciar a aplicação, acesse a documentação interativa em:
http://localhost:3000/api (A porta pode variar conforme seu `.env`)

---

## ☁️ LocalStack e Serviços AWS

O projeto utiliza **LocalStack** para simular a infraestrutura da AWS localmente. Isso permite desenvolver e testar integrações com serviços como S3 e SES sem custos e sem a necessidade de uma conta AWS real para o desenvolvimento diário.

- **Inicialização Automática**: Os scripts localizados em `./scripts/localstack/` são executados automaticamente quando o container do LocalStack inicia, configurando todos os recursos necessários (buckets, identidades de e-mail, etc.).
- **Verificação**: Após a inicialização, você pode verificar os recursos criados usando a AWS CLI apontada para o LocalStack. O script `setup-localstack.sh` exibe exemplos de comandos ao final de sua execução.

```sh
# Exemplo para verificar a identidade de e-mail criada no SES
aws --profile localstack --endpoint-url=http://localhost:4566 ses list-identities

# Exemplo para listar os buckets S3
aws --profile localstack --endpoint-url=http://localhost:4566 s3 ls
```

---

## 🔐 Variáveis de Ambiente

O arquivo `.env` é crucial para a configuração da aplicação. Ele é baseado no `.env.example`:

```dotenv
# .env.example

# APP CONFIGURATION
APP_NAME='concierge-control'
CONTAINER_NAME='concierge-control'
APP_PORT=3000
NODE_ENV=development
BASE_URL="http://localhost:${APP_PORT}"

# BCRYPT
SALTS=13

# DATABASE
DB_USER=postgres
DB_PASS=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=concierge-control
DB_SCHEMA=public

# Bcrypt
SALT_ROUNDS=13

# AWS
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_aws_region
AWS_LOCATION_INDEX_NAME=your_location_index_name
AWS_LOCATION_ENDPOINT=

# Email
MAIL_FROM='"Concierge Control" <no-reply@conciergecontrol.com>'
MAIL_HOST=smtp.ethereal.email
MAIL_USER=tess.botsford62@ethereal.email
MAIL_PORT=587
MAIL_PASS=m5rzwSe2wZJVz9euS9
```

> **Atenção**: O arquivo `.env` é ignorado pelo Git e nunca deve ser versionado.

## 📄 Licença

Este projeto é distribuído sob a licença UNLICENSED.
