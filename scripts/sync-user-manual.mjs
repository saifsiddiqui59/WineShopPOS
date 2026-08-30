import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = resolve("docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md");
const target = resolve("public/manual/WineShopPOS_User_Manual.md");

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
console.log(`Synced canonical User Manual -> ${target}`);
