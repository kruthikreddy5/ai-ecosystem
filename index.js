const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 1. Read what happened before
  let history = "";
  if (fs.existsSync("history.md")) {
    history = fs.readFileSync("history.md", "utf8");
  } else {
    history = "# World History\nThe world was created.\n";
  }

  // 2. Ask the AI to continue the story
  const prompt = `This is a log of a digital world:
  ${history.split('\n').slice(-10).join('\n')}
  
  You are the world itself. One more event happens. 
  The AI agents are developing and building on their own.
  What is the next single event? (Write only one sentence).`;

  try {
    const result = await model.generateContent(prompt);
    const newEvent = result.response.text().trim();
    
    // 3. Save the new event
    const timestamp = new Date().toLocaleString();
    fs.appendFileSync("history.md", `\n* **[${timestamp}]**: ${newEvent}`);
    console.log("New event added: " + newEvent);
  } catch (error) {
    console.error("AI Error:", error);
  }
}

run();
