// makefun-x-promote: entry for make.fun's post-x-promote-make-your-own-bounty-01.
// The entry is a post on X; this program only hands POST.json to the grader.
// It validates the file shape, then writes it byte-for-byte to the output dir.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR || '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const POST_URL = /^https:\/\/(www\.|mobile\.)?(x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+$/;

function fail(msg: string): never {
  console.error(`makefun-x-promote: ${msg}`);
  process.exit(1);
}

let raw: Buffer;
try {
  raw = readFileSync(resolve(botDir, 'POST.json'));
} catch (e) {
  fail(`cannot read POST.json in ${botDir}: ${(e as Error).message}`);
}
if (raw.length > 16384) fail('POST.json is larger than 16384 bytes');

let doc: unknown;
try {
  doc = JSON.parse(raw.toString('utf8'));
} catch {
  fail('POST.json is not valid JSON');
}
if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) fail('POST.json must be a JSON object');
const url = (doc as { url?: unknown }).url;
if (typeof url !== 'string' || !POST_URL.test(url.trim())) fail('POST.json url is not an X post address');
if (/\/makefunai\/status\//i.test(url)) fail("POST.json must name your own post, not make.fun's");

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'POST.json'), raw);
