const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
process.chdir(root);
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/public', { recursive: true });
fs.cpSync('public/img', 'dist/public/img', { recursive: true });
fs.copyFileSync('index.html', 'dist/index.html');
execFileSync(
  process.execPath,
  [require.resolve('webpack-cli/bin/cli.js'), '--mode', 'production'],
  { stdio: 'inherit' },
);
