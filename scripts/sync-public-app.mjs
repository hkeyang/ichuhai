import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'app.js');
const target = resolve(root, 'public/app.js');

copyFileSync(source, target);
console.log(`Synced ${source} -> ${target}`);
