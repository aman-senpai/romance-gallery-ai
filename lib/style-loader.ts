import fs from "fs";
import path from "path";
import { StyleCategory } from "./types";

export async function getStyleCategories(): Promise<StyleCategory[]> {
  const filePath = path.join(process.cwd(), "data", "styles.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  try {
    const styles: StyleCategory[] = JSON.parse(fileContent);
    return styles;
  } catch (error) {
    console.error("Error parsing styles.json:", error);
    return [];
  }
}
