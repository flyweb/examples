#define CONFIGURATION_HTML(ssidOptionsHTML,selectedKey) ""\
"<!DOCTYPE html>\n"\
"<html lang=\"en\">\n"\
"<head>\n"\
"  <meta charset=\"utf-8\">\n"\
"  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n"\
"  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n"\
"  <title>FlyWeb Temperature Monitor</title>\n"\
"  <link rel=\"stylesheet\" href=\"styles.css\">\n"\
"</head>\n"\
"<body>\n"\
"  <header>\n"\
"    <img src=\"flyweb.svg\">\n"\
"    <h1>FlyWeb Temperature Monitor</h1>\n"\
"  </header>\n"\
"  <section>\n"\
"    <h3>Network Settings</h3>\n"\
"    <form method=\"POST\" id=\"form\">\n"\
"      <p>\n"\
"        <label for=\"ssid\">WiFi Network Name (SSID)</label>\n"\
"        <select id=\"ssid\" name=\"ssid\">\n"\
"          " + ssidOptionsHTML + "\n"\
"        </select>\n"\
"      </p>\n"\
"      <p>\n"\
"        <label for=\"key\">WiFi Network Password (Key)</label>\n"\
"        <input type=\"password\" id=\"key\" name=\"key\" value=\"" + selectedKey + "\">\n"\
"      </p>\n"\
"      <p>\n"\
"        <button type=\"submit\">Save &amp; Restart</button>\n"\
"      </p>\n"\
"    </form>\n"\
"  </section>\n"\
"</body>\n"\
"</html>\n"\
""