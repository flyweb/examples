#define TEMPERATURE_HTML() ""\
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
"    <h5>Temperature: <span id=\"temperature\">??.?</span>&deg;F</h5>\n"\
"    <canvas id=\"canvas\"></canvas>\n"\
"  </section>\n"\
"  <script src=\"smoothie.min.js\"></script>\n"\
"  <script>\n"\
"    var timeSeries = new TimeSeries();\n"\
"    var chart = new SmoothieChart({\n"\
"      minValueScale: 1.1,\n"\
"      maxValueScale: 1.1,\n"\
"      millisPerPixel: 100,\n"\
"      timestampFormatter: SmoothieChart.timeFormatter,\n"\
"      grid: {\n"\
"        millisPerLine: 10000,\n"\
"        verticalSections: 4\n"\
"      }\n"\
"    });\n"\
"\n"\
"    chart.addTimeSeries(timeSeries, {\n"\
"      strokeStyle: 'rgba(0, 255, 0, 1)',\n"\
"      fillStyle: 'rgba(0, 255, 0, 0.2)',\n"\
"      lineWidth: 4\n"\
"    });\n"\
"\n"\
"    updateCanvasSize();\n"\
"    updateTemperature();\n"\
"\n"\
"    chart.streamTo(canvas, 1000);\n"\
"\n"\
"    window.addEventListener('resize', updateCanvasSize);\n"\
"\n"\
"    function updateCanvasSize() {\n"\
"      canvas.width  = window.innerWidth - 40;\n"\
"      canvas.height = Math.max(window.innerHeight - 140, 100);\n"\
"    }\n"\
"\n"\
"    function updateTemperature() {\n"\
"      fetch('/temperature')\n"\
"        .then(function(response) {\n"\
"          return response.json();\n"\
"        })\n"\
"        .then(function(json) {\n"\
"          temperature.textContent = json.value;\n"\
"          timeSeries.append(Date.now(), json.value);\n"\
"\n"\
"          setTimeout(updateTemperature, 1000);\n"\
"        })\n"\
"        .catch(function() {\n"\
"          setTimeout(updateTemperature, 1000);\n"\
"        });\n"\
"    }\n"\
"  </script>\n"\
"</body>\n"\
"</html>\n"\
""