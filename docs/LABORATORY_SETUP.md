# Laboratório de Desenvolvimento e Testes: Concierge Control

**Versão:** 1.0
**Data:** 10 de Julho de 2025
**Objetivo:** Detalhar todos os componentes de software, hardware e ferramentas necessários para criar um ambiente de desenvolvimento, prototipagem e testes de ponta a ponta para a plataforma Concierge Control.

---

## 1. Ambiente de Desenvolvimento de Software (Estação de Trabalho)

Esta é a base para toda a codificação e gerenciamento do projeto.

*   **[x] Computador Principal:** Um computador (desktop ou notebook) com capacidade suficiente para rodar múltiplos processos (backend, banco de dados, emulador de celular).
*   **[x] Editor de Código (IDE):** Visual Studio Code.
    *   **Extensões Recomendadas:** Prettier, ESLint, Prisma, Docker, GitLens.
*   **[x] Runtimes e Ferramentas:**
    *   Node.js (versão LTS mais recente).
    *   Docker Desktop (para rodar o banco de dados e outros serviços).
    *   Git (para controle de versão).
    *   Postman ou Insomnia (para testar a API do backend).
*   **[x] Ambiente de Desenvolvimento Móvel:**
    *   **Android:** Android Studio (para o SDK e o emulador oficial do Android).

---

## 2. Infraestrutura do Backend e Simulação de Rede

Ambiente para rodar e testar o cérebro do sistema.

*   **[x] Banco de Dados:** Instância do PostgreSQL rodando em um container Docker.
*   **[x] Rede Local:** Um roteador Wi-Fi simples. **Crucial:** O computador de desenvolvimento e todos os dispositivos IoT (ESP32/Raspberry Pi) devem estar conectados à mesma rede para que possam se comunicar.

---

## 3. Bancada de Integração com Interfone Comercial (Simulação da Porta Principal)

Esta bancada irá replicar a integração do **Concierge Control** com um dispositivo de acesso real, testando o fluxo de comunicação e comando de ponta a ponta.

*   **[ ] Estrutura:** Uma placa de madeira ou MDF para montar a fechadura e a botoeira.
*   **[ ] Dispositivo de Acesso Principal:**
    *   [ ] 1x **Interfone Inteligente Comercial:** Um modelo de mercado (ex: Hikvision, Intelbras, Akuvox) com suporte a Reconhecimento Facial, Biometria e, crucialmente, uma **API ou SDK para integração de software**.
*   **[ ] Acesso à Documentação da API:**
    *   [ ] **Essencial:** Acesso completo à documentação do desenvolvedor fornecida pelo fabricante do interfone. Sem isso, a integração é impossível.
*   **[ ] Atuador (A Trava da Porta Principal):**
    *   [ ] 1x **Fechadura Eletroímã 12V:** O padrão robusto e seguro para portas de acesso principal. Ela será conectada diretamente à saída de relé do interfone inteligente.
*   **[ ] Entrada Manual:**
    *   [ ] 1x **Botoeira (Push Button):** Para simular um botão de saída. Ela será conectada diretamente à entrada específica para botoeiras no interfone ou na sua fonte de alimentação.
*   **[ ] Feedback para o Usuário:**
    *   O próprio interfone comercial já possui LEDs e feedback sonoro, que serão utilizados nos testes.

## 4. Protótipo dos Armários Inteligentes (Smart Lockers)

Esta bancada simulará o módulo de recebimento de encomendas.

*   **[ ] Estrutura:** 2 a 4 caixas pequenas de MDF ou acrílico para servirem como os compartimentos.
*   **[ ] Cérebro do Controle:**
    *   [ ] 1x **Microcontrolador ESP32** ou **1x Raspberry Pi Zero W:** O Raspberry Pi é uma boa opção se você quiser adicionar uma pequena tela no futuro.
*   **[ ] Interface com o Usuário:**
    *   [ ] 1x **Leitor de QR Code com interface USB ou Serial (TTL):** Essencial para que entregadores e moradores possam se autenticar no console dos armários.
*   **[ ] Atuadores (As Travas):**
    *   [ ] 2 a 4x **Fechaduras Solenoide 12V** (uma para cada compartimento).
*   **[ ] Sensores de Status:**
    *   [ ] 2 a 4x **Sensores Magnéticos (Reed Switch)** (um para cada porta): Essencial para o sistema saber se a porta do compartimento está aberta ou fechada.
*   **[ ] Módulo de Acionamento:**
    *   [ ] 1x **Módulo Relé de 4 ou 8 Canais:** Para controlar as múltiplas fechaduras.
---

## 5. Alimentação e Ferramentas Gerais

Os componentes que unem todo o laboratório.

*   **[x] Fontes de Alimentação:**
    *   [x] 1x **Fonte de Alimentação 12V 5A:** Uma fonte robusta para alimentar todas as fechaduras e a eletrônica sem sobrecarga.
    *   [x] 2x **Conversor de Tensão (Buck Converter) 12V para 5V:** Para alimentar os microcontroladores (ESP32/Raspberry Pi) a partir da fonte principal de 12V.
*   **[x] Ferramentas de Eletrônica:**
    *   [x] 1x **Multímetro:** **Indispensável** para medir tensões e depurar problemas elétricos.
    *   [x] 1x **Ferro de Solda e Estanho.**
    *   [x] 1x **Protoboard (Breadboard):** Para montar os circuitos de forma não permanente.
    *   [x] 1x **Kit de Jumpers (fios Macho-Macho, Macho-Fêmea, Fêmea-Fêmea).**
*   **[x] Ferramentas Manuais:**
    *   [x] Jogo de chaves de fenda e Phillips.
    *   [x] Alicate de corte e de bico.
    *   [x] Parafusos, porcas e abraçadeiras plásticas (zip ties).

---

## 6. Roadmap de Montagem do Laboratório

1.  **Fase 1: Software.** Instale todo o ambiente de desenvolvimento. Consiga rodar o backend e conectá-lo ao banco de dados em Docker.
2.  **Fase 2: Integração com Interfone.** Monte a bancada de controle de acesso com o interfone comercial. Desenvolva a camada de integração no backend para se comunicar com a API do fabricante. Realize o primeiro teste de ponta a ponta: um evento no interfone (ex: biometria válida) é recebido pelo seu backend.
3.  **Fase 3: Comando de Acesso.** Implemente o fluxo inverso: uma ação no seu sistema (via Postman ou app) envia um comando para a API do interfone para destravar a fechadura eletroímã.
4.  **Fase 4: Protótipo dos Armários.** Monte a bancada dos armários. Desenvolva o firmware do ESP32/Raspberry Pi para controlar os relés, ler os sensores de porta e, crucialmente, **ler os dados do leitor de QR Code** e enviá-los para a sua API.
5.  **Fase 5: Integração Total.** Conecte o aplicativo móvel a todos os sistemas. Teste o fluxo completo de ponta a ponta:
    *   **Acesso:** Um visitante usa o QR Code no interfone comercial.
    *   **Encomenda:** Um entregador usa o QR Code no console dos armários para deixar um pacote, e o morador usa o QR Code do app para retirá-lo.