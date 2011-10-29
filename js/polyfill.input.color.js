$( function(){
   (function(window, document, undefined){


      /*
       * jscolorXXS, JavaScript Color Picker
       *
       * @version 0.9
       * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
       * @author  Peter Dematt�, http://dematte.at
       * @created 2010-08-03
       * @updated 2010-08-13
       * @status  not finished (~265 lines)
       * @link    http://dematte.at/jcolorXS
       * based on the idea of jscolor.com
       * inspired by jondyer.name, quirksmode.com
       */

      var jscolor = {
         pickerMode : 'HSV',
         pickerBorderColor : '#efefef #a0a0a0 #a0a0a0 #efefef',
         pickerInsetColor : '#a0a0a0 #fff #fff #a0a0a0',
         pickerFaceColor : '#f0f0f0',
         pickerBorder : 0,
         pickerInset : 0,
         pickerFace : 10,
         hash : '#',
         caps : true,
         // ..... etc.

         init : function() {

            var cName;
            var objs = document.querySelectorAll('input[type=color]');
            for (var n=0; n<objs.length; n++){

               // cName = objs[n].className.replace(/(color)( )?/,''); objs[n].color = cName; // do something with it...
               jscolor.addEvent(objs[n], 'click', jscolor.togglePicker);
               objs[n].style.backgroundColor = objs[n].value != '' ? (objs[n].value.indexOf('#') != -1 ? '' : '#') + objs[n].value : '#FFFFFF';
               if (objs[n].value == '') objs[n].value = '#FFFFFF';
               //objs[n].style.color = jscolor.getBrightness(jscolor.HEX2RGB(objs[n].value)) > 128 ? '#000' : '#FFF';

            }
            if (!objs[0]) return;
            objs[0].parentNode.appendChild(jscolor.build());
            jscolor.addEvents();
         },

         build : function() {
            var newCSS = document.createElement('style'), div = document.createElement('div'), divColl,
            ver = navigator.userAgent.toLowerCase(), IE = document.all,
            IE = IE ? ver.indexOf("msie 5") !=-1 || ver.indexOf("msie 6") !=-1 : false,
            cpMS = (jscolor.pickerMode == 'HVS'),
            // twf = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'tw.png\', sizingMethod=\'scale\')',
            // tbf = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'tb.png\', sizingMethod=\'scale\')',
            db1 = 'iVBORw0KGgoAAAANSUhEUgAAA',
            db2 = 'R0lGODlhDwAPAPEAAAAAAP///',
            hsv = db1+'LUAAAABCAIAAAAXanidAAAAQElEQVQoz2P8z8DAwMPAwAZGPBgkfi5eNX85GX4xgNAXDBI/lxg1xLmPdC9hdTTlzgWTFDsOpxZmhu9UcB82LgBPaF0BI0jibAAAAABJRU5ErkJggg==',
            twb = db1+'AEAAADKCAYAAABkOir+AAAAS0lEQVQoz+2ROw4AIAhDy+f+V8bRgEBk1qV5UNKBwsyIAQRhT3ORiuTyZO/Uu5oYJYW84M4DSumjpN2NPhReTJ44GVPC2fkv/oXiF8BsBooBFQ6DAAAAAElFTkSuQmCC',
            cross = db2+'////////yH5BAEKAAIALAAAAAAPAA8AAAIklB8Qx53b4otSUWcvyiz4/4AeQJbmKY4p1HHapBlwPL/uVRsFADs=',
            arrow = db2+'6g8eKg8eCH5BAEKAAIALAAAAAAHAAsAAAITTIQYcLnsgGxvijrxqdQq6DRJAQA7',
            jsW = 211+jscolor.pickerInset*4+jscolor.pickerFace*2,
            jsH = 101+jscolor.pickerInset*2+jscolor.pickerFace*2,
            addQ = jscolor.pickerInset*2,
            jsF = jscolor.pickerFace, jsI = jscolor.pickerInset, jsB = jscolor.pickerBorder, jsIC = jscolor.pickerInsetColor,
            CSS =
            '.jscolor{position:relative;width:'+jsW+'px !important;width:'+(jsW+jsB*2)+'px;height:'+jsH+'px !important;height:'+(jsH+jsB*2)+'px;border:'+jsB+'px solid #fff;border-color:'+jscolor.pickerBorderColor+';background-color:'+jscolor.pickerFaceColor+'}'+
            '.jscolor .left{position:absolute;left:'+jsF+'px;top:'+jsF+'px;width:181px !important;width:'+(181+addQ)+'px;height:100px !important;height:'+(100+addQ)+'px;border:'+jsI+'px solid #fff;border-color:'+jsIC+';background-image:url('+(IE?'hsv.png':'data:image/png;base64,'+hsv+'')+')}'+
            '.jscolor .left .layer, .jscolor .left .mousepad{position:absolute;width:181px;height:100px}'+
            '.jscolor .left .mousepad{cursor:crosshair}'+
            '.jscolor .left .cursor{position:absolute;top:-7px;left:-7px;width:15px;height:15px}'+
            '.jscolor .right{position:absolute;right:'+jsF+'px;top:'+jsF+'px;width:16px !important;width:'+(16+addQ)+'px;height:100px !important;height:'+(100+addQ)+'px;border:'+jsI+'px solid #fff;border-color:'+jsIC+';background-color:#f00}'+
            '.jscolor .right .mousepad{position:absolute;right:0px;width:26px;height:100px;cursor:hand;cursor:pointer}'+
            '.jscolor .right .cursor{position:absolute;right:'+(jsI+17)+'px;top:-5px;width:7px;height:11px}'+
            '.cross{background-image:url('+(IE?'cross.gif':'data:image/gif;base64,'+cross+'')+')}'+
            '.arrow{background-image:url('+(IE?'arrow.gif':'data:image/gif;base64,'+arrow+'')+')}'+
            '.tw{background:url('+(IE?'twb.png':'data:image/png;base64,'+twb+'')+')}'+
            '.tb{background:url('+(IE?'twb.png':'data:image/png;base64,'+twb+'')+') 0px -101px}';

            newCSS.setAttribute('type','text/css');
            if (newCSS.styleSheet) newCSS.styleSheet.cssText = '<!--\n'+CSS+'\n-->';
            else newCSS.appendChild(document.createTextNode('<!--\n'+CSS+'\n-->'));
            document.getElementsByTagName('head')[0].appendChild(newCSS);

            div.className = 'jscolor';
            div.innerHTML = '<div class="left"><div class="layer t'+(cpMS?'b':'w')+'"></div><div class="cursor cross"></div><div class="mousepad"></div></div>'+
            '<div class="right t'+(cpMS?'w':'b')+'"><div class="cursor arrow"></div><div class="mousepad"></div></div>';
            divColl = div.getElementsByTagName('div');
            for (var n=0; n<divColl.length; n++) jscolor[['jcL','layL','curL','padL','jcR','curR','padR'][n]]=divColl[n];
            div.style.position = 'absolute'; div.style.display = 'none';
            jscolor.jscolor = div;

            return div;
         },

         addEvents : function() {
            jscolor.padL.onmousedown = jscolor.padR.onmousedown = function(e){
               var  e = e ? e : window.event, obj = e.target || e.srcElement;
               obj.xyNow = jscolor.getOrigin(obj);
               jscolor.doDrag(e);
               jscolor.addEvent(document.body, 'mousemove', jscolor.doDrag);
               return false;
            }
            jscolor.addEvent(document.body, 'mouseup', function(){
               jscolor.removeEvent(document.body, 'mousemove');
               jscolor.padL.xyNow = jscolor.padR.xyNow = false;
               return false;
            });
         },


         doDrag : function(e,mouseNow,init) {
            if (jscolor.curObj) jscolor.obj = jscolor.curObj;
            var  e = e ? e : window.event,
            mouseNow = mouseNow ? mouseNow : jscolor.getMousePos(e,jscolor.padL.xyNow || jscolor.padR.xyNow),
            curL = jscolor.curL.style, curR = jscolor.curR.style,
            cpMS = (jscolor.pickerMode == 'HVS'),
            val = '';
            mouseNow[1] = mouseNow[1] < 0 ? 0 : mouseNow[1] > 100 ? 100 : mouseNow[1];
            mouseNow[0] = mouseNow[0] < 0 ? 0 : mouseNow[0] > 180 ? 180 : mouseNow[0];
            var Hc = mouseNow[0]/180*255, Sc = Vc = 255-(mouseNow[1]/100*255), // c = coordinate whise
                  Sr = jscolor.color.S/100*255, Vr = jscolor.color.V/100*255;    // r = real

            if (jscolor.padL.xyNow || init == jscolor.padL) { // left picker
               curL.left = mouseNow[0]-7+'px';
               curL.top = mouseNow[1]-7+'px';
               jscolor.color.putHSV([mouseNow[0]*2, cpMS?100-mouseNow[1]:jscolor.color.S, cpMS?jscolor.color.V:100-mouseNow[1]]);
               jscolor.jcR.style.backgroundColor = 'rgb('+jscolor.HSV2RGB(Hc, cpMS?Sc:255, cpMS?255:Vc)+')';
            } else { // right picker
               curR.top = mouseNow[1]-5+'px';
               jscolor.color.putHSV([jscolor.color.H, cpMS?jscolor.color.S:100-mouseNow[1], cpMS?100-mouseNow[1]:jscolor.color.V]);
            }

            if (init) return false;
            jscolor.obj.style.backgroundColor = 'rgb('+[jscolor.color.R,jscolor.color.G,jscolor.color.B]+')';
            //jscolor.obj.style.color = jscolor.getBrightness([jscolor.color.R,jscolor.color.G,jscolor.color.B]) > 128 ? '#000' : '#FFF';
            val = jscolor.RGB2HEX([jscolor.color.R,jscolor.color.G,jscolor.color.B]);
            jscolor.obj.value = (jscolor.hash ? '#':'') + (jscolor.caps ? val : val.toLowerCase());


            // throw the new "input" event that's been introduced html5
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('input', true, true ); // event type,bubbling,cancelable
            jscolor.obj.dispatchEvent(evt);



            return false;
         },

         color : {
            H:0,S:100,V:100,R:0,G:0,B:0,
            putRGB : function (rgb) {this.R=rgb[0]; this.G=rgb[1]; this.B=rgb[2]},
            putHSV : function (hsv) {
               this.H=hsv[0]; this.S=hsv[1]; this.V=hsv[2];
               var rgb = jscolor.HSV2RGB(this.H/360*255,this.S/100*255,this.V/100*255);
               this.R=rgb[0]; this.G=rgb[1]; this.B=rgb[2]
            }
         },

         togglePicker : function(e) {
            var  e = e ? e : window.event, obj = e.target || e.srcElement,
            jcs = jscolor.jscolor.style,
            HSVxy = jscolor.RGB2HSV(jscolor.HEX2RGB(obj.value)),
            cpMS = (jscolor.pickerMode == 'HVS');

            if (jcs.display != 'none' && jscolor.curObj == obj){
               jcs.display = 'none';
            } else {
               jcs.display = 'block';
               jcs.left = obj.offsetLeft+obj.scrollLeft+'px';
               jcs.top =  obj.offsetTop+obj.offsetHeight+obj.scrollTop+'px';
               jscolor.doDrag(null,[null,100-HSVxy[(cpMS?1:2)]],jscolor.padR);
               jscolor.doDrag(null,[HSVxy[0]/2,100-HSVxy[(cpMS?2:1)]],jscolor.padL);
            }
            jscolor.curObj = obj;
            $(jscolor.jscolor).trigger('change');
         },

         getBrightness : function(rgb) {return Math.sqrt(rgb[0]*rgb[0]*.241+rgb[1]*rgb[1]*.691+rgb[2]*rgb[2]*.068)},

         RGB2HEX : function (rgb) {
            return((rgb[0]<16?'0':'')+rgb[0].toString(16)+
                      (rgb[1]<16?'0':'')+rgb[1].toString(16)+
                      (rgb[2]<16?'0':'')+rgb[2].toString(16)).toUpperCase();
         },

         HEX2RGB : function (hex) {
            hex = hex.replace('#','');
            return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
         },

         HSV2RGB : function(x,y,z) {
            var r=g=b=c=0,d=(100-z/255*100)/100,i=y/255,j=y*(255-z)/255;cPHue=z;

            if (x<42.5){r=y;g=x*6*i;g+=(y-g)*d;b=j;}
            else if (x>=42.5&&x< 85){c=42.5;r=(255-(x-c)*6)*i;r+=(y-r)*d;g=y;b=j;}
            else if (x>=85&&x<127.5){c=85;r=j;g=y;b=(x-c)*6*i;b+=(y-b)*d;}
            else if (x>=127.5&&x<170){c=127.5;r=j;g=(255-(x-c)*6)*i;g+=(y-g)*d;b=y;}
            else if (x>=170&&x<212.5){c=170;r=(x-c)*6*i;r+=(y-r)*d;g=j;b=y;}
            else if (x>=212.5){c=212.5;r=y;g=j;b=(255-(x-c)*6)*i;b+=(y-b)*d;}
            return [Math.round(r),Math.round(g),Math.round(b)];
         },

         RGB2HSV : function(r, g, b) {
            if (typeof r == 'object') {var b=r[2],g=r[1];r=r[0]}
            var n = Math.min(Math.min(r,g),b), v = Math.max(Math.max(r,g),b), m = v - n;
            if(m === 0) return [0, 0, v/255*100];
            var h = r===n ? 3+(b-g)/m : (g===n ? 5+(r-b)/m : 1+(g-r)/m);
            return [h===6?0:h*60, m/v*100, v/255*100];
         },

         getStyle : function (prop,obj) {
            if (obj.currentStyle)	return obj.currentStyle[prop];
            else if (window.getComputedStyle) return document.defaultView.getComputedStyle(obj,null).getPropertyValue(prop);
         },

         getOrigin : function(obj) {
            var parent=box=null, pos=[];


            if (obj.parentNode === null || jscolor.getStyle('display', obj) == 'none') return false;

            if (obj.getBoundingClientRect) { // IE
                box = obj.getBoundingClientRect();
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
                return [Math.round(box.left) + scrollLeft, Math.round(box.top) + scrollTop];
            }	else if (document.getBoxObjectFor) { // gecko
                box = document.getBoxObjectFor(obj);
                pos = [box.x, box.y];
            }	else { // safari/opera
                pos = [obj.offsetLeft, obj.offsetTop];
                parent = obj.offsetParent;
                if (parent != obj) {
                     while (parent) {
                         pos[0] += parent.offsetLeft;
                         pos[1] += parent.offsetTop;
                         parent = parent.offsetParent;
                     }
                }
                var ua = navigator.userAgent.toLowerCase();
                if (ua.indexOf('opera') != -1  || (ua.indexOf('safari') != -1 && jscolor.getStyle('position', obj) == 'absolute')) {
                     pos[1] -= document.body.offsetTop;
                }
            }
            if (obj.parentNode) parent = obj.parentNode;
            else parent = null;
            while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') {
                pos[0] -= parent.scrollLeft;
                pos[1] -= parent.scrollTop;
                if (parent.parentNode) parent = parent.parentNode;
                else parent = null;
            }
            return pos;
         },

         getMousePos : function(e,relC) {
            var  e = e ? e : window.event;
            if(typeof e.pageX === 'number') return [e.pageX - relC[0], e.pageY - relC[1]];
            else return [e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - relC[0],
                               e.clientY + document.body.scrollTop  + document.documentElement.scrollTop - relC[1]];
         },

         addEvent : function(obj, type, func) {
            if (!obj || !type || !func) return false;
            if (obj == window && type == 'load') {jscolor.addWinEvent(obj, type, func); return false;}
            if (!obj.funcCache) obj.funcCache = [];
            obj.funcCache[type] = func;
            if (obj.addEventListener) obj.addEventListener(type, func, false);
            else obj.attachEvent("on" + type, func);
         },

         addWinEvent : function(obj, type, func) {
            if(typeof window.addEventListener != 'undefined') window.addEventListener(type, func, false);
            else if(typeof document.addEventListener != 'undefined') document.addEventListener(type, func, false); //.. opera
            else if(typeof window.attachEvent != 'undefined') window.attachEvent('on' + type, func);
            else {
               if(typeof window.onload == 'function') {
                     var existing = onload;
                     window.onload = function() {
                           existing();
                           func();
                     };
               } else window.onload = func;
            }
         },

         removeEvent : function(obj, type, func) {
            if (!obj || !type) return false;
            if (!func && !obj.funcCache[type]) return false;
            if (obj.removeEventListener) obj.removeEventListener(type, func||obj.funcCache[type], false);
            else obj.detachEvent("on" + type, func||obj.funcCache[type]);
         }
      };

      var invalid = 'nyan!';
      // find elements
      var inputs = $('input[type="color"]');

      // check if input elements on page and wether they behaves correctly
      if( inputs.size() > 0 ){
         var testElement = inputs[0];
         var oldVal = testElement.value;
         testElement.value = invalid;

         // value should be rejected if element is supported
         var supported =  testElement.value !== invalid;
         testElement.value = oldVal;
         if( !supported ){
            inputs.addClass('textHidden');
            jscolor.addEvent(window, 'load', jscolor.init);
         }
      }

   })(window, document);
});