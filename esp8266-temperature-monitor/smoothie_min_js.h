#define SMOOTHIE_MIN_JS() ""\
"/**\n"\
" * Smoothie Charts - http://smoothiecharts.org/\n"\
" * (c) 2010-2013, Joe Walnes\n"\
" *     2013-2014, Drew Noakes\n"\
" */\n"\
"!function(a){function c(a){this.options=b.extend({},c.defaultOptions,a),this.clear()}function d(a){this.options=b.extend({},d.defaultChartOptions,a),this.seriesSet=[],this.currentValueRange=1,this.currentVisMinValue=0,this.lastRenderTimeMillis=0}var b={extend:function(){arguments[0]=arguments[0]||{};for(var a=1;a<arguments.length;a++)for(var c in arguments[a])arguments[a].hasOwnProperty(c)&&(\"object\"==typeof arguments[a][c]?arguments[a][c]instanceof Array?arguments[0][c]=arguments[a][c]:arguments[0][c]=b.extend(arguments[0][c],arguments[a][c]):arguments[0][c]=arguments[a][c]);return arguments[0]}};c.defaultOptions={resetBoundsInterval:3e3,resetBounds:!0},c.prototype.clear=function(){this.data=[],this.maxValue=Number.NaN,this.minValue=Number.NaN},c.prototype.resetBounds=function(){if(this.data.length){this.maxValue=this.data[0][1],this.minValue=this.data[0][1];for(var a=1;a<this.data.length;a++){var b=this.data[a][1];b>this.maxValue&&(this.maxValue=b),b<this.minValue&&(this.minValue=b)}}else this.maxValue=Number.NaN,this.minValue=Number.NaN},c.prototype.append=function(a,b,c){for(var d=this.data.length-1;d>=0&&this.data[d][0]>a;)d--;d===-1?this.data.splice(0,0,[a,b]):this.data.length>0&&this.data[d][0]===a?c?(this.data[d][1]+=b,b=this.data[d][1]):this.data[d][1]=b:d<this.data.length-1?this.data.splice(d+1,0,[a,b]):this.data.push([a,b]),this.maxValue=isNaN(this.maxValue)?b:Math.max(this.maxValue,b),this.minValue=isNaN(this.minValue)?b:Math.min(this.minValue,b)},c.prototype.dropOldData=function(a,b){for(var c=0;this.data.length-c>=b&&this.data[c+1][0]<a;)c++;0!==c&&this.data.splice(0,c)},d.defaultChartOptions={millisPerPixel:20,enableDpiScaling:!0,yMinFormatter:function(a,b){return parseFloat(a).toFixed(b)},yMaxFormatter:function(a,b){return parseFloat(a).toFixed(b)},maxValueScale:1,minValueScale:1,interpolation:\"bezier\",scaleSmoothing:.125,maxDataSetLength:2,scrollBackwards:!1,grid:{fillStyle:\"#000000\",strokeStyle:\"#777777\",lineWidth:1,sharpLines:!1,millisPerLine:1e3,verticalSections:2,borderVisible:!0},labels:{fillStyle:\"#ffffff\",disabled:!1,fontSize:10,fontFamily:\"monospace\",precision:2},horizontalLines:[]},d.AnimateCompatibility=function(){var a=function(a,b){var c=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){return window.setTimeout(function(){a((new Date).getTime())},16)};return c.call(window,a,b)},b=function(a){var b=window.cancelAnimationFrame||function(a){clearTimeout(a)};return b.call(window,a)};return{requestAnimationFrame:a,cancelAnimationFrame:b}}(),d.defaultSeriesPresentationOptions={lineWidth:1,strokeStyle:\"#ffffff\"},d.prototype.addTimeSeries=function(a,c){this.seriesSet.push({timeSeries:a,options:b.extend({},d.defaultSeriesPresentationOptions,c)}),a.options.resetBounds&&a.options.resetBoundsInterval>0&&(a.resetBoundsTimerId=setInterval(function(){a.resetBounds()},a.options.resetBoundsInterval))},d.prototype.removeTimeSeries=function(a){for(var b=this.seriesSet.length,c=0;c<b;c++)if(this.seriesSet[c].timeSeries===a){this.seriesSet.splice(c,1);break}a.resetBoundsTimerId&&clearInterval(a.resetBoundsTimerId)},d.prototype.getTimeSeriesOptions=function(a){for(var b=this.seriesSet.length,c=0;c<b;c++)if(this.seriesSet[c].timeSeries===a)return this.seriesSet[c].options},d.prototype.bringToFront=function(a){for(var b=this.seriesSet.length,c=0;c<b;c++)if(this.seriesSet[c].timeSeries===a){var d=this.seriesSet.splice(c,1);this.seriesSet.push(d[0]);break}},d.prototype.streamTo=function(a,b){this.canvas=a,this.delay=b,this.start()},d.prototype.resize=function(){if(this.options.enableDpiScaling&&window&&1!==window.devicePixelRatio){var a=window.devicePixelRatio,b=parseInt(this.canvas.getAttribute(\"width\")),c=parseInt(this.canvas.getAttribute(\"height\"));this.originalWidth&&Math.floor(this.originalWidth*a)===b||(this.originalWidth=b,this.canvas.setAttribute(\"width\",Math.floor(b*a).toString()),this.canvas.style.width=b+\"px\",this.canvas.getContext(\"2d\").scale(a,a)),this.originalHeight&&Math.floor(this.originalHeight*a)===c||(this.originalHeight=c,this.canvas.setAttribute(\"height\",Math.floor(c*a).toString()),this.canvas.style.height=c+\"px\",this.canvas.getContext(\"2d\").scale(a,a))}},d.prototype.start=function(){if(!this.frame){var a=function(){this.frame=d.AnimateCompatibility.requestAnimationFrame(function(){this.render(),a()}.bind(this))}.bind(this);a()}},d.prototype.stop=function(){this.frame&&(d.AnimateCompatibility.cancelAnimationFrame(this.frame),delete this.frame)},d.prototype.updateValueRange=function(){for(var a=this.options,b=Number.NaN,c=Number.NaN,d=0;d<this.seriesSet.length;d++){var e=this.seriesSet[d].timeSeries;isNaN(e.maxValue)||(b=isNaN(b)?e.maxValue:Math.max(b,e.maxValue)),isNaN(e.minValue)||(c=isNaN(c)?e.minValue:Math.min(c,e.minValue))}if(null!=a.maxValue?b=a.maxValue:b*=a.maxValueScale,null!=a.minValue?c=a.minValue:c-=Math.abs(c*a.minValueScale-c),this.options.yRangeFunction){var f=this.options.yRangeFunction({min:c,max:b});c=f.min,b=f.max}if(!isNaN(b)&&!isNaN(c)){var g=b-c,h=g-this.currentValueRange,i=c-this.currentVisMinValue;this.isAnimatingScale=Math.abs(h)>.1||Math.abs(i)>.1,this.currentValueRange+=a.scaleSmoothing*h,this.currentVisMinValue+=a.scaleSmoothing*i}this.valueRange={min:c,max:b}},d.prototype.render=function(a,b){var c=(new Date).getTime();if(!this.isAnimatingScale){var d=Math.min(1e3/6,this.options.millisPerPixel);if(c-this.lastRenderTimeMillis<d)return}this.resize(),this.lastRenderTimeMillis=c,a=a||this.canvas,b=b||c-(this.delay||0),b-=b%this.options.millisPerPixel;var e=a.getContext(\"2d\"),f=this.options,g={top:0,left:0,width:a.clientWidth,height:a.clientHeight},h=b-g.width*f.millisPerPixel,i=function(a){var b=a-this.currentVisMinValue;return 0===this.currentValueRange?g.height:g.height-Math.round(b/this.currentValueRange*g.height)}.bind(this),j=function(a){return f.scrollBackwards?Math.round((b-a)/f.millisPerPixel):Math.round(g.width-(b-a)/f.millisPerPixel)};if(this.updateValueRange(),e.font=f.labels.fontSize+\"px \"+f.labels.fontFamily,e.save(),e.translate(g.left,g.top),e.beginPath(),e.rect(0,0,g.width,g.height),e.clip(),e.save(),e.fillStyle=f.grid.fillStyle,e.clearRect(0,0,g.width,g.height),e.fillRect(0,0,g.width,g.height),e.restore(),e.save(),e.lineWidth=f.grid.lineWidth,e.strokeStyle=f.grid.strokeStyle,f.grid.millisPerLine>0){e.beginPath();for(var k=b-b%f.grid.millisPerLine;k>=h;k-=f.grid.millisPerLine){var l=j(k);f.grid.sharpLines&&(l-=.5),e.moveTo(l,0),e.lineTo(l,g.height)}e.stroke(),e.closePath()}for(var m=1;m<f.grid.verticalSections;m++){var n=Math.round(m*g.height/f.grid.verticalSections);f.grid.sharpLines&&(n-=.5),e.beginPath(),e.moveTo(0,n),e.lineTo(g.width,n),e.stroke(),e.closePath()}if(f.grid.borderVisible&&(e.beginPath(),e.strokeRect(0,0,g.width,g.height),e.closePath()),e.restore(),f.horizontalLines&&f.horizontalLines.length)for(var o=0;o<f.horizontalLines.length;o++){var p=f.horizontalLines[o],q=Math.round(i(p.value))-.5;e.strokeStyle=p.color||\"#ffffff\",e.lineWidth=p.lineWidth||1,e.beginPath(),e.moveTo(0,q),e.lineTo(g.width,q),e.stroke(),e.closePath()}for(var r=0;r<this.seriesSet.length;r++){e.save();var s=this.seriesSet[r].timeSeries,t=s.data,u=this.seriesSet[r].options;s.dropOldData(h,f.maxDataSetLength),e.lineWidth=u.lineWidth,e.strokeStyle=u.strokeStyle,e.beginPath();for(var v=0,w=0,x=0,y=0;y<t.length&&1!==t.length;y++){var z=j(t[y][0]),A=i(t[y][1]);if(0===y)v=z,e.moveTo(z,A);else switch(f.interpolation){case\"linear\":case\"line\":e.lineTo(z,A);break;case\"bezier\":default:e.bezierCurveTo(Math.round((w+z)/2),x,Math.round(w+z)/2,A,z,A);break;case\"step\":e.lineTo(z,x),e.lineTo(z,A)}w=z,x=A}t.length>1&&(u.fillStyle&&(e.lineTo(g.width+u.lineWidth+1,x),e.lineTo(g.width+u.lineWidth+1,g.height+u.lineWidth+1),e.lineTo(v,g.height+u.lineWidth),e.fillStyle=u.fillStyle,e.fill()),u.strokeStyle&&\"none\"!==u.strokeStyle&&e.stroke(),e.closePath()),e.restore()}if(!f.labels.disabled&&!isNaN(this.valueRange.min)&&!isNaN(this.valueRange.max)){var B=f.yMaxFormatter(this.valueRange.max,f.labels.precision),C=f.yMinFormatter(this.valueRange.min,f.labels.precision),D=f.scrollBackwards?0:g.width-e.measureText(B).width-2;e.fillStyle=f.labels.fillStyle,e.fillText(B,D,f.labels.fontSize),e.fillText(C,D,g.height-2)}if(f.timestampFormatter&&f.grid.millisPerLine>0)for(var E=f.scrollBackwards?e.measureText(C).width:g.width-e.measureText(C).width+4,k=b-b%f.grid.millisPerLine;k>=h;k-=f.grid.millisPerLine){var l=j(k);if(!f.scrollBackwards&&l<E||f.scrollBackwards&&l>E){var F=new Date(k),G=f.timestampFormatter(F),H=e.measureText(G).width;E=f.scrollBackwards?l+H+2:l-H-2,e.fillStyle=f.labels.fillStyle,f.scrollBackwards?e.fillText(G,l,g.height-2):e.fillText(G,l-H,g.height-2)}}e.restore()},d.timeFormatter=function(a){function b(a){return(a<10?\"0\":\"\")+a}return b(a.getHours())+\":\"+b(a.getMinutes())+\":\"+b(a.getSeconds())},a.TimeSeries=c,a.SmoothieChart=d}(\"undefined\"==typeof exports?this:exports);"