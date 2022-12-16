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
import { makeBadge, makeStatusResponse } from './utils';

const statusCodes = {
  METHOD_NOT_ALLOWED: 405,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

function handleHome() {
  return new Response(home, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

function handleNotFound() {
  return new Response(null, {
    status: statusCodes.NOT_FOUND,
  });
}

function handleBadRequest() {
  return new Response(null, {
    status: statusCodes.BAD_REQUEST,
  });
}

async function handleVisit(searchParams: URLSearchParams, env: Env) {
  const username = searchParams.get('username');
  if (!username || username === '$USERNAME') return handleBadRequest();

  const exists = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      'User-Agent': 'request',
    },
  });

  if (exists.status === 404) return handleNotFound();

  const hits = await env.view_couonter_DB.get(username);
  let visitCount = '1';

  if (!hits) {
    await env.view_couonter_DB.put(username, visitCount);
  } else {
    visitCount = (Number(hits) + 1).toString();
    await env.view_couonter_DB.put(username, visitCount);
  }

  return new Response(makeBadge(+visitCount), {
    headers: {
      'content-type': 'image/svg+xml;charset=utf-8',
      // for githubs
      'Cache-Control': 'no-cache',
      ETag: `"${Date.now() + ''}"`,
    },
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { url, method } = request;
    if (method !== 'GET') {
      return makeStatusResponse(statusCodes.METHOD_NOT_ALLOWED);
    }

    const { pathname, searchParams } = new URL(url);
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
