import fs from 'node:fs';
import path from 'node:path';
import {
    fileURLToPath
} from 'node:url';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
const targetFile = path.resolve(__dirname, '../node_modules/@tailwindcss/vite/dist/index.mjs');

if (!fs.existsSync(targetFile)) {
    console.log('[patch-tailwind] Target file not found, skipping.');
    process.exit(0);
}

let code = fs.readFileSync(targetFile, 'utf8');

const original = 'for(let n of this.scanner.scan())this.candidates.add(n);';
const patch = `for(let n of this.scanner.scan())this.candidates.add(n);if(this.candidates.size===0){try{const _fs=await import("node:fs");const _path=await import("node:path");function _w(d){let r=[];try{for(const e of _fs.readdirSync(d,{withFileTypes:true})){if(e.name==="node_modules"||e.name==="dist"||e.name.startsWith("."))continue;const p=_path.join(d,e.name);if(e.isDirectory())r=r.concat(_w(p));else if(/\\.(jsx?|tsx?|html|vue|svelte)$/.test(e.name))r.push(p);}}catch{}return r;}for(const f of _w(this.base)){const ext=_path.extname(f).slice(1);try{const cnt=_fs.readFileSync(f,"utf8");for(const item of this.scanner.getCandidatesWithPositions({content:cnt,extension:ext}))this.candidates.add(item.candidate);}catch{}}}catch{}}`;

if (code.includes(patch)) {
    console.log('[patch-tailwind] Already patched.');
    process.exit(0);
}

if (!code.includes(original)) {
    console.log('[patch-tailwind] Target marker not found in index.mjs.');
    process.exit(0);
}

code = code.replace(original, patch);
fs.writeFileSync(targetFile, code, 'utf8');
console.log('[patch-tailwind] Successfully patched @tailwindcss/vite for Windows WASI fallback.');