import path from "path";
import { readdir, stat } from "fs/promises";

import { TreeItem } from "../types/index.ts";
import { IGNORE } from "../constants/index.ts";

export async function getTree(dirPath: string, currentPath = "") {
    let items: TreeItem[] = [];
    let ignored = [];

    const list = await readdir(dirPath);

    const promises = list.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const relativePath = path.join(currentPath, file);
        const stats = await stat(filePath);

        if (shouldIgnore(file)) return ignored.push(relativePath);

        if (stats.isDirectory()) {
            items.push({
                type: "directory",
                name: file,
                path: relativePath,
                fullPath: path.resolve(filePath),
                children: (await getTree(filePath, relativePath)).items,
            });
        } else {
            items.push({
                type: "file",
                name: file,
                path: relativePath,
                fullPath: path.resolve(filePath),
            });
        }
    });

    await Promise.all(promises);

    return { items, ignored };
}

function shouldIgnore(path: string): boolean {
    return IGNORE.some((pattern) => {
        const regexPattern = pattern
            .replace(/\./g, "\\.")
            .replace(/\*/g, ".*")
            .replace(/\/$/, "/.*");

        const regex = new RegExp(`^${regexPattern}$`);

        return regex.test(path);
    });
}
