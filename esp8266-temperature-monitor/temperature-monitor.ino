/**
 * FlyWeb Temperature Monitor
 * ==========================
 * An ESP8266-based temperature monitor that advertises
 * itself as a FlyWeb service.
 *
 * Install ESP8266 Board v2.3.0 in Arduino IDE by adding
 * this to the "Additional Board Manager URLs" under
 * "Preferences..." and select it for installation via
 * "Boards Manager..." under the "Tools" -> "Board: XXX"
 * menu.
 *
 *   http://arduino.esp8266.com/stable/package_esp8266com_index.json
 *
 * NOTES:
 *   * Use 74880 baud rate in "Serial Monitor"
 *     to view logger info
 *   * Select 921600 baud rate under the
 *     "Tools" -> "Upload Speed: XXX" menu for
 *     faster flash programming (tested using
 *     the "SparkFun Thing Dev" board)
 */

// ESP8266 libraries
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>

// OneWire v2.3.2 (install via "Manage Libraries...")
#include <OneWire.h>

// DallasTemperature v3.7.6 (install via "Manage Libraries...")
#include <DallasTemperature.h>

// Include HTTP server content (see "txt2cdefine" for details)
#include "arrow_svg.h"
#include "configuration_html.h"
#include "flyweb_svg.h"
#include "restarting_html.h"
#include "styles_css.h"
#include "smoothie_min_js.h"
#include "temperature_html.h"

// GPIO pin definitions
const int ONE_WIRE_BUS = 0; // OneWire bus for DS18B20 temperature sensor
const int AP_MODE_PIN = 2;  // Button for toggling WiFi access point mode
const int LED_PIN = 5;      // SparkFun Thing Dev on-board LED

// Other constants
const String DEVICE_BASE_NAME = "FlyWeb Temperature Monitor";
const int SERIAL_LOGGER_BAUD_RATE = 74880;
const int HTTP_SERVER_PORT = 80;
const int MIN_DEBOUNCE_COUNT = 10;

// Debounce variables for AP_MODE_PIN
bool accessPointMode = false;
int apModePinValue = LOW;
int apModePinLastValue = LOW;
long apModePinLastReadTime = 0;
int apModePinDebounceCount = 0;

// DS18B20 temperature sensor
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// HTTP server
ESP8266WebServer server(HTTP_SERVER_PORT);

// WiFi network info
String selectedSSID = "";
String selectedKey = "";

/**
 * Generates a unique device name based on `DEVICE_BASE_NAME`
 * and the hardware MAC address.
 */
String getUniqueDeviceName() {
  uint8_t mac[WL_MAC_ADDR_LENGTH];
  WiFi.softAPmacAddress(mac);
  
  String macID = String(mac[WL_MAC_ADDR_LENGTH - 2], HEX) +
                 String(mac[WL_MAC_ADDR_LENGTH - 1], HEX);
  macID.toUpperCase();

  return DEVICE_BASE_NAME + " - " + macID;
}

/**
 * Restarts the device in access point mode. The device will
 * advertise a WiFi access point. Clients connected to this
 * access point will also be able to discover a FlyWeb service
 * for configuring the device.
 */
void startAccessPoint() {
  Serial.println("ACCESS POINT MODE");
  accessPointMode = true;

  // Turn on LED when in access point mode
  digitalWrite(LED_PIN, LOW);

  WiFi.disconnect();
  delay(4000);
  WiFi.mode(WIFI_AP);

  String AP_NameString = getUniqueDeviceName();

  char AP_NameChar[AP_NameString.length() + 1];
  memset(AP_NameChar, 0, AP_NameString.length() + 1);

  for (int i = 0; i < AP_NameString.length(); i++) {
    AP_NameChar[i] = AP_NameString.charAt(i);
  }

  WiFi.softAP(AP_NameChar);

  IPAddress ipAddress = WiFi.softAPIP();

  Serial.println("Access point SSID: " + AP_NameString);
  Serial.println("IP address: " + ipAddress.toString());
}

/**
 * Restarts the device in normal mode. The device will attempt
 * to join the WiFi network configured by the user in access
 * point mode. If the device is unable to connect due to an
 * incorrect or missing password, the device will restart back
 * into access point mode to be reconfigured. If the device
 * joins the WiFi network successfully, a FlyWeb service will
 * be advertised that allows the user to monitor the sensor
 * temperature.
 */
void stopAccessPoint() {
  Serial.println("NORMAL MODE");
  accessPointMode = false;

  // Turn off LED when in normal mode
  digitalWrite(LED_PIN, HIGH);

  WiFi.softAPdisconnect();
  delay(4000);
  WiFi.mode(WIFI_STA);

  WiFi.begin(selectedSSID.c_str(), selectedKey.c_str());

  Serial.print("Connecting to: " + selectedSSID);

  while (WiFi.status() != WL_CONNECTED && !accessPointMode) {
    if (WiFi.status() == WL_CONNECT_FAILED) {
      Serial.println("Unable to connect; Possible wrong or missing password");

      startAccessPoint();
      return;
    }

    delay(500);
    Serial.print(".");
  }

  IPAddress ipAddress = WiFi.localIP();

  Serial.println("IP address: " + ipAddress.toString());
}

/**
 * HTTP GET  /
 * HTTP POST /
 */
void onServer_index() {
  if (!accessPointMode) {
    server.sendHeader("Cache-Control", "max-age=31556926");
    server.send(200, "text/html", TEMPERATURE_HTML());
    return;
  }

  if (server.method() == HTTP_POST) {
    selectedSSID = server.arg("ssid");
    selectedKey = server.arg("key");

    server.sendHeader("Cache-Control", "no-cache");
    server.send(200, "text/html", RESTARTING_HTML());

    stopAccessPoint();
    return;
  }

  String ssidOptionsHTML = "<option value=\"\">-- Select a network --</option>";
  
  int networksLength = WiFi.scanNetworks();
  for (int networkIndex = 0; networkIndex < networksLength; networkIndex++) {
    String ssid = WiFi.SSID(networkIndex);
    ssidOptionsHTML += "<option value=\"" + ssid + "\"" +
        (selectedSSID == ssid ? " selected" : "") +
        ">" + ssid + "</option>";
  }

  server.sendHeader("Cache-Control", "no-cache");
  server.send(200, "text/html", CONFIGURATION_HTML(ssidOptionsHTML, selectedKey));
}

/**
 * HTTP GET  /temperature
 */
void onServer_temperature() {
  // Read the temperature from the OneWire bus.
  sensors.requestTemperatures();
  
  char buffer[10];
  String temperature = dtostrf(sensors.getTempFByIndex(0), 4, 1, buffer);

  server.sendHeader("Cache-Control", "no-cache");
  server.send(200, "application/json", "{\"value\": " + temperature + "}");
}

/**
 * HTTP GET  /arrow.svg
 */
void onServer_arrow_svg() {
  server.sendHeader("Cache-Control", "max-age=31556926");
  server.send(200, "image/svg+xml", ARROW_SVG());
}

/**
 * HTTP GET  /flyweb.svg
 */
void onServer_flyweb_svg() {
  server.sendHeader("Cache-Control", "max-age=31556926");
  server.send(200, "image/svg+xml", FLYWEB_SVG());
}

/**
 * HTTP GET  /smoothie.min.js
 */
void onServer_smoothie_min_js() {
  server.sendHeader("Cache-Control", "max-age=31556926");
  server.send(200, "text/javascript", SMOOTHIE_MIN_JS());
}

/**
 * HTTP GET  /styles.css
 */
void onServer_styles_css() {
  server.sendHeader("Cache-Control", "max-age=31556926");
  server.send(200, "text/css", STYLES_CSS());
}

/**
 * Main program loop
 */
void loop() {
  if (millis() != apModePinLastReadTime) {
    apModePinLastValue = digitalRead(AP_MODE_PIN);

    if (apModePinLastValue == apModePinValue && apModePinDebounceCount > 0) {
      apModePinDebounceCount--;
    }

    if (apModePinLastValue != apModePinValue) {
      apModePinDebounceCount++;
    }

    if (apModePinDebounceCount >= MIN_DEBOUNCE_COUNT) {
      apModePinDebounceCount = 0;
      apModePinValue = apModePinLastValue;

      if (apModePinValue == LOW) {
        if (accessPointMode) {
          stopAccessPoint();
        }

        else {
          startAccessPoint();
        }
      }
    }

    apModePinLastReadTime = millis();
  }

  server.handleClient();
}

/**
 * Main setup
 */
void setup() {
  // Start logging to serial console
  Serial.begin(SERIAL_LOGGER_BAUD_RATE);

  // Setup GPIO pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(AP_MODE_PIN, INPUT);
  digitalWrite(LED_PIN, HIGH);
  digitalWrite(AP_MODE_PIN, HIGH);

  // Start temperature sensor
  sensors.begin();

  // Start in access point mode
  startAccessPoint();

  // Define dynamic server routes
  server.on("/", onServer_index);
  server.on("/temperature", onServer_temperature);
  
  // Define static server routes
  server.on("/arrow.svg", onServer_arrow_svg);
  server.on("/flyweb.svg", onServer_flyweb_svg);
  server.on("/smoothie.min.js", onServer_smoothie_min_js);
  server.on("/styles.css", onServer_styles_css);

  // Start HTTP server
  server.begin();

  // Advertise FlyWeb service
  MDNS.begin(getUniqueDeviceName().c_str());
  MDNS.addService("flyweb", "tcp", HTTP_SERVER_PORT);
}
