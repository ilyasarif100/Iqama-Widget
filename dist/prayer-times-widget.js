/*
 * Iqama Widget v2.0.0 - Modular Prayer Times Widget
 * https://github.com/ilyasarif100/Iqama-Widget
 * 
 * Super simple embed - just paste one script tag!
 * Automatically extracts Sheet ID from Google Sheet URL
 * 
 * Built: 2025-10-21T23:57:23.040Z
 */
var IqamaWidget=(()=>{var v=Object.defineProperty;var J=Object.getOwnPropertyDescriptor;var V=Object.getOwnPropertyNames,P=Object.getOwnPropertySymbols;var F=Object.prototype.hasOwnProperty,N=Object.prototype.propertyIsEnumerable;var H=(s,e,t)=>e in s?v(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,p=(s,e)=>{for(var t in e||(e={}))F.call(e,t)&&H(s,t,e[t]);if(P)for(var t of P(e))N.call(e,t)&&H(s,t,e[t]);return s};var W=(s,e)=>{for(var t in e)v(s,t,{get:e[t],enumerable:!0})},k=(s,e,t,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of V(e))!F.call(s,i)&&i!==t&&v(s,i,{get:()=>e[i],enumerable:!(a=J(e,i))||a.enumerable});return s};var q=s=>k(v({},"__esModule",{value:!0}),s);var d=(s,e,t)=>new Promise((a,i)=>{var n=l=>{try{c(t.next(l))}catch(f){i(f)}},o=l=>{try{c(t.throw(l))}catch(f){i(f)}},c=l=>l.done?a(l.value):Promise.resolve(l.value).then(n,o);c((t=t.apply(s,e)).next())});var O={};W(O,{WidgetManager:()=>T,initializeWidget:()=>$});var B={googleSheetUrl:"https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing",title:"Prayer Times",location:"ICCP AZ",backgroundColor:"#1F2937",accentColor:"#E5E7EB",borderRadius:"20px",timeType:"athan",jumuahCount:1,cacheDuration:864e5,pollingInterval:864e5,debug:!1,logLevel:"normal"};function y(){return p(p({},B),window.IqamaWidgetConfig||{})}function S(s){let t=["googleSheetUrl","title","location"].filter(a=>!s[a]);if(t.length>0)throw new Error(`Missing required configuration: ${t.join(", ")}`);return!0}var _=class{constructor(){this.config=y()}info(e,t=null){this.config.debug&&this.config.logLevel!=="minimal"&&console.log(`\u2139\uFE0F [INFO] ${e}`,t||"")}success(e,t=null){this.config.debug&&this.config.logLevel!=="minimal"&&console.log(`\u2705 [SUCCESS] ${e}`,t||"")}warn(e,t=null){console.warn(`\u26A0\uFE0F [WARNING] ${e}`,t||"")}error(e,t=null){console.error(`\u274C [ERROR] ${e}`,t||"")}debug(e,t=null){this.config.debug&&this.config.logLevel==="verbose"&&console.log(`\u{1F50D} [DEBUG] ${e}`,t||"")}},r=new _;var u={MONTH:0,DAY:1,FAJR_ATHAN:2,ZUHR_ATHAN:3,ASR_ATHAN:4,MAGHRIB_ATHAN:5,ISHA_ATHAN:6,FAJR_IQAMA:7,ZUHR_IQAMA:8,ASR_IQAMA:9,MAGHRIB_IQAMA:10,ISHA_IQAMA:11,EMPTY:12,JUMAH_LABEL:13,JUMAH_START:14,JUMAH_END:15},x={FIRST:1,SECOND:2,THIRD:3},w={ATHAN:"athan",IQAMA:"iqama",BOTH:"athan and iqama"},h={TIME:"--:--",JUMAH_TIME:"--:-- - --:--",TITLE:"Prayer Times",LOCATION:"Location"},L=[/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/,/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/view/];function U(s){if(!s)return r.error("No URL provided to extractSheetId"),null;r.info("Extracting Sheet ID from URL",s);for(let e of L){let t=s.match(e);if(t){let a=t[1];return r.success("Sheet ID extracted",a),a}}return r.error("Could not extract Sheet ID from URL",s),null}function D(s){return!s||!s.trim()?[]:s.split(",").map(e=>e.replace(/^"/,"").replace(/"$/,"").trim())}function z(){let s=new Date;return{month:s.getMonth()+1,day:s.getDate(),year:s.getFullYear()}}function R(){let s=new Date;return s.setDate(s.getDate()+1),{month:s.getMonth()+1,day:s.getDate(),year:s.getFullYear()}}function g(s){return s!=null&&s!==""}function E(s){return`prayer_times_${s}`}var b=class{constructor(){this.sheetId=null}setSheetId(e){if(this.sheetId=U(e),!this.sheetId)throw new Error("Invalid Google Sheet URL");r.info("Sheet ID set",this.sheetId)}fetchCSV(){return d(this,null,function*(){if(!this.sheetId)throw new Error("Sheet ID not set");r.info("Fetching CSV data from Google Sheets");let e="";try{e=yield this._fetchWithGoogleViz(),r.success("Successfully fetched data using Google Visualization API")}catch(t){r.warn("Google Visualization API failed, trying direct CSV export",t.message);try{e=yield this._fetchWithDirectExport(),r.success("Successfully fetched data using direct CSV export")}catch(a){throw r.error("Both fetch methods failed",a.message),new Error("Could not fetch data from Google Sheets")}}return e})}_fetchWithGoogleViz(){return d(this,null,function*(){let e=`https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv`,t=yield fetch(e,{mode:"cors",cache:"no-cache"});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return yield t.text()})}_fetchWithDirectExport(){return d(this,null,function*(){let e=`https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv`,t=yield fetch(e,{mode:"cors",cache:"no-cache"});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return yield t.text()})}validateCSVData(e){if(!e||e.trim().length===0)throw new Error("Empty CSV data received");let t=e.split(`
`);if(t.length<2)throw new Error("CSV data must have at least 2 lines (header + data)");return r.success("CSV data validation passed",{lines:t.length,firstLine:t[0]}),!0}};var I=class{constructor(){this.jumuahTimes={},this.prayerTimesData=[]}parseCSV(e){r.info("Starting CSV parsing");let t=e.split(`
`);return r.info("CSV split into lines",t.length),this._parseJumuahTimes(t),this._parsePrayerTimes(t),r.success("CSV parsing completed",{jumuahTimes:this.jumuahTimes,prayerDays:this.prayerTimesData.length}),{jumuahTimes:this.jumuahTimes,prayerTimesData:this.prayerTimesData}}_parseJumuahTimes(e){r.info("Parsing Jumuah times from rows 2-4"),this.jumuahTimes={jumuah1:"",jumuah2:"",jumuah3:""};for(let t=x.FIRST;t<=x.THIRD;t++)if(e[t]&&e[t].trim()){let a=D(e[t]);if(a.length>=u.JUMAH_END+1){let i=a[u.JUMAH_START],n=a[u.JUMAH_END];if(g(i)&&g(n)){let o=`${i} - ${n}`;t===x.FIRST?this.jumuahTimes.jumuah1=o:t===x.SECOND?this.jumuahTimes.jumuah2=o:t===x.THIRD&&(this.jumuahTimes.jumuah3=o),r.info(`Parsed Jumuah ${t}`,o)}}}!this.jumuahTimes.jumuah1&&!this.jumuahTimes.jumuah2&&!this.jumuahTimes.jumuah3&&(r.warn("No Jumuah times found, using fallback values"),this.jumuahTimes.jumuah1=h.JUMAH_TIME,this.jumuahTimes.jumuah2=h.JUMAH_TIME,this.jumuahTimes.jumuah3=h.JUMAH_TIME)}_parsePrayerTimes(e){r.info("Parsing daily prayer times"),this.prayerTimesData=[];for(let t=4;t<e.length;t++)if(e[t]&&e[t].trim()){let a=D(e[t]);if(a.length>=u.ISHA+1){let i=p({month:parseInt(a[u.MONTH]),day:parseInt(a[u.DAY]),fajr:a[u.FAJR]||h.TIME,dhuhr:a[u.ZUHR]||h.TIME,asr:a[u.ASR]||h.TIME,maghrib:a[u.MAGHRIB]||h.TIME,isha:a[u.ISHA]||h.TIME},this.jumuahTimes);this.prayerTimesData.push(i)}}r.success("Daily prayer times parsed",this.prayerTimesData.length)}validateParsedData(){if(!this.prayerTimesData||this.prayerTimesData.length===0)throw new Error("No prayer times data parsed");let e=this.prayerTimesData[0],t=["month","day","fajr","dhuhr","asr","maghrib","isha"];for(let a of t)if(!g(e[a]))throw new Error(`Missing required field: ${a}`);return r.success("Parsed data validation passed"),!0}};var A=class{validateJumuahTimes(e){if(r.info("Validating Jumuah times"),!e)return r.error("Jumuah times object is null or undefined"),!1;let t=["jumuah1","jumuah2","jumuah3"],a=t.filter(i=>!g(e[i]));if(a.length>0)return r.error(`Missing Jumuah times: ${a.join(", ")}`),!1;for(let i of t){let n=e[i];if(n!==h.JUMAH_TIME&&!n.includes(" - "))return r.error(`Invalid Jumuah time format for ${i}: ${n}`),!1}return r.success("Jumuah times validation passed"),!0}validatePrayerData(e){if(r.info("Validating prayer data for day",e),!e)return r.error("Prayer data is null or undefined"),!1;let a=["month","day","fajr","dhuhr","asr","maghrib","isha"].filter(i=>!g(e[i]));return a.length>0?(r.error(`Missing prayer data: ${a.join(", ")}`),!1):isNaN(e.month)||isNaN(e.day)?(r.error("Month and day must be numbers"),!1):e.month<1||e.month>12?(r.error(`Invalid month: ${e.month}`),!1):e.day<1||e.day>31?(r.error(`Invalid day: ${e.day}`),!1):(r.info("Prayer data validation passed"),!0)}validatePrayerTimesArray(e){if(r.info("Validating prayer times array"),!Array.isArray(e))return r.error("Prayer times data is not an array"),!1;if(e.length===0)return r.error("Prayer times array is empty"),!1;let t=Math.min(5,e.length);for(let a=0;a<t;a++)if(!this.validatePrayerData(e[a]))return r.error(`Validation failed for prayer data at index ${a}`),!1;return r.success("Prayer times array validation passed",{totalDays:e.length,sampleValidated:t}),!0}validateConfig(e){if(r.info("Validating configuration"),!e)return r.error("Configuration is null or undefined"),!1;let a=["googleSheetUrl","title","location"].filter(i=>!g(e[i]));return a.length>0?(r.error(`Missing required configuration: ${a.join(", ")}`),!1):e.googleSheetUrl.includes("docs.google.com/spreadsheets")?isNaN(e.jumuahCount)||e.jumuahCount<1||e.jumuahCount>3?(r.error(`Invalid jumuahCount: ${e.jumuahCount}`),!1):(r.success("Configuration validation passed"),!0):(r.error("Invalid Google Sheet URL format"),!1)}validateCompleteDataSet(e){if(r.info("Validating complete data set"),!e)return r.error("Data set is null or undefined"),!1;let{jumuahTimes:t,prayerTimesData:a}=e;return!this.validateJumuahTimes(t)||!this.validatePrayerTimesArray(a)?!1:(r.success("Complete data set validation passed"),!0)}};var j=class{constructor(e=24*60*60*1e3){this.cache=new Map,this.cacheDuration=e,this.cleanupInterval=null,this._startCleanupInterval()}get(e,t=!1){let a=this.cache.get(e);if(!a)return r.info("Cache miss",e),null;let i=this._isDataFromToday(a.timestamp);return t||!i?(r.info(t?"Force refresh requested":"Data not from today",e),this.cache.delete(e),null):(r.info("Cache hit (daily data)",e),a.data)}set(e,t){let a={data:t,timestamp:Date.now()};this.cache.set(e,a),r.info("Data cached",e)}getPrayerTimes(e){let t=E(e);return this.get(t)}setPrayerTimes(e,t){let a=E(e);this.set(a,t)}clear(){this.cache.clear(),r.info("Cache cleared")}cleanup(){let e=Date.now(),t=0;for(let[a,i]of this.cache.entries())e-i.timestamp>this.cacheDuration&&(this.cache.delete(a),t++);t>0&&r.info(`Cleaned up ${t} expired cache entries`)}_isDataFromToday(e){let t=new Date().toDateString(),a=new Date(e).toDateString();return t===a}_startCleanupInterval(){this.cleanupInterval=setInterval(()=>{this.cleanup()},60*60*1e3)}};var M=class{constructor(e,t,a,i){this.dataFetcher=e,this.dataParser=t,this.validator=a,this.cacheManager=i,this.prayerTimesData=[]}fetchPrayerTimes(e=!1){return d(this,null,function*(){r.info("Starting prayer times fetch process",{forceRefresh:e});try{let t=this.cacheManager.getPrayerTimes(this.dataFetcher.sheetId,e);if(t){r.success("Using cached prayer times data"),this.prayerTimesData=t;return}r.info("Cache miss, fetching fresh data");let a=yield this.dataFetcher.fetchCSV();this.dataFetcher.validateCSVData(a);let i=this.dataParser.parseCSV(a);this.validator.validateCompleteDataSet(i),this.prayerTimesData=i.prayerTimesData,this.cacheManager.setPrayerTimes(this.dataFetcher.sheetId,this.prayerTimesData),r.success("Prayer times fetch process completed",{totalDays:this.prayerTimesData.length})}catch(t){throw r.error("Failed to fetch prayer times",t.message),t}})}getPrayerTimesForDate(e=null,t=!1){return d(this,null,function*(){yield this.fetchPrayerTimes(t);let a=e||z();r.info("Getting prayer times for date",a);let i=this.prayerTimesData.find(o=>o.month===a.month&&o.day===a.day),n={};if(i)r.success("Found prayer times for target date"),n={fajr:i.fajr,dhuhr:i.dhuhr,asr:i.asr,maghrib:i.maghrib,isha:i.isha,jumuah1:i.jumuah1,jumuah2:i.jumuah2,jumuah3:i.jumuah3,tomorrowFajr:this._getTomorrowFajr(a)};else{r.warn("No prayer times found for target date, using first row as demo data");let o=this.prayerTimesData[0];if(!o)throw r.error("No prayer data available"),new Error("No prayer data available");n={fajr:o.fajr||h.TIME,dhuhr:o.dhuhr||h.TIME,asr:o.asr||h.TIME,maghrib:o.maghrib||h.TIME,isha:o.isha||h.TIME,jumuah1:o.jumuah1||h.JUMAH_TIME,jumuah2:o.jumuah2||h.JUMAH_TIME,jumuah3:o.jumuah3||h.JUMAH_TIME,tomorrowFajr:o.fajr||h.TIME}}return r.success("Prayer times retrieved",n),n})}getPrayerTimesForToday(){return d(this,null,function*(){return yield this.getPrayerTimesForDate()})}_getTomorrowFajr(e){let t=R(),a=this.prayerTimesData.find(n=>n.month===t.month&&n.day===t.day);if(a)return a.fajr;let i=this.prayerTimesData.find(n=>n.month===e.month&&n.day===e.day);return i?i.fajr:h.TIME}getPrayerStatus(e){r.info("Calculating prayer status");let t=new Date,a=t.getHours()*60+t.getMinutes(),i=[{name:"fajr",time:this._timeToMinutes(e.fajr)},{name:"dhuhr",time:this._timeToMinutes(e.dhuhr)},{name:"asr",time:this._timeToMinutes(e.asr)},{name:"maghrib",time:this._timeToMinutes(e.maghrib)},{name:"isha",time:this._timeToMinutes(e.isha)}];i.sort((l,f)=>l.time-f.time);let n=null,o=null;for(let l=0;l<i.length;l++)a>=i[l].time&&(n=i[l],o=i[(l+1)%i.length]);n||(o=i[0]);let c={currentPrayer:(n==null?void 0:n.name)||null,nextPrayer:(o==null?void 0:o.name)||"fajr",nextPrayerTime:(o==null?void 0:o.time)||i[0].time};return r.info("Prayer status calculated",c),c}_timeToMinutes(e){if(!e||e===h.TIME)return 0;let[t,a]=e.split(" "),[i,n]=t.split(":").map(Number),o=i*60+n;return a==="PM"&&i!==12?o+=12*60:a==="AM"&&i===12&&(o-=12*60),o}refreshData(){return d(this,null,function*(){r.info("Refreshing prayer times data"),this.cacheManager.clear(),yield this.fetchPrayerTimes()})}};var C=class{constructor(){this.cardColors={}}renderWidget(e,t){r.info("Rendering widget HTML"),this.cardColors=this._getCardColors(t.backgroundColor);let a=this._getContrastingTextColor(t.backgroundColor),i=this._generateWidgetHTML(e,t,a);return r.success("Widget HTML rendered"),i}_generateWidgetHTML(e,t,a){let i=t.title||"Prayer Times",n=t.location||"Location",o;return t.timeType===w.ATHAN?o="\u{1F54C} Athan Times":t.timeType===w.IQAMA?o="\u{1F54C} Iqama Times":(t.timeType,w.BOTH,o="\u{1F54C} Prayer Times"),`
            <div id="iqama-widget" style="
                background: ${t.backgroundColor};
                color: ${a};
                border-radius: ${t.borderRadius};
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                width: 100%;
                box-sizing: border-box;
                margin: 0 auto;
            ">
                <style>
                    #iqama-widget * {
                        box-sizing: border-box;
                    }
                    
                    /* Uniform mobile-style layout that scales proportionally */
                    #iqama-widget {
                        padding: 16px;
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        width: 100%;
                        box-sizing: border-box;
                        margin: 0 auto;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    .prayer-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 14px 16px;
                        margin-bottom: 8px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 12px;
                        transition: all 0.2s ease;
                        min-height: 56px;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                        cursor: pointer;
                        user-select: none;
                    }
                    
                    .prayer-item:hover,
                    .prayer-item:active {
                        background: ${this.cardColors.background};
                        border-color: ${this.cardColors.borderActive};
                        transform: scale(0.98);
                    }
                    
                    .prayer-item:active {
                        transform: scale(0.95);
                    }
                    
                    .prayer-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .prayer-icon {
                        font-size: 18px;
                    }
                    
                    .prayer-name {
                        font-size: 15px;
                        font-weight: 600;
                        color: ${a};
                        flex-shrink: 0;
                    }
                    
                    .prayer-time {
                        font-size: 17px;
                        font-weight: 700;
                        color: ${a};
                        text-align: right;
                        flex-grow: 1;
                        margin-left: 10px;
                    }
                    
                    .jumuah-timeline {
                        display: flex;
                        gap: 10px;
                        margin-top: 16px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    
                    .jumuah-slot {
                        flex: 1;
                        min-width: 140px;
                        min-height: 70px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        padding: 12px 10px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 12px;
                        transition: all 0.2s ease;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                        cursor: pointer;
                        user-select: none;
                    }
                    
                    .jumuah-slot:hover,
                    .jumuah-slot:active {
                        background: ${this.cardColors.background};
                        border-color: ${this.cardColors.borderActive};
                        transform: scale(0.98);
                    }
                    
                    .jumuah-slot:active {
                        transform: scale(0.95);
                    }
                    
                    .jumuah-label {
                        font-size: 13px;
                        font-weight: 500;
                        color: ${a};
                        margin-bottom: 6px;
                        line-height: 1.2;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%;
                    }
                    
                    .jumuah-time {
                        font-size: 17px;
                        font-weight: 700;
                        color: ${a};
                        line-height: 1.1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%;
                    }
                    
                    @media (max-width: 480px) {
                        .jumuah-timeline {
                            flex-direction: column;
                            gap: 8px;
                        }
                        
                        .jumuah-slot {
                            min-width: auto;
                            min-height: 60px;
                            padding: 12px 8px;
                        }
                        
                        .jumuah-label {
                            font-size: 12px;
                            margin-bottom: 4px;
                        }
                        
                        .jumuah-time {
                            font-size: 16px;
                        }
                        
                        .prayer-item {
                            padding: 16px 14px;
                            min-height: 60px;
                        }
                        
                        /* Mobile responsive for dual display */
                        .prayer-header {
                            padding: 10px 12px;
                            font-size: 11px;
                        }
                        
                        .time-headers {
                            gap: 15px;
                        }
                        
                        .time-header {
                            min-width: 50px;
                        }
                        
                        .prayer-row {
                            padding: 12px 14px;
                        }
                        
                        .prayer-times {
                            gap: 15px;
                        }
                        
                        .time-value {
                            min-width: 50px;
                            font-size: 14px;
                        }
                    }
                    
                    @media (max-width: 360px) {
                        .jumuah-timeline {
                            gap: 6px;
                        }
                        
                        .jumuah-slot {
                            min-height: 55px;
                            padding: 10px 6px;
                        }
                        
                        .jumuah-label {
                            font-size: 11px;
                        }
                        
                        .jumuah-time {
                            font-size: 15px;
                        }
                        
                        .prayer-item {
                            padding: 14px 12px;
                            min-height: 55px;
                        }
                        
                        /* Mobile responsive for dual display - smaller screens */
                        .prayer-header {
                            padding: 8px 10px;
                            font-size: 10px;
                        }
                        
                        .time-headers {
                            gap: 12px;
                        }
                        
                        .time-header {
                            min-width: 45px;
                        }
                        
                        .prayer-row {
                            padding: 10px 12px;
                        }
                        
                        .prayer-times {
                            gap: 12px;
                        }
                        
                        .time-value {
                            min-width: 45px;
                            font-size: 13px;
                        }
                    }
                    
                    .description-card {
                        background: ${this.cardColors.background};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 12px;
                        padding: 16px;
                        margin-top: 20px;
                        text-align: center;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    .description-text {
                        font-size: 14px;
                        color: ${a};
                        opacity: 0.8;
                    }
                    
                    /* Dual time display styles */
                    .prayer-times-table {
                        width: 100%;
                    }
                    
                    .prayer-header {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        margin-bottom: 8px;
                        font-weight: 600;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .time-headers {
                        display: flex;
                        gap: 20px;
                    }
                    
                    .time-header {
                        min-width: 60px;
                        text-align: center;
                    }
                    
                    .prayer-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 14px 16px;
                        margin-bottom: 6px;
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 8px;
                        transition: all 0.2s ease;
                    }
                    
                    .prayer-row:hover {
                        background: rgba(255, 255, 255, 0.12);
                    }
                    
                    .prayer-times {
                        display: flex;
                        gap: 20px;
                    }
                    
                    .time-value {
                        min-width: 60px;
                        text-align: center;
                        font-size: 15px;
                        font-weight: 500;
                    }
                </style>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="
                        margin: 0 0 8px 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: ${a};
                    ">${i}</h2>
                    <p style="
                        margin: 0;
                        font-size: 16px;
                        color: ${a};
                        opacity: 0.8;
                    ">${n}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="
                        margin: 0 0 16px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: ${a};
                    ">${o}</h3>
                    
                    ${this._renderPrayerTimes(e,a,t)}
                </div>
                
                ${this._renderJumuahSection(e,t.jumuahCount,a)}
                
                <div class="description-card">
                    <p class="description-text">
                        Times shown are when the Athan is announced
                    </p>
                </div>
            </div>
        `}_renderPrayerTimes(e,t,a){let i=[{name:"Fajr",icon:"\u{1F305}"},{name:"Dhuhr",icon:"\u2600\uFE0F"},{name:"Asr",icon:"\u{1F324}\uFE0F"},{name:"Maghrib",icon:"\u{1F307}"},{name:"Isha",icon:"\u{1F319}"}];return a.timeType===w.BOTH&&e.fajrAthan&&e.fajrIqama?`
                <div class="prayer-times-table">
                    <div class="prayer-header">
                        <div class="prayer-name-header">Prayer</div>
                        <div class="time-headers">
                            <div class="time-header">Athan</div>
                            <div class="time-header">Iqama</div>
                        </div>
                    </div>
                    ${i.map(o=>{let c=o.name.toLowerCase(),l=e[`${c}Athan`]||e[c]||"--:--",f=e[`${c}Iqama`]||"--:--";return`
                            <div class="prayer-row">
                                <div class="prayer-info">
                                    <span class="prayer-icon">${o.icon}</span>
                                    <span class="prayer-name">${o.name}</span>
                                </div>
                                <div class="prayer-times">
                                    <div class="time-value">${l}</div>
                                    <div class="time-value">${f}</div>
                                </div>
                            </div>
                        `}).join("")}
                </div>
            `:i.map(o=>{let c=o.name.toLowerCase(),l;return a.timeType===w.IQAMA?l=e[`${c}Iqama`]||e[c]||"--:--":l=e[`${c}Athan`]||e[c]||"--:--",`
                    <div class="prayer-item">
                        <div class="prayer-info">
                            <span class="prayer-icon">${o.icon}</span>
                            <span class="prayer-name">${o.name}</span>
                        </div>
                        <span class="prayer-time">${l}</span>
                    </div>
                `}).join("")}_formatJumuahTime(e){if(!e||e.includes("--:--"))return e;let t=e.split(" - ");if(t.length===2){let a=t[0],i=t[1],n=i.includes("AM")?"AM":"PM";return`${a.replace(/\s*(AM|PM)/,"")}-${i}`}return e}_renderJumuahSection(e,t,a){if(t===0)return"";let i=[{name:t===1?"Jumuah Prayer":"1st Jumuah",time:e.jumuah1},{name:"2nd Jumuah",time:e.jumuah2},{name:"3rd Jumuah",time:e.jumuah3}].slice(0,t);return`
            <div style="margin-bottom: 20px;">
                <h3 style="
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: ${a};
                ">Jumuah Prayers</h3>
                
                <div class="jumuah-timeline">
                    ${i.map(n=>`
                        <div class="jumuah-slot">
                            <div class="jumuah-label">${n.name}</div>
                            <div class="jumuah-time">${this._formatJumuahTime(n.time)}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `}_getCardColors(e){let t=this._isDarkColor(e);return{background:t?"rgba(255, 255, 255, 0.05)":"rgba(0, 0, 0, 0.05)",backgroundActive:t?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)",border:t?"rgba(255, 255, 255, 0.1)":"#cccccc",borderActive:t?"rgba(255, 255, 255, 0.15)":"rgba(0, 0, 0, 0.3)"}}_getContrastingTextColor(e){let t=e.replace("#",""),a=parseInt(t.substr(0,2),16),i=parseInt(t.substr(2,2),16),n=parseInt(t.substr(4,2),16);return(a*299+i*587+n*114)/1e3<128?"#ffffff":"#000000"}_isDarkColor(e){let t=e.replace("#",""),a=parseInt(t.substr(0,2),16),i=parseInt(t.substr(2,2),16),n=parseInt(t.substr(4,2),16);return(a*299+i*587+n*114)/1e3<128}};var T=class{constructor(){this.config=null,this.dataFetcher=null,this.dataParser=null,this.validator=null,this.cacheManager=null,this.prayerManager=null,this.renderer=null,this.isInitialized=!1}initialize(){return d(this,null,function*(){r.info("Initializing widget manager");try{this.config=y(),S(this.config),this.dataFetcher=new b,this.dataParser=new I,this.validator=new A,this.cacheManager=new j(this.config.cacheDuration),this.renderer=new C,this.dataFetcher.setSheetId(this.config.googleSheetUrl),this.prayerManager=new M(this.dataFetcher,this.dataParser,this.validator,this.cacheManager),this.isInitialized=!0,r.success("Widget manager initialized successfully")}catch(e){throw r.error("Failed to initialize widget manager",e.message),e}})}createWidget(e=!1){return d(this,null,function*(){this.isInitialized||(yield this.initialize()),r.info("Creating widget",{forceRefresh:e});try{let t=yield this.prayerManager.getPrayerTimesForToday(e),a=this.renderer.renderWidget(t,this.config);this._injectWidget(a),this._setupAutoRefresh(),r.success("Widget created and injected successfully")}catch(t){r.error("Failed to create widget",t.message),this._injectErrorWidget(t.message)}})}_injectWidget(e){let t=document.getElementById("iqama-widget-container");if(t)r.info("Found existing widget container"),t.innerHTML=e;else{r.info("No container found, creating new widget");let a=document.createElement("div");a.innerHTML=e;let i=document.querySelectorAll('script[src*="iqama-widget-cloud.js"]');if(i.length>0){let n=i[i.length-1];n.parentNode.insertBefore(a.firstElementChild,n.nextSibling)}else document.body.appendChild(a.firstElementChild)}}_injectErrorWidget(e){let t=`
            <div id="iqama-widget" style="
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                text-align: center;
            ">
                <h3 style="margin: 0 0 8px 0;">\u26A0\uFE0F Widget Error</h3>
                <p style="margin: 0; font-size: 14px;">${e}</p>
            </div>
        `;this._injectWidget(t)}_setupAutoRefresh(){this.config.pollingInterval>0&&(r.info("Setting up auto-refresh",this.config.pollingInterval),setInterval(()=>d(this,null,function*(){try{r.info("Auto-refreshing widget data"),yield this.prayerManager.refreshData(),yield this.createWidget()}catch(e){r.error("Auto-refresh failed",e.message)}}),this.config.pollingInterval))}updateConfig(e){r.info("Updating widget configuration"),this.config=p(p({},this.config),e),S(this.config),e.googleSheetUrl&&e.googleSheetUrl!==this.dataFetcher.sheetId&&this.dataFetcher.setSheetId(e.googleSheetUrl)}};var m=null;function $(){r.info("Initializing Iqama Widget");try{m=new T,m.createWidget().then(()=>{r.success("Iqama Widget initialized successfully")}).catch(s=>{r.error("Failed to initialize widget",s.message)})}catch(s){r.error("Widget initialization failed",s.message)}}window.createWidget=function(s=!1){return d(this,null,function*(){return m?m.updateConfig(y()):m=new T,yield m.createWidget(s),m})};window.refreshWidget=function(){return d(this,null,function*(){r.info("Manual refresh requested"),m?yield m.createWidget(!0):yield window.createWidget(!0)})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$):$();return q(O);})();
