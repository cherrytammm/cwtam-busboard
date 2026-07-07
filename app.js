function updateDateTime() {
    const now = new Date();
    
    // 顯示時間 (HH:MM)
    const timeStr = now.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').innerText = timeStr;
    
    // 顯示日期 (YYYY年MM月DD日)
    const dateStr = now.toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('date').innerText = dateStr;
}

// 每秒更新一次時間
setInterval(updateDateTime, 1000);
updateDateTime();

// 1. 定義你想監控的所有路線與車站 (這裡可以無限增加)
const busLines = [
    { route: '211', stopId: '73829A47B6E78E5B' },
    { route: '1',   stopId: '9ED7E93749ABAE67' },
    { route: '11K', stopId: '9ED7E93749ABAE67' },
    { route: '89B', stopId: 'FDA52ED538BDD5E4' },
];

async function updateWeather() {
    try {
        // 1. 抓取天氣資料
        const response = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc');
        const data = await response.json();

        // 2. 處理溫度 (確保你的 HTML 有 <div id="weather"></div>)
        const tempInfo = data.temperature.data.find(item => item.place === '黃大仙');
        if (tempInfo) {
            document.getElementById('weather').innerText = `${tempInfo.value}°C`;
        }

        // 3. 處理圖示 (確保你的 HTML 有 <img id="weather-icon">)
        if (data.icon && data.icon.length > 0) {
            const iconNumber = data.icon[0];
            console.log("抓取到的圖示編號為:", iconNumber); // <--- 加入這行看 Console
            
            const iconElement = document.getElementById('weather-icon');
            
            if (iconElement) {
                // 根據你剛剛在網頁檢查到的新路徑格式進行調整
                // 假設圖示編號是 62，路徑應該是 .../wxicon_pic62.png
                iconElement.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/Outline_wxicon_pic${iconNumber}.png`;
            } else {
                console.warn("找不到 ID 為 weather-icon 的圖片標籤");
            }
        }
    } catch (error) {
        console.error("抓取失敗:", error);
    }
}


// 呼叫它
updateWeather();
// 天氣不用每秒更新，每 10 分鐘更新一次即可
setInterval(updateWeather, 600000);

async function updateWeather() {
    try {
        // 1. 抓取主要天氣資料
        const response = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc');
        const data = await response.json();

        // 2. 更新溫度
        const tempInfo = data.temperature.data.find(item => item.place === '黃大仙');
        if (tempInfo) document.getElementById('weather').innerText = `${tempInfo.value}°C`;
        
        // 更新天氣主圖示
        const iconElement = document.getElementById('weather-icon');
        if (iconElement && data.icon.length > 0) {
            iconElement.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/Outline_wxicon_pic${data.icon[0]}.png`;
        }

        // 3. 抓取警告資訊 (僅保留文字)
        const warnResponse = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc');
        const warnData = await warnResponse.json();
        
        const warningElement = document.getElementById('weather-warning');
        
        // 篩選所有目前生效 (ISSUE) 的警告
        const activeWarnings = Object.keys(warnData).filter(key => warnData[key].actionCode === 'ISSUE');
        
        if (activeWarnings.length > 0) {
            // 顯示文字
            warningElement.innerText = activeWarnings.map(key => warnData[key].warningStatement).join('、');
        } else {
            // 沒有警告時清空
            warningElement.innerText = ""; 
        }

    } catch (error) {
        console.error("抓取天氣失敗:", error);
    }
}
async function updateAllBuses() {
    const container = document.getElementById('bus-list');
    let busListHtml = '<h2>今日搭咩車？</h2>'; // 重新整理清單

    for (let bus of busLines) {
        try {
            const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${bus.stopId}/${bus.route}/1`);
            const jsonData = await response.json();
            const etaList = jsonData.data;

            // 這裡將每一條路線的 HTML 組合起來，而不是用 h3/p 亂塞
            busListHtml += `<div class="bus-group"><h3>路線：${bus.route}</h3>`;

            if (etaList.length === 0) {
                busListHtml += `<p>目前無班次</p>`;
            } else {
                const nextBuses = etaList.slice(0, 2);
                nextBuses.forEach((b, index) => {
                    const diffMins = Math.max(0, Math.round((new Date(b.eta) - new Date()) / 60000));
                    // 這裡使用你想要的 span 結構，方便 CSS 控制顏色
                    busListHtml += `
                        <div class="bus-item">
                            <span class="bus-route">第 ${index + 1} 班</span>
                            <span class="bus-time">${diffMins} 分鐘</span>
                        </div>
                    `;
                });
            }
            busListHtml += `</div>`; // 結束 bus-group

        } catch (error) {
            console.error(`查詢 ${bus.route} 失敗:`, error);
        }
    }
    
    // 一次性寫入 DOM，效能最好
    container.innerHTML = busListHtml;
}

// 執行與定時刷新
updateAllBuses();
setInterval(updateAllBuses, 20000); // 每 30 秒更新所有路線
