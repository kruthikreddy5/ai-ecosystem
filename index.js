// ===============================
// VRINDAVAN WORLD ENGINE
// REPLACE ENTIRE index.js
// ===============================

const Groq = require("groq-sdk");
const fs = require("fs");

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
    fs.writeFileSync(
      file,
      JSON.stringify(fallback, null, 2)
    );

    return fallback;
  }

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );

}

function writeJSON(file, data) {

  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2)
  );

}

/* LOAD DATA */

let history = readJSON(HISTORY_FILE, []);

let factions = readJSON(FACTIONS_FILE, [
  {
    name: "Helios Directorate",
    color: "#ff5a5a",
    aggression: 8,
    technology: 7,
    wealth: 6,
    x: 20,
    y: 40
  },
  {
    name: "Northern Accord",
    color: "#7dd3fc",
    aggression: 5,
    technology: 6,
    wealth: 7,
    x: 70,
    y: 35
  },
  {
    name: "Sol Union",
    color: "#ffd166",
    aggression: 3,
    technology: 9,
    wealth: 9,
    x: 50,
    y: 75
  }
]);

let world = readJSON(WORLD_FILE, {
  cycle: 1,
  stability: 72,
  economy: 68,
  temperature: 43,
  population: 8120000000,
  era: "Age of Emergence"
});

/* MAIN */

async function run() {

  const recentHistory =
    history.slice(-10);

  /* PROMPT */

  const prompt = `
You are Vrindavan.

An advanced civilization simulation AI.

You simulate fictional civilizations
evolving on a 100x100 synthetic planet.

WORLD:
${JSON.stringify(world)}

FACTIONS:
${JSON.stringify(factions)}

RECENT HISTORY:
${JSON.stringify(recentHistory)}

Generate ONE believable event that evolves the world logically.

RULES:
- Wars reduce stability
- Trade improves economy
- Science improves technology
- Disasters damage stability
- Politics shifts alliances
- Maintain continuity
- Use cinematic language
- Keep faction consistency
- Make the world feel alive
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
    "x": 0,
    "y": 0,
    "event": "event text",
    "type": "war",
    "severity": 1,
    "faction": "faction",
    "radius": 10,
    "impact": 50,
    "lifespan": 120
  },

  "worldChanges": {
    "stability": -3,
    "economy": 2,
    "temperature": 0
  },

  "factionChanges": {
    "faction": "Helios Directorate",
    "aggression": 1,
    "wealth": 0,
    "technology": 0
  }
}
`;

  try {

    const chat =
      await groq.chat.completions.create({

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

    const response =
      JSON.parse(
        chat.choices[0].message.content
      );

    const event = response.event;

    /* TIMESTAMP */

    event.timestamp =
      new Date().toLocaleTimeString();

    event.createdAt = Date.now();

    event.id = history.length + 1;

    /* SAVE EVENT */

    history.push(event);

    /* LIMIT HISTORY */

    if (history.length > 250) {

      history =
        history.slice(-250);

    }

    /* WORLD CHANGES */

    if (response.worldChanges) {

      world.stability +=
        response.worldChanges.stability || 0;

      world.economy +=
        response.worldChanges.economy || 0;

      world.temperature +=
        response.worldChanges.temperature || 0;

    }

    /* LIMIT WORLD VALUES */

    world.stability =
      Math.max(
        0,
        Math.min(100, world.stability)
      );

    world.economy =
      Math.max(
        0,
        Math.min(100, world.economy)
      );

    world.temperature =
      Math.max(
        0,
        Math.min(100, world.temperature)
      );

    /* UPDATE FACTIONS */

    if (response.factionChanges) {

      const target =
        factions.find(
          f =>
            f.name ===
            response.factionChanges.faction
        );

      if (target) {

        target.aggression +=
          response.factionChanges.aggression || 0;

        target.wealth +=
          response.factionChanges.wealth || 0;

        target.technology +=
          response.factionChanges.technology || 0;

      }

    }

    /* LIMIT FACTIONS */

    factions.forEach(f => {

      f.aggression =
        Math.max(0,
        Math.min(10, f.aggression));

      f.wealth =
        Math.max(0,
        Math.min(10, f.wealth));

      f.technology =
        Math.max(0,
        Math.min(10, f.technology));

    });

    /* ERAS */

    if (world.cycle > 50) {
      world.era = "Age of Expansion";
    }

    if (world.cycle > 120) {
      world.era = "Conflict Era";
    }

    if (world.cycle > 220) {
      world.era = "Synthetic Awakening";
    }

    /* NEXT CYCLE */

    world.cycle += 1;

    /* SAVE */

    writeJSON(HISTORY_FILE, history);

    writeJSON(WORLD_FILE, world);

    writeJSON(FACTIONS_FILE, factions);

    console.log("VRINDAVAN UPDATED");
    console.log(event);

  }

  catch(err){

    console.error(err.message);

    process.exit(1);

  }

}

run();
