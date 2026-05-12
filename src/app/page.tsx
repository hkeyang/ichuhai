import fs from 'node:fs/promises';
import path from 'node:path';

export default async function HomePage() {
  const html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || '<div id="app"></div>';

  return (
    <main dangerouslySetInnerHTML={{ __html: body }} />
  );
}
