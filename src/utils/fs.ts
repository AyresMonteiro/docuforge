import fs from "node:fs";

export function createFolderIfNotExists(folderPath: string) {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
}
