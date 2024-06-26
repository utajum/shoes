import { load } from 'https://deno.land/std@0.221.0/dotenv/mod.ts';
import { serveDir } from 'https://deno.land/std/http/file_server.ts';

import OpenAI from 'https://deno.land/x/openai@v4.32.1/mod.ts';

const env = await load();
const OPEN_AI_KEY = env['OPEN_AI_KEY'] || Deno.env.get('OPEN_AI_KEY');

const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

async function generateShoeImage(prompt: string): Promise<string> {
  try {
    const shoePrompt = `Generate an image of 2 shoes. The entire 2 shoes must be visible. A detailed closeup 
    of the shoes. Details: ${prompt}`;
    const response = await openai.images.generate({
      prompt: shoePrompt,
      n: 1, // number of images
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
    });
    if (response?.data?.[0]?.url) {
      console.log('Generated Image URL: ', response.data[0].url);
      return response.data[0].url;
    } else {
      console.log('No URL found for the generated image.');
      return '';
    }
  } catch (error) {
    console.error('Error generating image: ', error);
    return '';
  }
}

Deno.serve(async (req: Request) => {
  const reqURL = new URL(req.url);
  if (reqURL.pathname === '/shoe') {
    const bodyText = await req.text();
    console.log('BODY ', bodyText);
    const res = await generateShoeImage(bodyText);
    return new Response(res, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  if (reqURL.pathname.startsWith('/dist')) {
    const path = reqURL.pathname;
    console.log(path);
    try {
      const file = await serveDir(req, {});
      return file;
    } catch (error) {
      console.error('Error serving static file:', error);
      return new Response('File not found', { status: 404 });
    }
  }
  if (reqURL.pathname.startsWith('/assets')) {
    const path = reqURL.pathname;
    console.log(path);
    try {
      const file = await serveDir(req, {
        fsRoot: `dist/assets`,
        urlRoot: 'assets',
      });
      return file;
    } catch (error) {
      console.error('Error serving static file:', error);
      return new Response('File not found', { status: 404 });
    }
  }

  return new Response('Forbidden', {
    status: 403,
    headers: {},
  });
});
