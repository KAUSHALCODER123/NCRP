import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards against a bug that has bitten this project three times.
 *
 * Writing a regex through a shell heredoc turns a backslash-b into a literal
 * backspace (0x08). The file still compiles, the pattern still looks correct
 * in an editor, and the regex silently never matches — which disabled the
 * off-topic filter and then the leaked-reasoning filter without an error
 * anywhere. Source files should contain no control characters at all.
 *
 * Checked by character code rather than a regex, deliberately: a regex
 * describing control characters is itself the thing most likely to be
 * corrupted by the bug it is meant to catch.
 */

const ROOTS = ["app", "lib", "components", "tests"];

/** Tab (9), newline (10) and carriage return (13) are the only ones allowed. */
function isForbidden(code: number): boolean {
  if (code === 9 || code === 10 || code === 13) return false;
  return code < 32 || code === 127;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(p);
  }
  return out;
}

test("no source file contains control characters", () => {
  const offenders: string[] = [];

  for (const root of ROOTS) {
    for (const file of walk(root)) {
      const text = readFileSync(file, "utf8");
      let line = 1;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code === 10) line++;
        else if (isForbidden(code)) {
          offenders.push(
            `${file}:${line} contains 0x${code.toString(16).padStart(2, "0")}`,
          );
        }
      }
    }
  }

  expect(offenders, offenders.slice(0, 10).join("\n")).toEqual([]);
});

test("every colour token defined for light is redefined for dark", () => {
  /*
   * A token declared in only one theme block renders wrong in the other and
   * nothing errors — it silently inherits an unrelated colour.
   */
  const css = readFileSync(join("app", "globals.css"), "utf8");

  const names = (block: string) => {
    const found = new Set<string>();
    for (const m of block.matchAll(/(--c-[a-z-]+)\s*:/g)) found.add(m[1]);
    return found;
  };

  const lightStart = css.indexOf(":root {");
  const darkStart = css.indexOf(':root[data-theme="dark"] {');
  expect(lightStart).toBeGreaterThan(-1);
  expect(darkStart).toBeGreaterThan(-1);

  const light = names(css.slice(lightStart, darkStart));
  const dark = names(css.slice(darkStart));

  const missing = [...light].filter((t) => !dark.has(t));
  expect(missing, `dark theme never redefines: ${missing.join(", ")}`).toEqual(
    [],
  );
});
