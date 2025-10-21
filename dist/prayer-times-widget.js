/*
 * Iqama Widget v2.0.0 - Modular Prayer Times Widget
 * https://github.com/ilyasarif100/Iqama-Widget
 * 
 * Super simple embed - just paste one script tag!
 * Automatically extracts Sheet ID from Google Sheet URL
 * 
 * Built: 2025-10-21T19:50:55.907Z
 */
var IqamaWidget=(()=>{var x=Object.defineProperty;var J=Object.getOwnPropertyDescriptor;var z=Object.getOwnPropertyNames,$=Object.getOwnPropertySymbols;var F=Object.prototype.hasOwnProperty,N=Object.prototype.propertyIsEnumerable;var P=(s,e,t)=>e in s?x(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,l=(s,e)=>{for(var t in e||(e={}))F.call(e,t)&&P(s,t,e[t]);if($)for(var t of $(e))N.call(e,t)&&P(s,t,e[t]);return s};var W=(s,e)=>{for(var t in e)x(s,t,{get:e[t],enumerable:!0})},q=(s,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of z(e))!F.call(s,i)&&i!==t&&x(s,i,{get:()=>e[i],enumerable:!(r=J(e,i))||r.enumerable});return s};var k=s=>q(x({},"__esModule",{value:!0}),s);var u=(s,e,t)=>new Promise((r,i)=>{var o=c=>{try{f(t.next(c))}catch(w){i(w)}},n=c=>{try{f(t.throw(c))}catch(w){i(w)}},f=c=>c.done?r(c.value):Promise.resolve(c.value).then(o,n);f((t=t.apply(s,e)).next())});var G={};W(G,{WidgetManager:()=>T,initializeWidget:()=>_});var B={googleSheetUrl:"https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing",title:"Prayer Times",location:"ICCP AZ",backgroundColor:"#1F2937",accentColor:"#E5E7EB",borderRadius:"20px",timeType:"athan",jumuahCount:1,cacheDuration:6e5,pollingInterval:18e5,debug:!1,logLevel:"normal"};function p(){return l(l({},B),window.IqamaWidgetConfig||{})}function A(s){let t=["googleSheetUrl","title","location"].filter(r=>!s[r]);if(t.length>0)throw new Error(`Missing required configuration: ${t.join(", ")}`);return!0}var S=class{constructor(){this.config=p()}info(e,t=null){this.config.debug&&this.config.logLevel!=="minimal"&&console.log(`\u2139\uFE0F [INFO] ${e}`,t||"")}success(e,t=null){this.config.debug&&this.config.logLevel!=="minimal"&&console.log(`\u2705 [SUCCESS] ${e}`,t||"")}warn(e,t=null){console.warn(`\u26A0\uFE0F [WARNING] ${e}`,t||"")}error(e,t=null){console.error(`\u274C [ERROR] ${e}`,t||"")}debug(e,t=null){this.config.debug&&this.config.logLevel==="verbose"&&console.log(`\u{1F50D} [DEBUG] ${e}`,t||"")}},a=new S;var d={MONTH:0,DAY:1,FAJR:2,ZUHR:3,ASR:4,MAGHRIB:5,ISHA:6,EMPTY:7,JUMAH_LABEL:8,JUMAH_START:9,JUMAH_END:10},y={FIRST:1,SECOND:2,THIRD:3},L={ATHAN:"athan",IQAMA:"iqama"},h={TIME:"--:--",JUMAH_TIME:"--:-- - --:--",TITLE:"Prayer Times",LOCATION:"Location"},U=[/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/,/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/view/];function H(s){if(!s)return a.error("No URL provided to extractSheetId"),null;a.debug("Extracting Sheet ID from URL",s);for(let e of U){let t=s.match(e);if(t){let r=t[1];return a.success("Sheet ID extracted",r),r}}return a.error("Could not extract Sheet ID from URL",s),null}function E(s){return!s||!s.trim()?[]:s.split(",").map(e=>e.replace(/^"/,"").replace(/"$/,"").trim())}function R(){let s=new Date;return{month:s.getMonth()+1,day:s.getDate(),year:s.getFullYear()}}function V(){let s=new Date;return s.setDate(s.getDate()+1),{month:s.getMonth()+1,day:s.getDate(),year:s.getFullYear()}}function m(s){return s!=null&&s!==""}function D(s){return`prayer_times_${s}`}var b=class{constructor(){this.sheetId=null}setSheetId(e){if(this.sheetId=H(e),!this.sheetId)throw new Error("Invalid Google Sheet URL");a.info("Sheet ID set",this.sheetId)}fetchCSV(){return u(this,null,function*(){if(!this.sheetId)throw new Error("Sheet ID not set");a.info("Fetching CSV data from Google Sheets");let e="";try{e=yield this._fetchWithGoogleViz(),a.success("Successfully fetched data using Google Visualization API")}catch(t){a.warn("Google Visualization API failed, trying direct CSV export",t.message);try{e=yield this._fetchWithDirectExport(),a.success("Successfully fetched data using direct CSV export")}catch(r){throw a.error("Both fetch methods failed",r.message),new Error("Could not fetch data from Google Sheets")}}return e})}_fetchWithGoogleViz(){return u(this,null,function*(){let e=`https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv`,t=yield fetch(e,{mode:"cors",cache:"no-cache"});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return yield t.text()})}_fetchWithDirectExport(){return u(this,null,function*(){let e=`https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv`,t=yield fetch(e,{mode:"cors",cache:"no-cache"});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return yield t.text()})}validateCSVData(e){if(!e||e.trim().length===0)throw new Error("Empty CSV data received");let t=e.split(`
`);if(t.length<2)throw new Error("CSV data must have at least 2 lines (header + data)");return a.success("CSV data validation passed",{lines:t.length,firstLine:t[0]}),!0}};var j=class{constructor(){this.jumuahTimes={},this.prayerTimesData=[]}parseCSV(e){a.info("Starting CSV parsing");let t=e.split(`
`);return a.info("CSV split into lines",t.length),this._parseJumuahTimes(t),this._parsePrayerTimes(t),a.success("CSV parsing completed",{jumuahTimes:this.jumuahTimes,prayerDays:this.prayerTimesData.length}),{jumuahTimes:this.jumuahTimes,prayerTimesData:this.prayerTimesData}}_parseJumuahTimes(e){a.info("Parsing Jumuah times from rows 2-4"),this.jumuahTimes={jumuah1:"",jumuah2:"",jumuah3:""};for(let t=y.FIRST;t<=y.THIRD;t++)if(e[t]&&e[t].trim()){let r=E(e[t]);if(r.length>=d.JUMAH_END+1){let i=r[d.JUMAH_START],o=r[d.JUMAH_END];if(m(i)&&m(o)){let n=`${i} - ${o}`;t===y.FIRST?this.jumuahTimes.jumuah1=n:t===y.SECOND?this.jumuahTimes.jumuah2=n:t===y.THIRD&&(this.jumuahTimes.jumuah3=n),a.debug(`Parsed Jumuah ${t}`,n)}}}!this.jumuahTimes.jumuah1&&!this.jumuahTimes.jumuah2&&!this.jumuahTimes.jumuah3&&(a.warn("No Jumuah times found, using fallback values"),this.jumuahTimes.jumuah1=h.JUMAH_TIME,this.jumuahTimes.jumuah2=h.JUMAH_TIME,this.jumuahTimes.jumuah3=h.JUMAH_TIME)}_parsePrayerTimes(e){a.info("Parsing daily prayer times"),this.prayerTimesData=[];for(let t=4;t<e.length;t++)if(e[t]&&e[t].trim()){let r=E(e[t]);if(r.length>=d.ISHA+1){let i=l({month:parseInt(r[d.MONTH]),day:parseInt(r[d.DAY]),fajr:r[d.FAJR]||h.TIME,dhuhr:r[d.ZUHR]||h.TIME,asr:r[d.ASR]||h.TIME,maghrib:r[d.MAGHRIB]||h.TIME,isha:r[d.ISHA]||h.TIME},this.jumuahTimes);this.prayerTimesData.push(i)}}a.success("Daily prayer times parsed",this.prayerTimesData.length)}validateParsedData(){if(!this.prayerTimesData||this.prayerTimesData.length===0)throw new Error("No prayer times data parsed");let e=this.prayerTimesData[0],t=["month","day","fajr","dhuhr","asr","maghrib","isha"];for(let r of t)if(!m(e[r]))throw new Error(`Missing required field: ${r}`);return a.success("Parsed data validation passed"),!0}};var I=class{validateJumuahTimes(e){if(a.info("Validating Jumuah times"),!e)return a.error("Jumuah times object is null or undefined"),!1;let t=["jumuah1","jumuah2","jumuah3"],r=t.filter(i=>!m(e[i]));if(r.length>0)return a.error(`Missing Jumuah times: ${r.join(", ")}`),!1;for(let i of t){let o=e[i];if(o!==h.JUMAH_TIME&&!o.includes(" - "))return a.error(`Invalid Jumuah time format for ${i}: ${o}`),!1}return a.success("Jumuah times validation passed"),!0}validatePrayerData(e){if(a.debug("Validating prayer data for day",e),!e)return a.error("Prayer data is null or undefined"),!1;let r=["month","day","fajr","dhuhr","asr","maghrib","isha"].filter(i=>!m(e[i]));return r.length>0?(a.error(`Missing prayer data: ${r.join(", ")}`),!1):isNaN(e.month)||isNaN(e.day)?(a.error("Month and day must be numbers"),!1):e.month<1||e.month>12?(a.error(`Invalid month: ${e.month}`),!1):e.day<1||e.day>31?(a.error(`Invalid day: ${e.day}`),!1):(a.debug("Prayer data validation passed"),!0)}validatePrayerTimesArray(e){if(a.info("Validating prayer times array"),!Array.isArray(e))return a.error("Prayer times data is not an array"),!1;if(e.length===0)return a.error("Prayer times array is empty"),!1;let t=Math.min(5,e.length);for(let r=0;r<t;r++)if(!this.validatePrayerData(e[r]))return a.error(`Validation failed for prayer data at index ${r}`),!1;return a.success("Prayer times array validation passed",{totalDays:e.length,sampleValidated:t}),!0}validateConfig(e){if(a.info("Validating configuration"),!e)return a.error("Configuration is null or undefined"),!1;let r=["googleSheetUrl","title","location"].filter(i=>!m(e[i]));return r.length>0?(a.error(`Missing required configuration: ${r.join(", ")}`),!1):e.googleSheetUrl.includes("docs.google.com/spreadsheets")?isNaN(e.jumuahCount)||e.jumuahCount<1||e.jumuahCount>3?(a.error(`Invalid jumuahCount: ${e.jumuahCount}`),!1):(a.success("Configuration validation passed"),!0):(a.error("Invalid Google Sheet URL format"),!1)}validateCompleteDataSet(e){if(a.info("Validating complete data set"),!e)return a.error("Data set is null or undefined"),!1;let{jumuahTimes:t,prayerTimesData:r}=e;return!this.validateJumuahTimes(t)||!this.validatePrayerTimesArray(r)?!1:(a.success("Complete data set validation passed"),!0)}};var M=class{constructor(e=10*60*1e3){this.cache=new Map,this.cacheDuration=e,this.cleanupInterval=null,this._startCleanupInterval()}get(e){let t=this.cache.get(e);return t?Date.now()-t.timestamp>this.cacheDuration?(a.debug("Cache expired",e),this.cache.delete(e),null):(a.debug("Cache hit",e),t.data):(a.debug("Cache miss",e),null)}set(e,t){let r={data:t,timestamp:Date.now()};this.cache.set(e,r),a.debug("Data cached",e)}getPrayerTimes(e){let t=D(e);return this.get(t)}setPrayerTimes(e,t){let r=D(e);this.set(r,t)}clear(){this.cache.clear(),a.info("Cache cleared")}cleanup(){let e=Date.now(),t=0;for(let[r,i]of this.cache.entries())e-i.timestamp>this.cacheDuration&&(this.cache.delete(r),t++);t>0&&a.debug(`Cleaned up ${t} expired cache entries`)}_startCleanupInterval(){this.cleanupInterval=setInterval(()=>{this.cleanup()},5*60*1e3)}};var v=class{constructor(e,t,r,i){this.dataFetcher=e,this.dataParser=t,this.validator=r,this.cacheManager=i,this.prayerTimesData=[]}fetchPrayerTimes(){return u(this,null,function*(){a.info("Starting prayer times fetch process");try{let e=this.cacheManager.getPrayerTimes(this.dataFetcher.sheetId);if(e){a.success("Using cached prayer times data"),this.prayerTimesData=e;return}a.info("Cache miss, fetching fresh data");let t=yield this.dataFetcher.fetchCSV();this.dataFetcher.validateCSVData(t);let r=this.dataParser.parseCSV(t);this.validator.validateCompleteDataSet(r),this.prayerTimesData=r.prayerTimesData,this.cacheManager.setPrayerTimes(this.dataFetcher.sheetId,this.prayerTimesData),a.success("Prayer times fetch process completed",{totalDays:this.prayerTimesData.length})}catch(e){throw a.error("Failed to fetch prayer times",e.message),e}})}getPrayerTimesForDate(e=null){return u(this,null,function*(){yield this.fetchPrayerTimes();let t=e||R();a.info("Getting prayer times for date",t);let r=this.prayerTimesData.find(o=>o.month===t.month&&o.day===t.day),i={};if(r)a.success("Found prayer times for target date"),i={fajr:r.fajr,dhuhr:r.dhuhr,asr:r.asr,maghrib:r.maghrib,isha:r.isha,jumuah1:r.jumuah1,jumuah2:r.jumuah2,jumuah3:r.jumuah3,tomorrowFajr:this._getTomorrowFajr(t)};else{a.warn("No prayer times found for target date, using first row as demo data");let o=this.prayerTimesData[0];if(!o)throw a.error("No prayer data available"),new Error("No prayer data available");i={fajr:o.fajr||h.TIME,dhuhr:o.dhuhr||h.TIME,asr:o.asr||h.TIME,maghrib:o.maghrib||h.TIME,isha:o.isha||h.TIME,jumuah1:o.jumuah1||h.JUMAH_TIME,jumuah2:o.jumuah2||h.JUMAH_TIME,jumuah3:o.jumuah3||h.JUMAH_TIME,tomorrowFajr:o.fajr||h.TIME}}return a.success("Prayer times retrieved",i),i})}getPrayerTimesForToday(){return u(this,null,function*(){return yield this.getPrayerTimesForDate()})}_getTomorrowFajr(e){let t=V(),r=this.prayerTimesData.find(o=>o.month===t.month&&o.day===t.day);if(r)return r.fajr;let i=this.prayerTimesData.find(o=>o.month===e.month&&o.day===e.day);return i?i.fajr:h.TIME}getPrayerStatus(e){a.debug("Calculating prayer status");let t=new Date,r=t.getHours()*60+t.getMinutes(),i=[{name:"fajr",time:this._timeToMinutes(e.fajr)},{name:"dhuhr",time:this._timeToMinutes(e.dhuhr)},{name:"asr",time:this._timeToMinutes(e.asr)},{name:"maghrib",time:this._timeToMinutes(e.maghrib)},{name:"isha",time:this._timeToMinutes(e.isha)}];i.sort((c,w)=>c.time-w.time);let o=null,n=null;for(let c=0;c<i.length;c++)r>=i[c].time&&(o=i[c],n=i[(c+1)%i.length]);o||(n=i[0]);let f={currentPrayer:(o==null?void 0:o.name)||null,nextPrayer:(n==null?void 0:n.name)||"fajr",nextPrayerTime:(n==null?void 0:n.time)||i[0].time};return a.debug("Prayer status calculated",f),f}_timeToMinutes(e){if(!e||e===h.TIME)return 0;let[t,r]=e.split(" "),[i,o]=t.split(":").map(Number),n=i*60+o;return r==="PM"&&i!==12?n+=12*60:r==="AM"&&i===12&&(n-=12*60),n}refreshData(){return u(this,null,function*(){a.info("Refreshing prayer times data"),this.cacheManager.clear(),yield this.fetchPrayerTimes()})}};var C=class{constructor(){this.cardColors={}}renderWidget(e,t){a.info("Rendering widget HTML"),this.cardColors=this._getCardColors(t.backgroundColor);let r=t.accentColor,i=this._generateWidgetHTML(e,t,r);return a.success("Widget HTML rendered"),i}_generateWidgetHTML(e,t,r){let i=t.title||"Prayer Times",o=t.location||"Location",n=t.timeType===L.ATHAN?"\u{1F54C} Athan Times":"\u{1F54C} Iqama Times";return`
            <div id="iqama-widget" style="
                background: ${t.backgroundColor};
                color: ${r};
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
                    }
                    
                    .prayer-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 10px 12px;
                        margin-bottom: 6px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 8px;
                        transition: all 0.2s ease;
                    }
                    
                    .prayer-item:hover {
                        background: ${this.cardColors.background};
                        border-color: ${this.cardColors.borderActive};
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
                        color: ${r};
                        flex-shrink: 0;
                    }
                    
                    .prayer-time {
                        font-size: 17px;
                        font-weight: 700;
                        color: ${r};
                        text-align: right;
                        flex-grow: 1;
                        margin-left: 10px;
                    }
                    
                    .jumuah-timeline {
                        display: flex;
                        gap: 8px;
                        margin-top: 12px;
                        flex-wrap: wrap;
                    }
                    
                    .jumuah-slot {
                        flex: 1;
                        min-width: 140px;
                        text-align: center;
                        padding: 8px 6px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 8px;
                    }
                    
                    .jumuah-label {
                        font-size: 14px;
                        font-weight: 600;
                        color: ${r};
                        margin-bottom: 4px;
                        white-space: nowrap;
                    }
                    
                    .jumuah-time {
                        font-size: 16px;
                        font-weight: 700;
                        color: ${r};
                        white-space: nowrap;
                    }
                    
                    @media (max-width: 480px) {
                        .jumuah-timeline {
                            flex-direction: column;
                        }
                        
                        .jumuah-slot {
                            min-width: auto;
                        }
                        
                        .jumuah-time {
                            white-space: normal;
                            text-overflow: unset;
                        }
                    }
                    
                    .description-card {
                        background: ${this.cardColors.background};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 8px;
                        padding: 12px;
                        margin-top: 16px;
                        text-align: center;
                    }
                    
                    .description-text {
                        font-size: 14px;
                        color: ${r};
                        opacity: 0.8;
                    }
                </style>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="
                        margin: 0 0 8px 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: ${r};
                    ">${i}</h2>
                    <p style="
                        margin: 0;
                        font-size: 16px;
                        color: ${r};
                        opacity: 0.8;
                    ">${o}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="
                        margin: 0 0 16px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: ${r};
                    ">${n}</h3>
                    
                    ${this._renderPrayerTimes(e,r)}
                </div>
                
                ${this._renderJumuahSection(e,t.jumuahCount,r)}
                
                <div class="description-card">
                    <p class="description-text">
                        Times shown are when the Athan is announced
                    </p>
                </div>
            </div>
        `}_renderPrayerTimes(e,t){return[{name:"Fajr",time:e.fajr,icon:"\u{1F305}"},{name:"Dhuhr",time:e.dhuhr,icon:"\u2600\uFE0F"},{name:"Asr",time:e.asr,icon:"\u{1F324}\uFE0F"},{name:"Maghrib",time:e.maghrib,icon:"\u{1F307}"},{name:"Isha",time:e.isha,icon:"\u{1F319}"}].map(i=>`
            <div class="prayer-item">
                <div class="prayer-info">
                    <span class="prayer-icon">${i.icon}</span>
                    <span class="prayer-name">${i.name}</span>
                </div>
                <span class="prayer-time">${i.time}</span>
            </div>
        `).join("")}_formatJumuahTime(e){if(!e||e.includes("--:--"))return e;let t=e.split(" - ");if(t.length===2){let r=t[0],i=t[1],o=i.includes("AM")?"AM":"PM";return`${r.replace(/\s*(AM|PM)/,"")}-${i}`}return e}_renderJumuahSection(e,t,r){if(t===0)return"";let i=[{name:"1st Jumuah",time:e.jumuah1},{name:"2nd Jumuah",time:e.jumuah2},{name:"3rd Jumuah",time:e.jumuah3}].slice(0,t);return`
            <div style="margin-bottom: 20px;">
                <h3 style="
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: ${r};
                ">Jumuah Prayers</h3>
                
                <div class="jumuah-timeline">
                    ${i.map(o=>`
                        <div class="jumuah-slot">
                            <div class="jumuah-label">${o.name}</div>
                            <div class="jumuah-time">${this._formatJumuahTime(o.time)}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `}_getCardColors(e){let t=this._isDarkColor(e);return{background:t?"rgba(255, 255, 255, 0.05)":"rgba(0, 0, 0, 0.05)",backgroundActive:t?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)",border:t?"rgba(255, 255, 255, 0.1)":"#cccccc",borderActive:t?"rgba(255, 255, 255, 0.15)":"rgba(0, 0, 0, 0.3)"}}_isDarkColor(e){let t=e.replace("#",""),r=parseInt(t.substr(0,2),16),i=parseInt(t.substr(2,2),16),o=parseInt(t.substr(4,2),16);return(r*299+i*587+o*114)/1e3<128}};var T=class{constructor(){this.config=null,this.dataFetcher=null,this.dataParser=null,this.validator=null,this.cacheManager=null,this.prayerManager=null,this.renderer=null,this.isInitialized=!1}initialize(){return u(this,null,function*(){a.info("Initializing widget manager");try{this.config=p(),A(this.config),this.dataFetcher=new b,this.dataParser=new j,this.validator=new I,this.cacheManager=new M(this.config.cacheDuration),this.renderer=new C,this.dataFetcher.setSheetId(this.config.googleSheetUrl),this.prayerManager=new v(this.dataFetcher,this.dataParser,this.validator,this.cacheManager),this.isInitialized=!0,a.success("Widget manager initialized successfully")}catch(e){throw a.error("Failed to initialize widget manager",e.message),e}})}createWidget(){return u(this,null,function*(){this.isInitialized||(yield this.initialize()),a.info("Creating widget");try{let e=yield this.prayerManager.getPrayerTimesForToday(),t=this.renderer.renderWidget(e,this.config);this._injectWidget(t),this._setupAutoRefresh(),a.success("Widget created and injected successfully")}catch(e){a.error("Failed to create widget",e.message),this._injectErrorWidget(e.message)}})}_injectWidget(e){let t=document.getElementById("iqama-widget-container");if(t)a.info("Found existing widget container"),t.innerHTML=e;else{a.info("No container found, creating new widget");let r=document.createElement("div");r.innerHTML=e;let i=document.querySelectorAll('script[src*="iqama-widget-cloud.js"]');if(i.length>0){let o=i[i.length-1];o.parentNode.insertBefore(r.firstElementChild,o.nextSibling)}else document.body.appendChild(r.firstElementChild)}}_injectErrorWidget(e){let t=`
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
        `;this._injectWidget(t)}_setupAutoRefresh(){this.config.pollingInterval>0&&(a.info("Setting up auto-refresh",this.config.pollingInterval),setInterval(()=>u(this,null,function*(){try{a.info("Auto-refreshing widget data"),yield this.prayerManager.refreshData(),yield this.createWidget()}catch(e){a.error("Auto-refresh failed",e.message)}}),this.config.pollingInterval))}updateConfig(e){a.info("Updating widget configuration"),this.config=l(l({},this.config),e),A(this.config),e.googleSheetUrl&&e.googleSheetUrl!==this.dataFetcher.sheetId&&this.dataFetcher.setSheetId(e.googleSheetUrl)}};var g=null;function _(){a.info("Initializing Iqama Widget");try{g=new T,g.createWidget().then(()=>{a.success("Iqama Widget initialized successfully")}).catch(s=>{a.error("Failed to initialize widget",s.message)})}catch(s){a.error("Widget initialization failed",s.message)}}window.createWidget=function(){return u(this,null,function*(){return g?g.updateConfig(p()):g=new T,yield g.createWidget(),g})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_):_();return k(G);})();
