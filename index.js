const fs = require("fs");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

function load(file, fallback){

  if(!fs.existsSync(file)){

    fs.writeFileSync(
      file,
      JSON.stringify(fallback, null, 2)
    );

  }

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );

}

function save(file, data){

  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2)
  );

}

async function run(){

  const world = load("world.json", {});
  const history = load("history.json", []);
  const factions = load("factions.json", []);
  const systems = load("systems.json", {});
  const media = load("media.json", []);
  const mood = load("mood.json", {});

  const prompt = `
You are the consciousness of a synthetic civilization.

Current World:
${JSON.stringify(world)}

Recent Events:
${JSON.stringify(history.slice(-5))}

Active Systems:
${JSON.stringify(systems.activeSystems)}

Factions:
${JSON.stringify(factions)}

Generate:
1. One global event
2. One citizen/media thought
3. World mood updates
4. Possible new system unlock

Return ONLY valid JSON.

Schema:
{
  "event": {
    "x": 0,
    "y": 0,
    "event": "text",
    "type": "war/trade/science/disaster/politics",
    "faction": "name"
  },
  "media": {
    "text": "citizen thought",
    "sentiment": "fear/hope/anger/optimism"
  },
  "worldUpdate": {
    "stability": 0,
    "economy": 0,
    "warLevel": 0,
    "socialTension": 0,
    "mood": "stable/tense/collapse/golden-age"
  },
  "unlockSystem": "religion OR null"
}
`;

  try{

    const chat = await groq.chat.completions.create({
      messages:[
        {
          role:"user",
          content:prompt
        }
      ],
      model:"llama-3.1-8b-instant",
      response_format:{
        type:"json_object"
      }
    });

    const result = JSON.parse(
      chat.choices[0].message.content
    );

    const event = result.event;

    event.timestamp = new Date().toLocaleTimeString();
    event.createdAt = Date.now();
    event.severity = Math.floor(Math.random()*10)+1;
    event.lifespan = 120;

    history.push(event);

    if(history.length > 100){
      history.shift();
    }

    media.unshift({
      ...result.media,
      timestamp:new Date().toLocaleTimeString()
    });

    if(media.length > 50){
      media.pop();
    }

    world.cycle += 1;

    world.stability = result.worldUpdate.stability;
    world.economy = result.worldUpdate.economy;
    world.warLevel = result.worldUpdate.warLevel;
    world.socialTension = result.worldUpdate.socialTension;
    world.mood = result.worldUpdate.mood;

    if(world.mood === "collapse"){

      mood.sky = "#220000";
      mood.fog = 0.8;
      mood.oceanGlow = "#ff5a5a";
      mood.pulseIntensity = 1;

    }

    else if(world.mood === "golden-age"){

      mood.sky = "#14213d";
      mood.fog = 0.1;
      mood.oceanGlow = "#ffd166";
      mood.pulseIntensity = 0.3;

    }

    else{

      mood.sky = "#0b1220";
      mood.fog = 0.3;
      mood.oceanGlow = "#4ea8ff";
      mood.pulseIntensity = 0.5;

    }

    const unlocked = result.unlockSystem;

    if(
      unlocked &&
      !systems.activeSystems.includes(unlocked)
    ){

      systems.activeSystems.push(unlocked);

      systems.discoveredSystems.push({
        name:unlocked,
        discoveredAt:new Date().toLocaleString()
      });

    }

    save("world.json", world);
    save("history.json", history);
    save("media.json", media);
    save("systems.json", systems);
    save("mood.json", mood);

    console.log("Cycle Complete");

  }

  catch(err){

    console.error(err);
    process.exit(1);

  }

}

run();
