/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  view_couonter_DB: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

// @ts-ignore
import home from './home.html';

function handleHome() {
  return new Response(home, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

function handleNotFound() {
  return new Response(null, {
    status: 404,
  });
}

function handleBadRequest() {
  return new Response(null, {
    status: 400,
  });
}

async function handleVisit(searchParams: URLSearchParams, env: Env) {
  const page = searchParams.get('page');
  if (!page) return handleBadRequest();

  const kvPage = await env.view_couonter_DB.get(page);
  let visitCount = '1';

  if (!kvPage) {
    await env.view_couonter_DB.put(page, visitCount);
  } else {
    visitCount = (Number(kvPage) + 1).toString();
    await env.view_couonter_DB.put(page, visitCount);
  }

  return new Response(JSON.stringify({ visits: +visitCount }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);

    switch (pathname) {
      case '/':
        return handleHome();
      case '/visit':
        return handleVisit(searchParams, env);
      default:
        return handleNotFound();
    }
  },
};
