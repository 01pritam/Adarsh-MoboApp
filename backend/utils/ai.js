// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { traceable } from "langsmith/traceable";
// import dotenv from "dotenv";

// dotenv.config();

// const chat = async (message) => {

//   const llm = new ChatGoogleGenerativeAI({
//     model: "gemini-2.0-flash",
//   });

//   const reply = await llm.invoke(message);
//   return reply.content
// };

// export const tracedChatTool = traceable(chat, {
//   name: "chat",
//   run_type: "tool",
// });

// export default tracedChatTool;




import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { traceable } from "langsmith/traceable";
import dotenv from "dotenv";

dotenv.config();

const chat = async (message) => {
  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      temperature: 0.1, // Lower temperature for more consistent JSON output
    });

    // ✅ Enhanced prompt to ensure clean JSON output
    const enhancedPrompt = `${message}

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not use \`\`\`json or \`\`\` tags. Return raw JSON only.

Example of correct format:
{"urgency": "normal", "taskDetected": true, "taskType": "food_order", "title": "Food order request"}`;

    console.log('🧠 Sending to Gemini:', enhancedPrompt);
    
    const reply = await llm.invoke(enhancedPrompt);
    let content = reply.content;
    
    console.log('🧠 Raw Gemini response:', content);
    
    // ✅ Clean the response to remove any markdown formatting
    content = content
      .replace(/```json/g, '')    // Remove ```json
      .replace(/```/g, '')        // Remove ```
      .replace(/`/g, '')          // Remove single backticks
      .trim();                    // Remove whitespace
    console.log('🧠 Cleaned response:', content);
    
    // ✅ Validate that it's valid JSON
    try {
      JSON.parse(content);
      return content;
    } catch (parseError) {
      console.error('💥 JSON validation failed:', parseError);
      console.error('💥 Content that failed:', content);
      
      // ✅ Extract JSON from text if it's embedded
      const jsonMatch = content.match(/\{[^}]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0];
        console.log('🔧 Extracted JSON:', extractedJson);
        JSON.parse(extractedJson); // Validate
        return extractedJson;
      }
      
      throw new Error('Could not extract valid JSON from response');
    }
    
  } catch (error) {
    console.error('💥 Gemini API error:', error);
    throw error;
  }
};

export const tracedChatTool = traceable(chat, {
  name: "chat",
  run_type: "tool",
});

export default tracedChatTool;
