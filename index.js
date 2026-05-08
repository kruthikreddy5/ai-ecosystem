const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Switch to 'gemini-1.5-flash' - most reliable for free tier
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "A new era begins in the digital world. What is the first major event?";
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log("AI SAYS:", text);
    
    fs.appendFileSync("history.md", `\n\n[${new Date().toLocaleString()}] - ${text}`);
  } catch (err) {
    console.error("403 ERROR CHECK:", err.message);
    process.exit(1);
  }
}
run();
