const eventLayer =
document.getElementById("eventLayer");

function randomColor(type){

  switch(type){

    case "war":
      return "#ff4d4d";

    case "trade":
      return "#ffd166";

    case "science":
      return "#6bcBff";

    default:
      return "#c77dff";

  }

}

async function loadWorld(){

  const world =
  await fetch(
    "./world.json?t=" + Date.now()
  ).then(r=>r.json());

  document.getElementById(
    "stability"
  ).innerText =
  world.stability + "%";

  document.getElementById(
    "economy"
  ).innerText =
  world.economy + "%";

  document.getElementById(
    "era"
  ).innerText =
  world.era;

  document.getElementById(
    "cycle"
  ).innerText =
  world.cycle;

}

async function loadEvents(){

  const data =
  await fetch(
    "./history.json?t=" + Date.now()
  ).then(r=>r.json());

  const feed =
  document.getElementById("eventFeed");

  feed.innerHTML = "";

  eventLayer.innerHTML = "";

  data.reverse().forEach(item=>{

    const div =
    document.createElement("div");

    div.className =
    "feed-item";

    div.innerHTML = `
      <b>${item.type}</b>
      <p>${item.event}</p>
      <small>${item.timestamp}</small>
    `;

    feed.appendChild(div);

    const dot =
    document.createElement("div");

    dot.className =
    "event-dot";

    dot.style.background =
    randomColor(item.type);

    dot.style.left =
    item.x + "%";

    dot.style.top =
    item.y + "%";

    eventLayer.appendChild(dot);

  });

}

async function loadThoughts(){

  const thoughts =
  await fetch(
    "./thoughts.json?t=" + Date.now()
  ).then(r=>r.json());

  const feed =
  document.getElementById(
    "thoughtFeed"
  );

  feed.innerHTML = "";

  thoughts.reverse().forEach(t=>{

    const div =
    document.createElement("div");

    div.className =
    "feed-item";

    div.innerHTML = `
      <p>${t.text}</p>
      <small>${t.mood}</small>
    `;

    feed.appendChild(div);

  });

}

function setMode(mode){

  document.body.style.background = {

    political:"#081018",
    war:"#180808",
    economy:"#081810",
    social:"#120818"

  }[mode];

}

function updateClock(){

  const now =
  new Date();

  document.getElementById(
    "clock"
  ).innerText =
  now.toLocaleTimeString();

}

async function init(){

  await loadWorld();

  await loadEvents();

  await loadThoughts();

}

init();

setInterval(init,15000);

setInterval(updateClock,1000);
