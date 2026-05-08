const Groq = require("groq-sdk");
const fs = require("fs");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  const historyFile = "history.json";
  let history = fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile)) : [];

  const prompt = `You are a world-building engine. 
  Current History: ${JSON.stringify(history.slice(-3))}
  Generate a new event in a coordinates-based world (Map size 100x100).
  Output ONLY a JSON object like this:
  { "x": 45, "y": 62, "event": "Agent Kruthik discovered a glowing monolith.", "type": "discovery" }`;

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
    console.log("New world event added at:", newEvent.x, newEvent.y);
  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    process.exit(1);
  }
}
run();
