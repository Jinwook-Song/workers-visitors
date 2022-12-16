# Github hits with Cloudflare workers

| 프로젝트 기간 | 22.12.16 ~ 22.12.16                              |
| ------------- | ------------------------------------------------ |
| 프로젝트 목적 | github hits useing cloudflare workers (kv)       |
| Github        | https://github.com/Jinwook-Song/workers-visitors |
| Page          | https://workers-visitors.wlsdnr129.workers.dev/  |

---

`npm install -g wrangler`

`wrangler login`

### Create project

`wrangler init <project_name>`

cloudflare worker == javascript function

---

### routing & redirect

src > home.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css"
    />
    <title>Visit Count</title>
  </head>
  <body class="container">
    <h1>Visit Counter</h1>
    <h3>How to use?</h3>
    <ul>
      <li>
        All you have to do is call (GET) this URL:
        <code> http://127.0.0.1:8787/visit?page=$URL </code>
      </li>
      <li>Replace $URL for your website URL</li>
    </ul>
  </body>
</html>
```

src > index.ts

```tsx
// @ts-ignore
import home from './home.html';

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/')
      return new Response(home, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    else
      return new Response(null, {
        status: 404,
      });
  },
};
```

### KV database

[docs](https://developers.cloudflare.com/workers/wrangler/workers-kv/)

- create
  - development
    `wrangler kv:namespace create --preview <YOUR_NAMESPACE>`
  - product
    `wrangler kv:namespace create <YOUR_NAMESPACE>`
- binding
  - wrangler.toml
  ```toml
  kv_namespaces = [    { binding = "<YOUR_BINDING>", id = "<YOUR_ID>" }
  ]
  ```

### Github hits

```tsx
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
```
