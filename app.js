// --- 1. 時間顯示邏輯 ---
function updateDateTime() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date').innerText = now.toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(updateDateTime, 1000);
updateDateTime();

    container.innerHTML = busListHtml;
}
updateAllBuses();
setInterval(updateAllBuses, 30000);
