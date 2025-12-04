"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key present:", !!apiKey);
console.log("API Key length:", apiKey?.length);
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateImage(formData: FormData) {
  const image = formData.get("image") as File;
  const prompt = formData.get("prompt") as string;

  if (!image || !prompt) {
    throw new Error("Missing required fields");
  }

  try {
    // Convert File to Base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Use the user-specified model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    console.log(`Calling Gemini with prompt: ${prompt}`);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    // Check if the response has an image
    // Note: The structure for image output might vary.
    // We check for inlineData in the parts.
    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((part: any) => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const generatedBase64 = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/png";
      return {
        success: true,
        imageUrl: `data:${mimeType};base64,${generatedBase64}`,
      };
    }

    // If no image found, maybe it returned text?
    const textPart = response.text();
    if (textPart) {
      console.warn("Gemini returned text instead of image:", textPart);
      // If it returns text, it might be an error or description.
      // For now, throw an error so we don't show a random image.
      throw new Error(
        "Gemini returned text instead of an image: " +
          textPart.substring(0, 100)
      );
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { success: false, error: "Failed to generate image" };
  }
}
