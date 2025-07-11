# Backlog do Projeto: Concierge Control

**Versão:** 1.0
**Data:** 11 de Julho de 2025
**Objetivo:** Este documento detalha todas as tarefas de desenvolvimento, infraestrutura e hardware necessárias para a implementação completa da plataforma Concierge Control, divididas por fases de entrega.

---

## 🛠️ Fase 0: Pré-requisitos (Montagem do Ambiente)

*Antes de começar o desenvolvimento, é crucial ter o laboratório pronto.*

- [ ] **Tarefa 0.1 (Software):** Instalar todas as ferramentas na estação de trabalho (VS Code, Node.js, Docker, Postman, Android Studio).
- [ ] **Tarefa 0.2 (Infra):** Configurar o roteador Wi-Fi e garantir que o computador de desenvolvimento consiga se conectar a ele.
- [ ] **Tarefa 0.3 (Hardware):** Adquirir todos os componentes listados no `LABORATORY_SETUP.md` (ESP32, relés, sensores, fontes, etc.).
- [ ] **Tarefa 0.4 (Bancada):** Montar fisicamente as bancadas de teste para o interfone e para os armários inteligentes.

---

## 🚀 Fase 1: Fundação (Gestão de Identidade e Acesso)

**Objetivo:** Criar o núcleo do sistema onde os usuários podem ser cadastrados e autenticados.

### Backend (NestJS)
- [ ] **Tarefa 1.1:** Iniciar o projeto NestJS, configurar ESLint, Prettier e a conexão com o Prisma.
- [ ] **Tarefa 1.2:** Modelar o schema do banco de dados no Prisma (`User`, `Unit`, `Role`).
- [ ] **Tarefa 1.3:** Implementar o endpoint de registro de usuário (`POST /auth/register`).
- [ ] **Tarefa 1.4:** Implementar o endpoint de login (`POST /auth/login`) com geração de token JWT.
- [ ] **Tarefa 1.5:** Criar um endpoint protegido para buscar dados do usuário logado (`GET /users/me`).

### Infraestrutura (Docker)
- [ ] **Tarefa 1.6:** Criar o arquivo `docker-compose.yml` para subir a instância do banco de dados PostgreSQL.

### Testes
- [ ] **Tarefa 1.7:** Usar o Postman/Insomnia para testar e validar todos os endpoints criados na Fase 1.

---

## 📱 Fase 2: Segurança e Experiência Móvel (Controle de Acesso)

**Objetivo:** Permitir que o morador abra portas pelo app e integrar com o hardware de acesso principal.

### Backend (NestJS)
- [ ] **Tarefa 2.1:** Estender o schema do Prisma com `AccessPoint` (portas, portões) e `AccessLog`.
- [ ] **Tarefa 2.2:** Criar os endpoints para gerenciar os pontos de acesso (`GET /access-points`).
- [ ] **Tarefa 2.3:** Criar o endpoint de comando para abrir uma porta (`POST /access-points/{id}/open`).
- [ ] **Tarefa 2.4:** Desenvolver o módulo de integração que se comunica com a **API do interfone comercial** para enviar o comando de abertura.
- [ ] **Tarefa 2.5:** Implementar a lógica para gerar e gerenciar convites com QR Code para visitantes.

### Aplicativo Móvel (React Native/Flutter)
- [ ] **Tarefa 2.6:** Iniciar o projeto do aplicativo móvel.
- [ ] **Tarefa 2.7:** Desenvolver as telas de Login e Registro, integrando com a API da Fase 1.
- [ ] **Tarefa 2.8:** Criar a tela principal (Dashboard) que lista os pontos de acesso (portas).
- [ ] **Tarefa 2.9:** Implementar a funcionalidade do botão "Abrir Porta", que chama a API do backend.
- [ ] **Tarefa 2.10:** Desenvolver a tela para gerar o convite com QR Code para visitantes.

### Testes
- [ ] **Tarefa 2.11:** Realizar o teste de ponta a ponta: clicar no botão no app e verificar se a fechadura eletroímã na bancada é acionada.

---

## 📦 Fase 3: Logística Automatizada (Armários Inteligentes)

**Objetivo:** Implementar o fluxo completo de entrega e retirada de encomendas nos armários.

### Backend (NestJS)
- [ ] **Tarefa 3.1:** Estender o schema do Prisma com `LockerModule`, `LockerCompartment`, `Package` e `DeliveryLog`.
- [ ] **Tarefa 3.2:** Criar o endpoint que o **ESP32 irá chamar** para validar um QR Code (`GET /api/lockers/check-qr`). A resposta deve ser `OPEN:{compartment_index}`.
- [ ] **Tarefa 3.3:** Criar os endpoints para o fluxo de entrega (iniciar entrega, confirmar depósito).
- [ ] **Tarefa 3.4:** Criar os endpoints para o fluxo de retirada (morador solicita retirada, armário abre).
- [ ] **Tarefa 3.5:** Implementar o envio de notificações push para o app do morador quando uma encomenda é entregue.

### Firmware (ESP32)
- [ ] **Tarefa 3.6:** Montar o circuito do protótipo com o ESP32, os 2 expansores MCP23017, o módulo de 16 relés e os sensores, conforme o `FIRMWARE_SMART_LOCKER.md`.
- [ ] **Tarefa 3.7:** Configurar o ambiente PlatformIO e instalar a biblioteca `Adafruit_MCP23017`.
- [ ] **Tarefa 3.8:** Gravar o firmware no ESP32, configurando as credenciais de Wi-Fi e o IP do backend.
- [ ] **Tarefa 3.9:** Testar a leitura do QR Code e a comunicação com o backend.
- [ ] **Tarefa 3.10:** Testar o acionamento dos relés e a leitura dos sensores de porta através dos expansores.

### Aplicativo Móvel
- [ ] **Tarefa 3.11:** Desenvolver a seção "Minhas Encomendas" no app.
- [ ] **Tarefa 3.12:** Implementar o recebimento e a exibição de notificações de entrega.
- [ ] **Tarefa 3.13:** Exibir o QR Code de retirada para o morador.

### Testes
- [ ] **Tarefa 3.14:** Realizar o fluxo completo: escanear um QR Code de "entregador", verificar a abertura do compartimento, checar a notificação no app, e então usar o QR Code do app para retirar a encomenda.

---

## 🤝 Fase 4: Comunidade (Recursos Adicionais)

**Objetivo:** Adicionar funcionalidades que melhoram a gestão e a vida em comunidade.

### Backend (NestJS)
- [ ] **Tarefa 4.1:** Modelar o schema no Prisma para `Amenity` (área comum), `Reservation`, `Announcement` e `Occurrence`.
- [ ] **Tarefa 4.2:** Implementar todos os endpoints CRUD (Create, Read, Update, Delete) para gerenciar essas quatro funcionalidades.

### Aplicativo Móvel
- [ ] **Tarefa 4.3:** Desenvolver a tela de "Reserva de Áreas Comuns" com um calendário.
- [ ] **Tarefa 4.4:** Desenvolver a tela de "Mural de Avisos".
- [ ] **Tarefa 4.5:** Desenvolver a tela para "Abrir e Acompanhar Ocorrências".

### Testes
- [ ] **Tarefa 4.6:** Validar a criação e visualização de reservas, avisos e ocorrências através do aplicativo.