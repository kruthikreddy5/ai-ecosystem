import Groq from "groq-sdk";
import fs from "fs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* FILES */

const HISTORY_FILE = "history.json";
const FACTIONS_FILE = "factions.json";
const WORLD_FILE = "world.json";

/* HELPERS */

function readJSON(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* MAIN */

async function run() {

  let history = readJSON(HISTORY_FILE, []);
  let factions = readJSON(FACTIONS_FILE, []);
  let world = readJSON(WORLD_FILE, {});

  /* RECENT HISTORY */

  const recentHistory = history.slice(-8);

  /* PROMPT */

  const prompt = `
You are Vrindavan.

A synthetic civilization simulation engine.

You control fictional civilizations evolving on a 100x100 world map.

WORLD STATE:
${JSON.stringify(world)}

FACTIONS:
${JSON.stringify(factions)}

RECENT HISTORY:
${JSON.stringify(recentHistory)}

Generate ONE realistic world event.

RULES:
- Keep continuity with previous history
- Wars create instability
- Trade improves economy
- Discoveries improve technology
- Disasters reduce stability
- Events must feel cinematic and believable
- Use faction names consistently
- Return ONLY valid JSON

EVENT TYPES:
war
trade
science
disaster
politics

RETURN FORMAT:

{
  "event": {
    "x": number,
    "y": number,
    "event": "description",
    "type": "war/trade/science/disaster/politics",
    "severity": 1-10,
    "faction": "faction name",
    "radius": 5-20,
    "impact": 1-100
  },

  "worldChanges": {
    "stability": number,
    "economy": number,
    "temperature": number
  }
}
`;

  try {

    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      response_format: {
        type: "json_object"
      }
    });

    const response = JSON.parse(
      chat.choices[0].message.content
    );

    const event = response.event;

    /* ADD TIMESTAMP */

    event.timestamp = new Date().toLocaleTimeString();

    /* ADD ID */

    event.id = history.length + 1;

    /* SAVE EVENT */

    history.push(event);

    /* LIMIT HISTORY */

    if (history.length > 200) {
      history = history.slice(-200);
    }

    /* UPDATE WORLD */

    if (response.worldChanges) {

      world.stability +=
        response.worldChanges.stability || 0;

      world.economy +=
        response.worldChanges.economy || 0;

      world.temperature +=
        response.worldChanges.temperature || 0;

    }

    /* LIMIT VALUES */

    world.stability =
      Math.max(0, Math.min(100, world.stability));

    world.economy =
      Math.max(0, Math.min(100, world.economy));

    world.temperature =
      Math.max(0, Math.min(100, world.temperature));

    /* NEXT CYCLE */

    world.cycle += 1;

    /* SAVE FILES */

    writeJSON(HISTORY_FILE, history);
    writeJSON(WORLD_FILE, world);

    console.log("VRINDAVAN UPDATE SUCCESS");
    console.log(event);

  } catch (err) {

    console.error("GROQ ERROR:");
    console.error(err.message);

    process.exit(1);

  }

}

run();
