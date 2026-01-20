import { Glob } from "bun";
import path from "node:path";

const srcDir = path.join(import.meta.dir, "src");
const outputFile = path.join(import.meta.dir, "PRD_FULL.md");

const glob = new Glob("**/*.md");
const files = [];

for await (const file of glob.scan(srcDir)) {
  files.push(file);
}

// Ordenar: index.md primero, luego alfabético
files.sort((a, b) => {
  if (a === "index.md") return -1;
  if (b === "index.md") return 1;
  return a.localeCompare(b);
});

let output = "# PRD Completo\n\n";
output += `> Generado automáticamente el ${new Date().toLocaleDateString()}\n\n`;
output += "---\n\n";

for (const file of files) {
  const filePath = path.join(srcDir, file);
  const content = await Bun.file(filePath).text();

  output += `## ${file}\n\n`;
  output += content;
  output += "\n\n---\n\n";
}

await Bun.write(outputFile, output);

console.log(`PRD_FULL.md generado con ${files.length} archivos`);
