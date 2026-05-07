import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const assetsDir = join(process.cwd(), "dist", "assets");
// Smoke-проверка, что Tailwind отработал и сгенерировал utility-классы.
// Порог откалиброван по реально нужным классам исходников после очистки
// устаревших записей из dist/, которые ранее ошибочно попадали в content-scan.
const minCssSizeBytes = 22 * 1024;
const markerClasses = [".bg-surface", ".text-muted", ".px-3"];

function fail(message) {
  console.error(`[check-css-size] ${message}`);
  process.exit(1);
}

let cssFiles;
try {
  cssFiles = readdirSync(assetsDir).filter((name) => /^index-.*\.css$/.test(name));
} catch (error) {
  fail(`Не удалось прочитать директорию ${assetsDir}: ${String(error)}`);
}

if (!cssFiles.length) {
  fail(`Файл dist/assets/index-*.css не найден в ${assetsDir}`);
}

const cssFileName = cssFiles[0];
const cssFilePath = join(assetsDir, cssFileName);
const cssStats = statSync(cssFilePath);

if (cssStats.size < minCssSizeBytes) {
  fail(
    `Размер ${cssFileName} слишком маленький (${cssStats.size} B). Ожидается >= ${minCssSizeBytes} B.`,
  );
}

const bundle = readFileSync(cssFilePath, "utf8");

if (!markerClasses.some((cls) => bundle.includes(cls))) {
  fail(
    `В ${cssFileName} не найдены контрольные классы (${markerClasses.join(", ")}). Проверьте генерацию utilities.`,
  );
}

console.log(
  `[check-css-size] OK: ${cssFileName}, size=${cssStats.size} B, найден один из классов: ${markerClasses.join(", ")}`,
);
