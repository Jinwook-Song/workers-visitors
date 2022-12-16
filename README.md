| 프로젝트 기간 | 22.12.16 ~                                       |
| ------------- | ------------------------------------------------ |
| 프로젝트 목적 | cloudflare workers                               |
| Github        | https://github.com/Jinwook-Song/workers-visitors |

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
