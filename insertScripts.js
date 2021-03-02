const head = document.getElementsByTagName('head')[0];

const link = document.createElement('link');
link.rel  = 'stylesheet';
link.type = 'text/css';
link.href = `https://cdn.jsdelivr.net/gh/jeffreychan637/PE-2021-Sin-Room@main/webflow-sin-room.css?version=${Math.random()}`;
head.appendChild(script);

const script = document.createElement('script');
script.type = 'text/javascript';
script.src = `https://cdn.jsdelivr.net/gh/jeffreychan637/PE-2021-Sin-Room@main/webflow-sin-room.js?version=${Math.random()}`;
head.appendChild(script);