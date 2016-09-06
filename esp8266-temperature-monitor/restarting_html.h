#define RESTARTING_HTML() ""\
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
"    <h5 id=\"message\">Settings saved! Now restarting...</h5>\n"\
"    <progress id=\"progress\" value=\"0\">\n"\
"  </section>\n"\
"  <script>\n"\
"    var interval = setInterval(function() {\n"\
"      progress.value += 0.01;\n"\
"      if (progress.value >= 1) {\n"\
"        clearInterval(interval);\n"\
"        progress.parentNode.removeChild(progress);\n"\
"        message.textContent = 'You may now close this tab and re-connect to your regular WiFi network';\n"\
"      }\n"\
"    }, 200);\n"\
"  </script>\n"\
"</body>\n"\
"</html>\n"\
""