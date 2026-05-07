import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const assetsDir = join(distDir, "assets");
const statsHtmlPath = join(distDir, "stats.html");

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "n/a";
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function pad(value, width) {
  return String(value).padEnd(width, " ");
}

function toRow(chunkName, rawBytes, gzipBytes) {
  return {
    name: chunkName,
    rawBytes,
    gzipBytes,
  };
}

function printTable(rows) {
  const nameWidth = Math.max(
    "chunk".length,
    ...rows.map((row) => row.name.length),
    "TOTAL".length,
  );
  const rawWidth = Math.max(
    "raw".length,
    ...rows.map((row) => formatBytes(row.rawBytes).length),
    formatBytes(rows.reduce((sum, row) => sum + row.rawBytes, 0)).length,
  );
  const gzipWidth = Math.max(
    "gzip".length,
    ...rows.map((row) => formatBytes(row.gzipBytes).length),
    formatBytes(rows.reduce((sum, row) => sum + row.gzipBytes, 0)).length,
  );

  const separator = `${"-".repeat(nameWidth)}  ${"-".repeat(rawWidth)}  ${"-".repeat(gzipWidth)}`;
  console.log(`${pad("chunk", nameWidth)}  ${pad("raw", rawWidth)}  ${pad("gzip", gzipWidth)}`);
  console.log(separator);

  for (const row of rows) {
    console.log(
      `${pad(row.name, nameWidth)}  ${pad(formatBytes(row.rawBytes), rawWidth)}  ${pad(formatBytes(row.gzipBytes), gzipWidth)}`,
    );
  }

  const totalRaw = rows.reduce((sum, row) => sum + row.rawBytes, 0);
  const totalGzip = rows.reduce((sum, row) => sum + row.gzipBytes, 0);
  console.log(separator);
  console.log(
    `${pad("TOTAL", nameWidth)}  ${pad(formatBytes(totalRaw), rawWidth)}  ${pad(formatBytes(totalGzip), gzipWidth)}`,
  );
}

function readChunkRows() {
  if (!existsSync(assetsDir)) {
    console.warn(`[bundle-report] Директория не найдена: ${assetsDir}`);
    return [];
  }

  const files = readdirSync(assetsDir)
    .filter((name) => name.endsWith(".js") || name.endsWith(".css"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((name) => {
    const filePath = join(assetsDir, name);
    const rawBytes = statSync(filePath).size;
    const gzipBytes = gzipSync(readFileSync(filePath)).length;
    return toRow(name, rawBytes, gzipBytes);
  });
}

function main() {
  const rows = readChunkRows();

  if (!rows.length) {
    console.log("[bundle-report] Чанки *.js/*.css в dist/assets не найдены.");
    console.log("[bundle-report] Завершено в информационном режиме (без CI gate).");
    return;
  }

  console.log("[bundle-report] Размер production чанков (raw/gzip):");
  printTable(rows);
  console.log(
    `[bundle-report] visualizer: ${existsSync(statsHtmlPath) ? "создан" : "не найден"} (${statsHtmlPath})`,
  );
  console.log("[bundle-report] Информационный режим: превышение размера не блокирует CI.");
}

try {
  main();
} catch (error) {
  console.error(`[bundle-report] Не удалось сформировать отчёт: ${String(error)}`);
  console.log("[bundle-report] Информационный режим: pipeline должен оставаться зелёным.");
}
