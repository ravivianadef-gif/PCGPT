import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const files = ['index.html','styles.css','app.js','engine.js','operator.js','sw.js','manifest.webmanifest'];
const text = Object.fromEntries(await Promise.all(files.map(async f => [f, await readFile(f,'utf8')])));

assert.match(text['index.html'], /app\.js/);
assert.match(text['index.html'], /engine\.js/);
assert.match(text['index.html'], /operator\.js/);
assert.match(text['index.html'], /manifest\.webmanifest/);
assert.match(text['app.js'], /localStorage/);
assert.match(text['app.js'], /PCGPTValue/);
assert.match(text['app.js'], /PCGPTOperator/);
assert.match(text['operator.js'], /BLOQUEAR/);
assert.match(text['operator.js'], /captcha|recaptcha/);
assert.match(text['operator.js'], /fingir|mentir|burlar/);
assert.match(text['operator.js'], /PESQUISA ASSISTIDA/);
assert.match(text['engine.js'], /backup|import/i);
assert.match(text['engine.js'], /earned/);
assert.match(text['manifest.webmanifest'], /standalone/);
assert.match(text['sw.js'], /cache/i);

// Catch accidental HTML/script truncation and obvious broken JS syntax.
for (const f of ['app.js','engine.js','operator.js','sw.js']) {
  const src = text[f];
  assert.ok(src.length > 500, `${f} is unexpectedly short`);
  assert.equal((src.match(/\{/g)||[]).length, (src.match(/\}/g)||[]).length, `${f}: brace count mismatch`);
  assert.equal((src.match(/\(/g)||[]).length, (src.match(/\)/g)||[]).length, `${f}: parenthesis count mismatch`);
}

console.log(`PCGPT smoke test OK — ${files.length} core files checked.`);
