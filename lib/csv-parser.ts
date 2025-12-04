import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { StyleCategory } from "./types";

export async function getStyleCategories(): Promise<StyleCategory[]> {
  const filePath = path.join(process.cwd(), "data", "gallery.tsv");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const parsed = Papa.parse<string[]>(fileContent, {
    delimiter: "\t",
    header: false,
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  if (rows.length === 0) return [];

  const headers = rows[0]; // Categories
  const categories: StyleCategory[] = headers.map((header, index) => ({
    id: header.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: header,
    prompts: [],
  }));

  // Iterate rows starting from 1
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    row.forEach((prompt, index) => {
      if (prompt && prompt.trim() !== "" && categories[index]) {
        categories[index].prompts.push(prompt.trim());
      }
    });
  }

  return categories;
}
