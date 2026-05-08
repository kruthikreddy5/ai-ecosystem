const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let history = fs.existsSync("history.md") ? fs.readFileSync("history.md", "utf8") : "# AI World History\n";

    const prompt = `You are a digital god overseeing a simulation. 
    Current History: ${history}
    Write ONE new sentence describing a dramatic event or discovery made by the AI agents. 
    Be specific. Start with a timestamp like [${new Date().toLocaleTimeString()}].`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log("AI GENERATED CONTENT:", text); // This will show in your GitHub Logs

    fs.appendFileSync("history.md", "\n\n" + text);
    console.log("File updated successfully.");
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    process.exit(1); // Force GitHub to show a Red X if it fails
  }
}

run();
