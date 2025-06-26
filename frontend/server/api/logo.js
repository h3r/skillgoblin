import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineEventHandler((event) => {

  const logoPath = resolve('/app/data', 'logo.png');

  if (!existsSync(logoPath)) {
    setResponseStatus(event, 404);
    return 'Not Found';
  }

  const file = readFileSync(logoPath);
  setHeader(event, 'Content-Type', 'image/png');
  return file;
});