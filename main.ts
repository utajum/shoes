import { load } from 'https://deno.land/std@0.221.0/dotenv/mod.ts';

import OpenAI from 'https://deno.land/x/openai@v4.32.1/mod.ts';

const env = await load();
const OPEN_AI_KEY = env['OPEN_AI_KEY'] || Deno.env.get('OPEN_AI_KEY');

const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

async function generateShoeImage(prompt: string): Promise<string> {
  try {
    const shoePrompt = `Generate an image of shoes. Details: ${prompt}`;
    const response = await openai.images.generate({
      prompt: shoePrompt,
      n: 1, // number of images
      size: '512x512',
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

if (import.meta.main) {
  // await generateShoeImage('A futuristic city skyline at sunset');
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

  return new Response('Forbidden', {
    status: 403,
    headers: {},
  });
});
