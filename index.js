const Groq = require("groq-sdk");
const fs = require("fs");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  const historyFile = "history.json";
  // Create file if it doesn't exist
  if (!fs.existsSync(historyFile)) fs.writeFileSync(historyFile, "[]");
  
  let history = JSON.parse(fs.readFileSync(historyFile, "utf8"));

  const prompt = `You are a world-building engine. 
  Recent History: ${JSON.stringify(history.slice(-5))}
  Generate ONE new event on a 100x100 grid.
  Return ONLY a JSON object: {"x": 0-100, "y": 0-100, "event": "one sentence", "type": "war/peace/discovery/tech"}`;

  try {
    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const newEvent = JSON.parse(chat.choices[0].message.content);
    newEvent.timestamp = new Date().toLocaleTimeString();
    history.push(newEvent);

    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    console.log("SUCCESS: Added event at", newEvent.x, newEvent.y);
  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    process.exit(1);
  }
}
run();
