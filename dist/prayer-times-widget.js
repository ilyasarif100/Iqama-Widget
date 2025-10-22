/*
 * Iqama Widget v2.0.0 - Modular Prayer Times Widget
 * https://github.com/ilyasarif100/Iqama-Widget
 * 
 * Super simple embed - just paste one script tag!
 * Automatically extracts Sheet ID from Google Sheet URL
 * 
 * Built: 2025-10-22T20:22:00.146Z
 */
var IqamaWidget=(()=>{var E=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var Y=Object.getOwnPropertyNames,L=Object.getOwnPropertySymbols;var V=Object.prototype.hasOwnProperty,K=Object.prototype.propertyIsEnumerable;var J=(o,e,t)=>e in o?E(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t,T=(o,e)=>{for(var t in e||(e={}))V.call(e,t)&&J(o,t,e[t]);if(L)for(var t of L(e))K.call(e,t)&&J(o,t,e[t]);return o};var Z=(o,e)=>{for(var t in e)E(o,t,{get:e[t],enumerable:!0})},X=(o,e,t,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Y(e))!V.call(o,r)&&r!==t&&E(o,r,{get:()=>e[r],enumerable:!(a=G(e,r))||a.enumerable});return o};var ee=o=>X(E({},"__esModule",{value:!0}),o);var p=(o,e,t)=>new Promise((a,r)=>{var n=d=>{try{m(t.next(d))}catch(l){r(l)}},s=d=>{try{m(t.throw(d))}catch(l){r(l)}},m=d=>d.done?a(d.value):Promise.resolve(d.value).then(n,s);m((t=t.apply(o,e)).next())});var ae={};Z(ae,{WidgetManager:()=>v,initializeWidget:()=>R});var te={googleSheetUrl:"https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing",title:"Prayer Times",location:"ICCP AZ",backgroundColor:"#1F2937",accentColor:"#E5E7EB",borderRadius:"20px",timeType:"athan",jumuahCount:1,announcement:"",cacheDuration:864e5};function w(){return T(T({},te),window.IqamaWidgetConfig||{})}function N(o){let t=["googleSheetUrl","title","location"].filter(a=>!o[a]);if(t.length>0)throw new Error(`Missing required configuration: ${t.join(", ")}`);return!0}var H=class{constructor(){this.config=w()}info(e,t=null){console.log(`\u2139\uFE0F [INFO] ${e}`,t||"")}success(e,t=null){console.log(`\u2705 [SUCCESS] ${e}`,t||"")}warn(e,t=null){console.warn(`\u26A0\uFE0F [WARNING] ${e}`,t||"")}error(e,t=null){console.error(`\u274C [ERROR] ${e}`,t||"")}debug(e,t=null){console.log(`\u{1F50D} [DEBUG] ${e}`,t||"")}},i=new H;var c={MONTH:0,DAY:1,FAJR_ATHAN:2,FAJR_IQAMA:3,SUNRISE:4,ZUHR_ATHAN:5,ZUHR_IQAMA:6,ASR_ATHAN:7,ASR_IQAMA:8,MAGHRIB_ATHAN:9,MAGHRIB_IQAMA:10,ISHA_ATHAN:11,ISHA_IQAMA:12,EMPTY:13,PRAYER_NAME:14,IQAMA_OFFSET:15,EMPTY2:16,JUMAH_LABEL:17,JUMAH_START:18,JUMAH_END:19,ANNOUNCEMENT:21},M={FIRST:1,SECOND:2,THIRD:3},b={ATHAN:"athan",IQAMA:"iqama",BOTH:"athan and iqama"},h={TIME:"--:--",JUMAH_TIME:"--:-- - --:--",TITLE:"Prayer Times",LOCATION:"Location"},k=[/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/,/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/view/];function W(o){if(!o)return i.error("No URL provided to extractSheetId"),null;i.info("Extracting Sheet ID from URL",o);for(let e of k){let t=o.match(e);if(t){let a=t[1];return i.success("Sheet ID extracted",a),a}}return i.error("Could not extract Sheet ID from URL",o),null}function _(o){return!o||!o.trim()?[]:o.split(",").map(e=>e.replace(/^"/,"").replace(/"$/,"").trim())}function O(){let o=new Date;return{month:o.getMonth()+1,day:o.getDate(),year:o.getFullYear()}}function B(){let o=new Date;return o.setDate(o.getDate()+1),{month:o.getMonth()+1,day:o.getDate(),year:o.getFullYear()}}function A(o){return o!=null&&o!==""}function F(o){return`prayer_times_${o}`}var C=class{constructor(){this.sheetId=null}setSheetId(e){if(this.sheetId=W(e),!this.sheetId)throw new Error("Invalid Google Sheet URL");i.info("Sheet ID set",this.sheetId)}fetchCSV(){return p(this,null,function*(){if(!this.sheetId)throw new Error("Sheet ID not set");i.info("Fetching CSV data from Google Sheets");let e="";try{e=yield this._fetchWithGoogleViz(),i.success("Successfully fetched data using Google Visualization API")}catch(t){i.warn("Google Visualization API failed, trying direct CSV export",t.message);try{e=yield this._fetchWithDirectExport(),i.success("Successfully fetched data using direct CSV export")}catch(a){throw i.error("Both fetch methods failed",a.message),new Error("Could not fetch data from Google Sheets")}}return e})}_fetchWithGoogleViz(){return p(this,null,function*(){let e=`https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&t=${Date.now()}`,t=yield fetch(e,{mode:"cors",cache:"no-cache"});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return yield t.text()})}_fetchWithDirectExport(){return p(this,null,function*(){let e=`https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv`,t=yield fetch(e,{mode:"cors",cache:"no-cache"});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return yield t.text()})}validateCSVData(e){if(!e||e.trim().length===0)throw new Error("Empty CSV data received");let t=e.split(`
`);if(t.length<2)throw new Error("CSV data must have at least 2 lines (header + data)");return i.success("CSV data validation passed",{lines:t.length,firstLine:t[0]}),!0}};var S=class{constructor(){this.jumuahTimes={},this.prayerTimesData=[]}parseCSV(e){i.info("Starting CSV parsing");let t=e.split(`
`);return i.info("CSV split into lines",t.length),this._parseJumuahTimes(t),this._parsePrayerTimes(t),i.success("CSV parsing completed",{jumuahTimes:this.jumuahTimes,prayerDays:this.prayerTimesData.length}),{jumuahTimes:this.jumuahTimes,prayerTimesData:this.prayerTimesData}}_parseJumuahTimes(e){i.info("Parsing Jumuah times from rows 2-4"),this.jumuahTimes={jumuah1:"",jumuah2:"",jumuah3:""};for(let t=M.FIRST;t<=M.THIRD;t++)if(e[t]&&e[t].trim()){let a=_(e[t]);if(a.length>=c.JUMAH_END+1){let r=a[c.JUMAH_START],n=a[c.JUMAH_END];if(A(r)&&A(n)){let s=`${r} - ${n}`;t===M.FIRST?this.jumuahTimes.jumuah1=s:t===M.SECOND?this.jumuahTimes.jumuah2=s:t===M.THIRD&&(this.jumuahTimes.jumuah3=s),i.info(`Parsed Jumuah ${t}`,s)}}}!this.jumuahTimes.jumuah1&&!this.jumuahTimes.jumuah2&&!this.jumuahTimes.jumuah3&&(i.warn("No Jumuah times found, using fallback values"),this.jumuahTimes.jumuah1=h.JUMAH_TIME,this.jumuahTimes.jumuah2=h.JUMAH_TIME,this.jumuahTimes.jumuah3=h.JUMAH_TIME)}_parsePrayerTimes(e){i.info("Parsing daily prayer times"),this.prayerTimesData=[];let t={},a="",r=1;for(let n=1;n<Math.min(e.length,10);n++)if(e[n]&&e[n].trim()){let s=_(e[n]);if(i.info(`Checking row ${n+1}:`,{valuesLength:s.length,announcementColumn:s[c.ANNOUNCEMENT],announcementColumnIndex:c.ANNOUNCEMENT,prayerName:s[c.PRAYER_NAME],iqamaOffset:s[c.IQAMA_OFFSET]}),s.length>=c.IQAMA_OFFSET+1){let m=s[c.PRAYER_NAME],d=s[c.IQAMA_OFFSET],l=s[c.ANNOUNCEMENT];if(l&&l.trim()&&!a&&(a=l.trim(),i.info("Found announcement in offset row",a)),m&&m.trim()!==""&&d&&d.trim()!==""){let u=parseInt(d);!isNaN(u)&&u>=1&&u<=360?(t[m.toLowerCase()]=u,r=Math.max(r,n+1)):isNaN(u)||i.warn(`Invalid offset for ${m}: ${u} minutes. Must be between 1-360 minutes.`)}}}Object.keys(t).length===0&&(r=1),i.info("CSV header and first few rows:",{header:e[0],row2:e[1],row3:e[2],row4:e[3]});for(let n=r;n<e.length;n++)if(e[n]&&e[n].trim()){let s=_(e[n]);if(s.length>=c.JUMAH_END+1){let m=s[c.FAJR_ATHAN]||h.TIME,d=s[c.SUNRISE]||h.TIME,l=s[c.ZUHR_ATHAN]||h.TIME,u=s[c.ASR_ATHAN]||h.TIME,f=s[c.MAGHRIB_ATHAN]||h.TIME,x=s[c.ISHA_ATHAN]||h.TIME,I=s[c.FAJR_IQAMA]||h.TIME,g=s[c.ZUHR_IQAMA]||h.TIME,j=s[c.ASR_IQAMA]||h.TIME,U=s[c.MAGHRIB_IQAMA]||h.TIME,z=s[c.ISHA_IQAMA]||h.TIME;t.fajr&&(I=this._addMinutesToTime(m,t.fajr)),t.dhuhr&&(g=this._addMinutesToTime(l,t.dhuhr)),t.asr&&(j=this._addMinutesToTime(u,t.asr)),t.maghrib&&(U=this._addMinutesToTime(f,t.maghrib)),t.isha&&(z=this._addMinutesToTime(x,t.isha));let Q=T({month:parseInt(s[c.MONTH]),day:parseInt(s[c.DAY]),fajrAthan:m,sunrise:d,dhuhrAthan:l,asrAthan:u,maghribAthan:f,ishaAthan:x,fajrIqama:I,dhuhrIqama:g,asrIqama:j,maghribIqama:U,ishaIqama:z,announcement:a||"",fajr:m,dhuhr:l,asr:u,maghrib:f,isha:x},this.jumuahTimes);this.prayerTimesData.push(Q)}}i.success("Daily prayer times parsed",this.prayerTimesData.length)}_addMinutesToTime(e,t){var a;if(!e||e.includes("--:--"))return h.TIME;try{let r=e.includes("AM")||e.includes("PM"),n=e.replace(/\s*(AM|PM)/i,""),s=((a=e.match(/(AM|PM)/i))==null?void 0:a[0])||"",[m,d]=n.split(":").map(Number),l=m;r&&(s.toUpperCase()==="AM"&&m===12?l=0:s.toUpperCase()==="PM"&&m!==12&&(l=m+12));let u=l*60+d+t;u<0?u+=24*60:u>=24*60&&(u-=24*60);let f=Math.floor(u/60),x=u%60;if(r){let I=f,g="AM";return f===0?(I=12,g="AM"):f<12?g="AM":(f===12||(I=f-12),g="PM"),`${I}:${x.toString().padStart(2,"0")} ${g}`}else return`${f}:${x.toString().padStart(2,"0")}`}catch(r){return i.info("Error adding minutes to time",{timeString:e,minutes:t,error:r.message}),h.TIME}}validateParsedData(){if(!this.prayerTimesData||this.prayerTimesData.length===0)throw new Error("No prayer times data parsed");let e=this.prayerTimesData[0],t=["month","day","fajrAthan","sunrise","dhuhrAthan","asrAthan","maghribAthan","ishaAthan","fajrIqama","dhuhrIqama","asrIqama","maghribIqama","ishaIqama"];for(let a of t)if(!A(e[a]))throw new Error(`Missing required field: ${a}`);return i.success("Parsed data validation passed"),!0}};var D=class{validateJumuahTimes(e){if(i.info("Validating Jumuah times"),!e)return i.error("Jumuah times object is null or undefined"),!1;let t=["jumuah1","jumuah2","jumuah3"],a=t.filter(r=>!A(e[r]));if(a.length>0)return i.error(`Missing Jumuah times: ${a.join(", ")}`),!1;for(let r of t){let n=e[r];if(n!==h.JUMAH_TIME&&!n.includes(" - "))return i.error(`Invalid Jumuah time format for ${r}: ${n}`),!1}return i.success("Jumuah times validation passed"),!0}validatePrayerData(e){if(i.info("Validating prayer data for day",e),!e)return i.error("Prayer data is null or undefined"),!1;let a=["month","day","fajr","dhuhr","asr","maghrib","isha"].filter(r=>!A(e[r]));return a.length>0?(i.error(`Missing prayer data: ${a.join(", ")}`),!1):isNaN(e.month)||isNaN(e.day)?(i.error("Month and day must be numbers"),!1):e.month<1||e.month>12?(i.error(`Invalid month: ${e.month}`),!1):e.day<1||e.day>31?(i.error(`Invalid day: ${e.day}`),!1):(i.info("Prayer data validation passed"),!0)}validatePrayerTimesArray(e){if(i.info("Validating prayer times array"),!Array.isArray(e))return i.error("Prayer times data is not an array"),!1;if(e.length===0)return i.error("Prayer times array is empty"),!1;let t=Math.min(5,e.length);for(let a=0;a<t;a++)if(!this.validatePrayerData(e[a]))return i.error(`Validation failed for prayer data at index ${a}`),!1;return i.success("Prayer times array validation passed",{totalDays:e.length,sampleValidated:t}),!0}validateConfig(e){if(i.info("Validating configuration"),!e)return i.error("Configuration is null or undefined"),!1;let a=["googleSheetUrl","title","location"].filter(r=>!A(e[r]));return a.length>0?(i.error(`Missing required configuration: ${a.join(", ")}`),!1):e.googleSheetUrl.includes("docs.google.com/spreadsheets")?isNaN(e.jumuahCount)||e.jumuahCount<1||e.jumuahCount>3?(i.error(`Invalid jumuahCount: ${e.jumuahCount}`),!1):(i.success("Configuration validation passed"),!0):(i.error("Invalid Google Sheet URL format"),!1)}validateCompleteDataSet(e){if(i.info("Validating complete data set"),!e)return i.error("Data set is null or undefined"),!1;let{jumuahTimes:t,prayerTimesData:a}=e;return!this.validateJumuahTimes(t)||!this.validatePrayerTimesArray(a)?!1:(i.success("Complete data set validation passed"),!0)}};var $=class{constructor(e=24*60*60*1e3){this.cache=new Map,this.cacheDuration=e,this.cleanupInterval=null,this._startCleanupInterval()}get(e,t=!1){let a=this.cache.get(e);if(!a)return i.info("Cache miss",e),null;let r=this._isDataFromToday(a.timestamp);return t||!r?(i.info(t?"Force refresh requested":"Data not from today",e),this.cache.delete(e),null):(i.info("Cache hit (daily data)",e),a.data)}set(e,t){let a={data:t,timestamp:Date.now()};this.cache.set(e,a),i.info("Data cached",e)}getPrayerTimes(e){let t=F(e);return this.get(t)}setPrayerTimes(e,t){let a=F(e);this.set(a,t)}clear(){this.cache.clear(),i.info("Cache cleared")}cleanup(){let e=Date.now(),t=0;for(let[a,r]of this.cache.entries())e-r.timestamp>this.cacheDuration&&(this.cache.delete(a),t++);t>0&&i.info(`Cleaned up ${t} expired cache entries`)}_isDataFromToday(e){let t=new Date().toDateString(),a=new Date(e).toDateString();return t===a}_startCleanupInterval(){this.cleanupInterval=setInterval(()=>{this.cleanup()},60*60*1e3)}};var P=class{constructor(e,t,a,r){this.dataFetcher=e,this.dataParser=t,this.validator=a,this.cacheManager=r,this.prayerTimesData=[]}fetchPrayerTimes(e=!1){return p(this,null,function*(){i.info("Starting prayer times fetch process",{forceRefresh:e});try{i.info("Clearing cache to get fresh data"),this.cacheManager.clear();let t=this.cacheManager.getPrayerTimes(this.dataFetcher.sheetId,!0);if(t){i.success("Using cached prayer times data"),this.prayerTimesData=t;return}i.info("Cache miss, fetching fresh data");let a=yield this.dataFetcher.fetchCSV();this.dataFetcher.validateCSVData(a);let r=this.dataParser.parseCSV(a);this.validator.validateCompleteDataSet(r),this.prayerTimesData=r.prayerTimesData,this.cacheManager.setPrayerTimes(this.dataFetcher.sheetId,this.prayerTimesData),i.success("Prayer times fetch process completed",{totalDays:this.prayerTimesData.length})}catch(t){throw i.error("Failed to fetch prayer times",t.message),t}})}getPrayerTimesForDate(e=null,t=!1){return p(this,null,function*(){yield this.fetchPrayerTimes(t);let a=e||O();i.info("Getting prayer times for date",a);let r=this.prayerTimesData.find(s=>s.month===a.month&&s.day===a.day),n={};if(r)i.success("Found prayer times for target date"),n={fajrAthan:r.fajrAthan,sunrise:r.sunrise,dhuhrAthan:r.dhuhrAthan,asrAthan:r.asrAthan,maghribAthan:r.maghribAthan,ishaAthan:r.ishaAthan,fajrIqama:r.fajrIqama,dhuhrIqama:r.dhuhrIqama,asrIqama:r.asrIqama,maghribIqama:r.maghribIqama,ishaIqama:r.ishaIqama,announcement:r.announcement||"",fajr:r.fajr,dhuhr:r.dhuhr,asr:r.asr,maghrib:r.maghrib,isha:r.isha,jumuah1:r.jumuah1,jumuah2:r.jumuah2,jumuah3:r.jumuah3,tomorrowFajr:this._getTomorrowFajr(a)};else{i.warn("No prayer times found for target date, using first row as demo data");let s=this.prayerTimesData[0];if(!s)throw i.error("No prayer data available"),new Error("No prayer data available");n={fajrAthan:s.fajrAthan||h.TIME,sunrise:s.sunrise||h.TIME,dhuhrAthan:s.dhuhrAthan||h.TIME,asrAthan:s.asrAthan||h.TIME,maghribAthan:s.maghribAthan||h.TIME,ishaAthan:s.ishaAthan||h.TIME,fajrIqama:s.fajrIqama||h.TIME,dhuhrIqama:s.dhuhrIqama||h.TIME,asrIqama:s.asrIqama||h.TIME,maghribIqama:s.maghribIqama||h.TIME,ishaIqama:s.ishaIqama||h.TIME,announcement:s.announcement||"",fajr:s.fajr||h.TIME,dhuhr:s.dhuhr||h.TIME,asr:s.asr||h.TIME,maghrib:s.maghrib||h.TIME,isha:s.isha||h.TIME,jumuah1:s.jumuah1||h.JUMAH_TIME,jumuah2:s.jumuah2||h.JUMAH_TIME,jumuah3:s.jumuah3||h.JUMAH_TIME,tomorrowFajr:s.fajr||h.TIME}}return i.success("Prayer times retrieved",n),n})}getPrayerTimesForToday(){return p(this,null,function*(){return yield this.getPrayerTimesForDate()})}_getTomorrowFajr(e){let t=B(),a=this.prayerTimesData.find(n=>n.month===t.month&&n.day===t.day);if(a)return a.fajr;let r=this.prayerTimesData.find(n=>n.month===e.month&&n.day===e.day);return r?r.fajr:h.TIME}getPrayerStatus(e){i.info("Calculating prayer status");let t=new Date,a=t.getHours()*60+t.getMinutes(),r=[{name:"fajr",time:this._timeToMinutes(e.fajr)},{name:"dhuhr",time:this._timeToMinutes(e.dhuhr)},{name:"asr",time:this._timeToMinutes(e.asr)},{name:"maghrib",time:this._timeToMinutes(e.maghrib)},{name:"isha",time:this._timeToMinutes(e.isha)}];r.sort((d,l)=>d.time-l.time);let n=null,s=null;for(let d=0;d<r.length;d++)a>=r[d].time&&(n=r[d],s=r[(d+1)%r.length]);n||(s=r[0]);let m={currentPrayer:(n==null?void 0:n.name)||null,nextPrayer:(s==null?void 0:s.name)||"fajr",nextPrayerTime:(s==null?void 0:s.time)||r[0].time};return i.info("Prayer status calculated",m),m}_timeToMinutes(e){if(!e||e===h.TIME)return 0;let[t,a]=e.split(" "),[r,n]=t.split(":").map(Number),s=r*60+n;return a==="PM"&&r!==12?s+=12*60:a==="AM"&&r===12&&(s-=12*60),s}refreshData(){return p(this,null,function*(){i.info("Refreshing prayer times data"),this.cacheManager.clear(),yield this.fetchPrayerTimes()})}};var q=class{constructor(){this.cardColors={}}renderWidget(e,t){i.info("Rendering widget HTML"),console.log("\u{1F50D} Announcement Debug:",{prayerTimesAnnouncement:`"${e.announcement}"`,configAnnouncement:`"${t.announcement}"`,finalAnnouncement:`"${e.announcement||t.announcement||"Default Hadith"}"`}),this.cardColors=this._getCardColors(t.backgroundColor);let a=this._getContrastingTextColor(t.backgroundColor),r=this._generateWidgetHTML(e,t,a);return setTimeout(()=>{let n=document.querySelector(".description-text"),s=document.querySelector(".description-card");if(n&&s){let m=n.offsetWidth,d=s.offsetWidth,l=m+d,g=Math.max(20,m/8)/50*35*.25+1,j=Math.max(20,Math.min(80,g));n.style.animationDuration=j+"s"}},100),i.success("Widget HTML rendered"),r}_generateWidgetHTML(e,t,a){let r=t.title||"Prayer Times",n=t.location||"Location",s;return t.timeType===b.ATHAN?s="Athan Times":t.timeType===b.IQAMA?s="Iqama Times":(t.timeType,b.BOTH,s="Prayer Times"),`
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
                transform-origin: center top;
                zoom: 1;
            ">
                <style>
                    #iqama-widget * {
                        box-sizing: border-box;
                    }
                    
                    /* Handle browser zoom better and uniform mobile-style layout */
                    #iqama-widget {
                        min-width: 280px;
                        max-width: 600px;
                        width: 100%;
                        padding: 16px;
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
                        overflow: hidden;
                        position: relative;
                    }
                    
                    .description-text {
                        font-size: 14px;
                        color: ${a};
                        opacity: 0.8;
                        margin: 0;
                        white-space: nowrap;
                        display: inline-block;
                        animation: scrollText 15s linear infinite;
                    }
                    
                    @keyframes scrollText {
                        0% {
                            transform: translateX(0%);
                        }
                        100% {
                            transform: translateX(-100%);
                        }
                    }
                    
                    .description-text:hover {
                        animation-play-state: paused;
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
                    ">${r}</h2>
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
                    ">${s}</h3>
                    
                    ${this._renderPrayerTimes(e,a,t)}
                </div>
                
                ${this._renderJumuahSection(e,t.jumuahCount,a)}
                
                ${this._renderAstronomicalSection(e,a)}
                
                <div class="description-card">
                    <p class="description-text" data-text="${e.announcement||t.announcement||'The Prophet \u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064A\u0647 \u0648\u0633\u0644\u0645 said: "Prayer in congregation is twenty-seven times more rewarding than prayer prayed alone." \u2014 Sahih al-Bukhari 645, Sahih Muslim 650'}">
                        ${e.announcement||t.announcement||'The Prophet \u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064A\u0647 \u0648\u0633\u0644\u0645 said: "Prayer in congregation is twenty-seven times more rewarding than prayer prayed alone." \u2014 Sahih al-Bukhari 645, Sahih Muslim 650'}
                    </p>
                </div>
            </div>
        `}_renderPrayerTimes(e,t,a){let r=[{name:"Fajr",icon:""},{name:"Dhuhr",icon:""},{name:"Asr",icon:""},{name:"Maghrib",icon:""},{name:"Isha",icon:""}];return a.timeType===b.BOTH?`
                <div class="prayer-times-table">
                    <div class="prayer-header">
                        <div class="prayer-name-header">Prayer</div>
                        <div class="time-headers">
                            <div class="time-header">Athan</div>
                            <div class="time-header">Iqama</div>
                        </div>
                    </div>
                    ${r.map(s=>{let m=s.name.toLowerCase(),d=e[`${m}Athan`]||e[m]||"--:--",l=e[`${m}Iqama`]||"--:--";return`
                            <div class="prayer-row">
                                <div class="prayer-info">
                                    <span class="prayer-icon">${s.icon}</span>
                                    <span class="prayer-name">${s.name}</span>
                                </div>
                                <div class="prayer-times">
                                    <div class="time-value">${d}</div>
                                    <div class="time-value">${l}</div>
                                </div>
                            </div>
                        `}).join("")}
                </div>
            `:r.map(s=>{let m=s.name.toLowerCase(),d;return a.timeType===b.IQAMA?d=e[`${m}Iqama`]||"--:--":d=e[`${m}Athan`]||e[m]||"--:--",`
                    <div class="prayer-item">
                        <div class="prayer-info">
                            <span class="prayer-icon">${s.icon}</span>
                            <span class="prayer-name">${s.name}</span>
                        </div>
                        <span class="prayer-time">${d}</span>
                    </div>
                `}).join("")}_formatJumuahTime(e){if(!e||e.includes("--:--"))return e;let t=e.split(" - ");if(t.length===2){let a=t[0],r=t[1],n=r.includes("AM")?"AM":"PM";return`${a.replace(/\s*(AM|PM)/,"")}-${r}`}return e}_renderJumuahSection(e,t,a){if(t===0)return"";let r=[{name:t===1?"Jumuah Prayer":"1st Jumuah",time:e.jumuah1},{name:"2nd Jumuah",time:e.jumuah2},{name:"3rd Jumuah",time:e.jumuah3}].slice(0,t);return`
            <div style="margin-bottom: 20px;">
                <h3 style="
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: ${a};
                ">Jumuah Prayers</h3>
                
                <div class="jumuah-timeline">
                    ${r.map(n=>`
                        <div class="jumuah-slot">
                            <div class="jumuah-label">${n.name}</div>
                            <div class="jumuah-time">${this._formatJumuahTime(n.time)}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `}_renderAstronomicalSection(e,t){let a=e.sunrise||"--:--",r=e.maghribAthan||e.maghrib||"--:--";return`
            <div style="margin-bottom: 20px;">
                <h3 style="
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: ${t};
                ">Sun Times</h3>
                
                <div class="jumuah-timeline">
                    ${[{name:"Sunrise",time:a},{name:"Sunset",time:r}].map(s=>`
                        <div class="jumuah-slot">
                            <div class="jumuah-label">${s.name}</div>
                            <div class="jumuah-time">${s.time}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `}_getCardColors(e){let t=this._isDarkColor(e);return{background:t?"rgba(255, 255, 255, 0.05)":"rgba(0, 0, 0, 0.05)",backgroundActive:t?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)",border:t?"rgba(255, 255, 255, 0.1)":"#cccccc",borderActive:t?"rgba(255, 255, 255, 0.15)":"rgba(0, 0, 0, 0.3)"}}_getContrastingTextColor(e){let t=e.replace("#",""),a=parseInt(t.substr(0,2),16),r=parseInt(t.substr(2,2),16),n=parseInt(t.substr(4,2),16);return(a*299+r*587+n*114)/1e3<128?"#ffffff":"#000000"}_isDarkColor(e){let t=e.replace("#",""),a=parseInt(t.substr(0,2),16),r=parseInt(t.substr(2,2),16),n=parseInt(t.substr(4,2),16);return(a*299+r*587+n*114)/1e3<128}};var v=class{constructor(){this.config=null,this.dataFetcher=null,this.dataParser=null,this.validator=null,this.cacheManager=null,this.prayerManager=null,this.renderer=null,this.isInitialized=!1}initialize(){return p(this,null,function*(){i.info("Initializing widget manager");try{this.config=w(),N(this.config),this.dataFetcher=new C,this.dataParser=new S,this.validator=new D,this.cacheManager=new $(this.config.cacheDuration),this.renderer=new q,this.dataFetcher.setSheetId(this.config.googleSheetUrl),this.prayerManager=new P(this.dataFetcher,this.dataParser,this.validator,this.cacheManager),this.isInitialized=!0,i.success("Widget manager initialized successfully")}catch(e){throw i.error("Failed to initialize widget manager",e.message),e}})}createWidget(e=!1){return p(this,null,function*(){this.isInitialized||(yield this.initialize()),i.info("Creating widget",{forceRefresh:e});try{let t=yield this.prayerManager.getPrayerTimesForToday(e),a=this.renderer.renderWidget(t,this.config);this._injectWidget(a),this._setupAutoRefresh(),i.success("Widget created and injected successfully")}catch(t){i.error("Failed to create widget",t.message),this._injectErrorWidget(t.message)}})}_injectWidget(e){let t=document.getElementById("iqama-widget-container");if(t)i.info("Found existing widget container"),t.innerHTML=e;else{i.info("No container found, creating new widget");let a=document.createElement("div");a.innerHTML=e;let r=document.querySelectorAll('script[src*="iqama-widget-cloud.js"]');if(r.length>0){let n=r[r.length-1];n.parentNode.insertBefore(a.firstElementChild,n.nextSibling)}else document.body.appendChild(a.firstElementChild)}}_injectErrorWidget(e){let t=`
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
        `;this._injectWidget(t)}_setupAutoRefresh(){this.config.pollingInterval>0&&(i.info("Setting up auto-refresh",this.config.pollingInterval),setInterval(()=>p(this,null,function*(){try{i.info("Auto-refreshing widget data"),yield this.prayerManager.refreshData(),yield this.createWidget()}catch(e){i.error("Auto-refresh failed",e.message)}}),this.config.pollingInterval))}updateConfig(e){i.info("Updating widget configuration"),this.config=T(T({},this.config),e),N(this.config),e.googleSheetUrl&&e.googleSheetUrl!==this.dataFetcher.sheetId&&this.dataFetcher.setSheetId(e.googleSheetUrl)}};var y=null;function R(){i.info("Initializing Iqama Widget");try{y=new v,y.createWidget().then(()=>{i.success("Iqama Widget initialized successfully")}).catch(o=>{i.error("Failed to initialize widget",o.message)})}catch(o){i.error("Widget initialization failed",o.message)}}window.createWidget=function(o=!1){return p(this,null,function*(){return y?y.updateConfig(w()):y=new v,yield y.createWidget(o),y})};window.refreshWidget=function(){return p(this,null,function*(){i.info("Manual refresh requested"),y?yield y.createWidget(!0):yield window.createWidget(!0)})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R();return ee(ae);})();
