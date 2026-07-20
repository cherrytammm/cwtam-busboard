// --- 1. 時間顯示邏輯 ---
function updateDateTime() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date').innerText = now.toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(updateDateTime, 1000);
updateDateTime();

// --- 2. 巴士設定 ---
const busLines = [
    { route: '211', stopId: '73829A47B6E78E5B' },
    { route: '1',   stopId: '9ED7E93749ABAE67' },
    { route: '11K', stopId: '9ED7E93749ABAE67' },
    { route: '89B', stopId: 'FDA52ED538BDD5E4' },
];

// --- 3. 天氣與警告邏輯 ---
async function updateWeather() {
    try {
        const response = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc');
        const data = await response.json();
        const warnResponse = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc');
        const warnData = await warnResponse.json();

        const tempInfo = data.temperature.data.find(item => item.place === '黃大仙');
        if (tempInfo) document.getElementById('weather').innerText = `${tempInfo.value}°C`;
        
        const iconElement = document.getElementById('weather-icon');
        if (iconElement && data.icon && data.icon.length > 0) {
            iconElement.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/Outline_wxicon_pic${data.icon[0]}.png`;
        }

        const warningIconMap = {
            "WRAIN": "images/wrain.png",
            "WRAINA": "images/wrain.png",
            "WRAINR": "images/wredrain.png",
            "WRAINB": "images/wblackrain.png",
            "WTS": "images/wts.png", 
            "WHOT": "images/whot.png",
            "W1": "images/w1.png",
            "W3": "images/w3.png", 
            "W8NW": "images/w8nw.png",
            "W8NE": "images/w8ne.png",
            "W8SW": "images/w8sw.png", 
            "W8SE": "images/w8se.png",
            "W9": "images/w9.png", 
            "W10": "images/w10.png", 
            "WCOLD": "images/wcold.png",
            "WFIREY": "images/wfirey.png", 
            "WFIRER": "images/wfire.png", 
            "WMSGNL": "images/wvy.png",
            "WFROST": "images/wfrost.png", 
            "WL": "images/wls.png",
            "WFNTSA": "images/wfntsa.png"
        };

        const activeWarnings = Object.keys(warnData).filter(key => warnData[key].actionCode !== 'CANCEL');
        const warningElement = document.getElementById('weather-warning');
        const iconContainer = document.getElementById('warning-icons-container');

        if (activeWarnings.length > 0) {

            warningElement.style.display = 'block';
            warningElement.style.marginTop = '10px';
            warningElement.innerText = activeWarnings.map(key => warnData[key].warningStatement).join('');
            if (iconContainer) {
                iconContainer.innerHTML = '';
                activeWarnings.forEach(key => {
                    let finalCode = key;
                    const warningObj = warnData[key];

                    // --- 核心修改：處理暴雨代碼邏輯 ---
                    if (key === 'WRAIN') {
                        finalCode = warningObj.code; // 直接使用 API 提供的 WRAINA, WRAINR, WRAINB
                    } 
                    // --- 處理颱風風向邏輯 ---
                    else if (key === 'W8') {
                        const statement = warningObj.warningStatement;
                        if (statement.includes('西北')) finalCode = 'W8NW';
                        else if (statement.includes('東北')) finalCode = 'W8NE';
                        else if (statement.includes('西南')) finalCode = 'W8SW';
                        else if (statement.includes('東南')) finalCode = 'W8SE';
                    }

                    // 渲染邏輯
                    if (warningIconMap[finalCode]) {
                        const img = document.createElement('img');
                        img.src = warningIconMap[finalCode];
                        img.style.width = "80px";
                        img.style.margin = "5px";
                        iconContainer.appendChild(img);
                    } else {
                        const span = document.createElement('span');
                        span.innerText = `[${finalCode}]`; // 如果對不上，這裡會顯示 [WRAINR] 等，方便你偵錯
                        span.style.margin = "5px";
                        span.style.color = "red";
                        span.style.fontWeight = "bold";
                        iconContainer.appendChild(span);
                    }
                });
            }
        } else {
            warningElement.style.cssText = "display: none !important; margin: 0; padding: 0; height: 0; overflow: hidden;";
            warningElement.innerText = "";
            if (iconContainer) iconContainer.innerHTML = '';
        }
    } catch (error) { console.error("抓取天氣失敗:", error); }
}
updateWeather();
setInterval(updateWeather, 600000);

// --- 4. 巴士更新邏輯 ---
async function updateAllBuses() {
    const container = document.getElementById('bus-list');
    let busListHtml = '<h2>今日搭咩車？</h2>';
    for (let bus of busLines) {
        try {
            const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${bus.stopId}/${bus.route}/1`);
            const jsonData = await response.json();
            const etaList = jsonData.data;
            busListHtml += `<div class="bus-group"><h3>路線：${bus.route}</h3>`;
            if (etaList.length === 0) busListHtml += `<p>目前無班次</p>`;
            else {
                etaList.slice(0, 2).forEach((b, index) => {
                    const diffMins = Math.max(0, Math.round((new Date(b.eta) - new Date()) / 60000));
                    busListHtml += `<div class="bus-item"><span class="bus-route">第 ${index + 1} 班</span><span class="bus-time">${diffMins} 分鐘</span></div>`;
                });
            }
            busListHtml += `</div>`;
        } catch (error) { console.error(`查詢 ${bus.route} 失敗:`, error); }
    }
    container.innerHTML = busListHtml;
}
updateAllBuses();
setInterval(updateAllBuses, 30000);
