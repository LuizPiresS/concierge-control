# Documento Técnico: Firmware do Módulo de Armários Inteligentes

**Versão:** 1.2 (Arquitetura Finalizada)
**Data:** 11 de Julho de 2025
**Autor:** Luiz Pires
**Sistema:** Concierge Control

---

## 1. Objetivo

Este documento descreve a arquitetura de firmware e o processo de implementação para o "cérebro" do Módulo de Armários Inteligentes. O objetivo é desenvolver um software para o microcontrolador ESP32 capaz de controlar um sistema escalável (neste caso, 15 compartimentos) utilizando expansores de I/O.

O firmware será capaz de:

1.  Ler dados de um leitor de QR Code via interface serial.
2.  Comunicar-se com a API backend do **Concierge Control** via Wi-Fi.
3.  Receber comandos da API e acionar as travas dos 15 compartimentos correspondentes.
4.  Ler o status das 15 portas (aberta/fechada) através de sensores magnéticos.

## 2. Componentes de Hardware (Revisado para 15 Portas com Módulo Centralizado)

| Componente                  | Quantidade | Função                                                              |
| --------------------------- | :--------: | ------------------------------------------------------------------- |
| Microcontrolador ESP32      |     1      | Cérebro do sistema, responsável pela lógica e conectividade Wi-Fi.  |
| **Expansor de I/O MCP23017**  |   **2**    | **Fornece 32 pinos GPIO extras para controlar relés e ler sensores.** |
| Leitor de QR Code (Serial)  |     1      | Interface para autenticação de entregadores e moradores.            |
| **Módulo Relé de 16 Canais**  |   **1**    | **Aciona as fechaduras dos 15 compartimentos de forma centralizada.** |
| Fechadura Solenoide 12V     |     15     | Trava física de cada compartimento.                                 |
| Sensor Magnético (Reed)     |     15     | Detecta se a porta de um compartimento está aberta ou fechada.      |
| Fonte de Alimentação 12V 5A |     1      | Alimenta as fechaduras e a eletrônica.                              |
| Conversor Buck 12V->5V      |     1      | Alimenta o ESP32 de forma segura a partir da fonte principal.       |

## 3. Diagrama de Conexão (Revisado para 15 Portas)

A conexão agora é centralizada no barramento I2C do ESP32, permitindo a escalabilidade.

### 3.1. Conexão do Barramento I2C

*   **Pino 21 (SDA) do ESP32** -> Pino **SDA** de ambos os MCP23017
*   **Pino 22 (SCL) do ESP32** -> Pino **SCL** de ambos os MCP23017
*   **Pino 5V do ESP32** -> Pino **VCC** de ambos os MCP23017
*   **Pino GND do ESP32** -> Pino **GND** de ambos os MCP23017

### 3.2. Endereçamento dos Expansores

Para que o ESP32 possa falar com cada chip individualmente, eles precisam de endereços I2C diferentes.

*   **Expansor 1 (Relés - Endereço `0x20`):**
    *   Conecte os pinos **A0, A1, A2** ao **GND**.
*   **Expansor 2 (Sensores - Endereço `0x21`):**
    *   Conecte os pinos **A1, A2** ao **GND**.
    *   Conecte o pino **A0** ao **5V**.

### 3.3. Conexão dos Relés e Sensores

*   **Módulo Relé de 16 Canais:** Conecte os pinos de controle `IN1` a `IN15` do módulo de relé aos 15 primeiros pinos GPIO do **Expansor 1 (Endereço 0x20)**. O pino `IN16` ficará sem uso.
*   **15 Sensores de Porta:** Conecte os 15 sensores aos 15 primeiros pinos GPIO do **Expansor 2 (Endereço 0x21)**.

## 4. Implementação do Firmware (Revisado para 15 Portas)

O código utiliza a biblioteca da Adafruit para o MCP23017, que deve ser adicionada ao projeto.

``` cpp 
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "Adafruit_MCP23017.h" // Biblioteca para o expansor de I/O

// --- Configurações de Rede ---
const char* ssid = "NOME_DA_REDE_WIFI";
const char* password = "SENHA_DA_REDE_WIFI";
const String apiEndpoint = "http://IP_DO_SEU_BACKEND:3000/api/lockers/check-qr";

// --- Mapeamento de Pinos (GPIOs) ---
// Leitor de QR Code (usando a porta Serial2)
#define QR_RX_PIN 16
#define QR_TX_PIN 17
HardwareSerial& qrSerial = Serial2;

// --- Configuração dos Expansores I/O ---
const int NUM_LOCKERS = 15;

// Cria objetos para cada expansor, um para os relés e outro para os sensores
Adafruit_MCP23017 mcp_relays;
Adafruit_MCP23017 mcp_sensors;

// --- Funções Auxiliares ---
void connectToWiFi() {
  Serial.print("Conectando ao Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

// Função revisada para usar o expansor de relés
void openLocker(int lockerIndex) {
  if (lockerIndex < 0 || lockerIndex >= NUM_LOCKERS) {
    Serial.println("Erro: Índice do compartimento inválido.");
    return;
  }

  Serial.print("Abrindo compartimento ");
  Serial.println(lockerIndex + 1);

  // Aciona o pino correspondente no expansor de relés
  mcp_relays.digitalWrite(lockerIndex, LOW); // Assumindo que LOW ativa o relé
  delay(500); // Mantém a trava acionada por 0.5 segundos
  mcp_relays.digitalWrite(lockerIndex, HIGH);
}

// Nova função para ler o status de um sensor
bool isLockerDoorClosed(int lockerIndex) {
    if (lockerIndex < 0 || lockerIndex >= NUM_LOCKERS) {
        return false; // Retorna um estado inválido
    }
    // Lê o pino do expansor de sensores.
    // Retorna 'true' se o pino estiver em LOW (porta fechada, circuito completo)
    return mcp_sensors.digitalRead(lockerIndex) == LOW;
}


void handleQrCode(String qrData) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String fullUrl = apiEndpoint + "?qrToken=" + qrData;
    http.begin(fullUrl);
    
    Serial.print("Enviando QR Code para a API: ");
    Serial.println(qrData);

    int httpCode = http.GET();

    if (httpCode > 0) {
      String payload = http.getString();
      Serial.printf("API Response Code: %d\n", httpCode);
      Serial.printf("API Payload: %s\n", payload.c_str());

      if (httpCode == 200 && payload.startsWith("OPEN:")) {
        // A API responde com o índice do armário (0 a 14)
        int lockerToOpen = payload.substring(5).toInt();
        openLocker(lockerToOpen);
      } else {
        Serial.println("API retornou um erro ou acesso negado.");
      }
    } else {
      Serial.printf("Falha na requisição HTTP. Erro: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  } else {
    Serial.println("Erro: Sem conexão Wi-Fi para validar o QR Code.");
  }
}

// --- Funções Principais ---
void setup() {
  Serial.begin(115200);
  Serial.println("\n[Concierge Control] - Firmware do Módulo de Armários v1.2 (15 Portas)");

  // Inicia o barramento I2C
  Wire.begin();

  // Inicia o expansor de relés no endereço 0x20
  if (!mcp_relays.begin_I2C(0x20)) {
    Serial.println("Erro ao encontrar o MCP23017 dos relés. Verifique a conexão e o endereço.");
    while (1);
  }

  // Inicia o expansor de sensores no endereço 0x21
  if (!mcp_sensors.begin_I2C(0x21)) {
    Serial.println("Erro ao encontrar o MCP23017 dos sensores. Verifique a conexão e o endereço.");
    while (1);
  }

  // Configura todos os 15 pinos do expansor de relés como SAÍDA (OUTPUT)
  for (int i = 0; i < NUM_LOCKERS; i++) {
    mcp_relays.pinMode(i, OUTPUT);
    mcp_relays.digitalWrite(i, HIGH); // Garante que todos os relés comecem desligados
  }

  // Configura todos os 15 pinos do expansor de sensores como ENTRADA com PULL-UP
  for (int i = 0; i < NUM_LOCKERS; i++) {
    mcp_sensors.pinMode(i, INPUT_PULLUP);
  }

  // Inicia a comunicação serial com o leitor de QR Code
  qrSerial.begin(9600, SERIAL_8N1, QR_RX_PIN, QR_TX_PIN);
  
  connectToWiFi();

  Serial.println("Sistema pronto. Aguardando QR Code...");
}

void loop() {
  // Verifica se há algum dado disponível vindo do leitor de QR Code
  if (qrSerial.available()) {
    String qrCodeData = qrSerial.readStringUntil('\n');
    qrCodeData.trim();

    if (qrCodeData.length() > 0) {
      handleQrCode(qrCodeData);
    }
  }

  // Exemplo de como monitorar o status de uma porta (pode ser expandido)
  // static unsigned long lastSensorCheck = 0;
  // if (millis() - lastSensorCheck > 2000) { // Verifica a cada 2 segundos
  //   lastSensorCheck = millis();
  //   for (int i = 0; i < NUM_LOCKERS; i++) {
  //     Serial.printf("Porta %d está %s\n", i + 1, isLockerDoorClosed(i) ? "Fechada" : "Aberta");
  //   }
  // }
}
```

### 4.1. Instalação de Biblioteca

Via PlatformIO, adicione a seguinte linha ao seu arquivo `platformio.ini`:
