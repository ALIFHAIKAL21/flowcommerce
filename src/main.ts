import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { setupSwagger } from './swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const expressApp = app.getHttpAdapter().getInstance();

  // Serve static files from /public
 app.useStaticAssets(join(process.cwd(), 'public'));

  // Stripe Webhook
  expressApp.use('/payment/webhook', express.raw({ type: 'application/json' }));
  expressApp.use(express.json());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  setupSwagger(app);

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://flowcommerce.onrender.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // === Project Overview (Ultra-Polished) ===
  expressApp.get('/', (_req, res) => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
    res.type('html').send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>FlowCommerce — Overview</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --primary:#1AA3A1; --primary-2:#0f766e;
  --ink:#0b1220; --muted:#6b7280; --fg:#111827; --bg:#0b1220; --card:#0f1629;
  --glass:rgba(255,255,255,0.06); --br:16px;
  --shadow:0 10px 40px rgba(0,0,0,.35);
  --grad:linear-gradient(135deg,#17b2b0 0%,#1AA3A1 40%,#6ee7b7 100%);
  --grad2:radial-gradient(1000px 600px at 20% -10%, #16a34a22 0%, transparent 60%),
           radial-gradient(900px 500px at 120% 40%, #06b6d422 0%, transparent 60%);
}
*{box-sizing:border-box} html,body{height:100%}
body{
  margin:0; font-family:Inter,system-ui,Segoe UI,Arial; color:#e5e7eb;
  background:var(--bg); background-image:var(--grad2);
}
.container{max-width:1200px;margin:0 auto;padding:28px}
.hero{
  background:linear-gradient(180deg,rgba(26,163,161,.25),rgba(26,163,161,.05));
  border:1px solid #1AA3A144; border-radius:24px; padding:34px; position:relative; overflow:hidden;
  box-shadow:var(--shadow);
}
.hero .badge{display:inline-flex;align-items:center;gap:8px;
  background:var(--glass);border:1px solid #ffffff22;border-radius:999px;padding:8px 14px;
  backdrop-filter: blur(6px); font-size:12px; color:#cbd5e1;
}
.hero h1{margin:14px 0 10px; font-size:34px; font-weight:800; letter-spacing:.3px}
.hero p{margin:0; color:#cbd5e1; max-width:900px; line-height:1.7}
.hero .actions{margin-top:18px; display:flex; gap:12px; flex-wrap:wrap}
.button{
  display:inline-flex;align-items:center;gap:10px; text-decoration:none; cursor:pointer;
  background:var(--grad); color:#062b29; font-weight:800; padding:12px 16px; border-radius:12px;
  border:0; transition:.2s transform; box-shadow:0 8px 24px rgba(23,178,176,.35);
}
.button:hover{transform:translateY(-1px)}
.button.ghost{background:transparent;color:#cbd5e1;border:1px solid #ffffff33; box-shadow:none}
.grid{ display:grid; gap:18px; margin-top:28px}
@media(min-width:1000px){ .grid{ grid-template-columns: 1.1fr 1fr } }

.card{
  background:var(--card); border:1px solid #ffffff14; border-radius:var(--br); padding:22px;
  box-shadow:var(--shadow);
}
.card h2{margin:0 0 12px; font-size:18px; font-weight:800; color:#e8faf9}
.card p, .card li, .small{color:#cbd5e1}
.kbd{font-family:ui-monospace,Menlo,Consolas; background:#0b1322; border:1px solid #ffffff1a; padding:3px 6px; border-radius:8px}
.hr{height:1px;background:#ffffff18;margin:16px 0}

.logo-grid{
  display:grid; gap:16px; grid-template-columns:repeat(4,1fr);
}
.logo{
  background:var(--glass); border:1px solid #ffffff1f; border-radius:14px; padding:14px; display:flex; align-items:center; justify-content:center;
}
.logo img{max-width:86px; max-height:38px; opacity:.95; filter:drop-shadow(0 4px 10px rgba(0,0,0,.25))}
@media(max-width:720px){ .logo-grid{grid-template-columns:repeat(2,1fr)} }

.flex{display:flex; gap:12px; flex-wrap:wrap}
.tag{
  background:#1AA3A11a; border:1px solid #1AA3A166; color:#d1fae5; border-radius:999px; padding:6px 10px; font-size:12px; font-weight:700
}

pre{
  background:#0b1322; color:#e5e7eb; padding:14px 16px; border:1px solid #ffffff12; border-radius:12px; overflow:auto;
}
.copy{float:right; margin-top:-6px; transform:translateY(-4px)}
ul{padding-left:18px;margin:0}
li+li{margin-top:6px}
a{color:#7dd3fc; text-decoration:none} a:hover{text-decoration:underline}

.erd{
  background:#0b1322; border:1px solid #ffffff14; border-radius:16px; padding:10px;
}
.erd img{width:100%; border-radius:12px}
.erd svg text{font-family:Inter,system-ui,sans-serif}

.footer{
  margin-top:26px; color:#93a3b5; text-align:center; font-size:13px
}
.status-dot{width:10px;height:10px;border-radius:999px;display:inline-block;margin-right:6px}
.ok{background:#10b981}.warn{background:#f59e0b}.bad{background:#ef4444}
</style>
</head>
<body>
  <div class="container">
    <section class="hero">
      <span class="badge">🚀 Project Overview</span>
      <h1>FlowCommerce</h1>
      <p>
        A modern, scalable, and developer-friendly <b>e-commerce backend platform</b> engineered with <span class="kbd">NestJS</span> and powered by <span class="kbd">PostgreSQL (Neon)</span>. 
        It implements end-to-end commerce logic—<b>Authentication</b>, <b>RBAC</b>, <b>Catalog</b>, <b>Cart</b>, <b>Orders</b>, and <b>Payments</b>—with seamless <b>Stripe</b> integration, 
        <b>Cloudinary</b> media uploads, <b>TypeORM</b> modeling, and GitHub → Render CI/CD for hands-off deployments.
      </p>
      <div class="actions">
        <a class="button" href="/api/docs" target="_blank">📘 Swagger API Docs</a>
        <a class="button ghost" href="https://flowcommerce.onrender.com" target="_blank">🌐 Deployed API</a>
        <a class="button ghost" href="https://github.com/ALIFHAIKAL21/flowcommerce" target="_blank" rel="noopener">⭐ GitHub (Repo)</a>
      </div>
    </section>

    <div class="grid">
      <!-- Tech Stack -->
      <section class="card">
        <h2>🧩 Tech Stack & Vendors</h2>
        <p class="small">All technologies used are production-grade and battle-tested.</p>
        <div class="logo-grid" style="margin-top:12px">
          <div class="logo"><img alt="NestJS" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg"></div>
          <div class="logo"><img alt="TypeScript" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"></div>
          <div class="logo"><img alt="Node.js" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"></div>
          <div class="logo"><img alt="PostgreSQL" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"></div>
          <div class="logo"><svg width="26px" height="26px" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 10C0 4.47715 4.47705 0 9.99976 0H47.9989C53.5216 0 57.9986 4.47715 57.9986 10V42.3189C57.9986 48.0326 50.7684 50.5124 47.2618 46.0014L36.2991 31.8988V49C36.2991 53.9706 32.2698 58 27.2993 58H9.99976C4.47705 58 0 53.5228 0 48V10ZM9.99976 8C8.89522 8 7.99981 8.89543 7.99981 10V48C7.99981 49.1046 8.89522 50 9.99976 50H27.5993C28.1516 50 28.2993 49.5523 28.2993 49V26.0673C28.2993 20.3536 35.5295 17.8738 39.0361 22.3848L49.9988 36.4874V10C49.9988 8.89543 50.1034 8 48.9988 8H9.99976Z" fill="#12FFF7"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 10C0 4.47715 4.47705 0 9.99976 0H47.9989C53.5216 0 57.9986 4.47715 57.9986 10V42.3189C57.9986 48.0326 50.7684 50.5124 47.2618 46.0014L36.2991 31.8988V49C36.2991 53.9706 32.2698 58 27.2993 58H9.99976C4.47705 58 0 53.5228 0 48V10ZM9.99976 8C8.89522 8 7.99981 8.89543 7.99981 10V48C7.99981 49.1046 8.89522 50 9.99976 50H27.5993C28.1516 50 28.2993 49.5523 28.2993 49V26.0673C28.2993 20.3536 35.5295 17.8738 39.0361 22.3848L49.9988 36.4874V10C49.9988 8.89543 50.1034 8 48.9988 8H9.99976Z" fill="url(#paint0_linear_10558_11777)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 10C0 4.47715 4.47705 0 9.99976 0H47.9989C53.5216 0 57.9986 4.47715 57.9986 10V42.3189C57.9986 48.0326 50.7684 50.5124 47.2618 46.0014L36.2991 31.8988V49C36.2991 53.9706 32.2698 58 27.2993 58H9.99976C4.47705 58 0 53.5228 0 48V10ZM9.99976 8C8.89522 8 7.99981 8.89543 7.99981 10V48C7.99981 49.1046 8.89522 50 9.99976 50H27.5993C28.1516 50 28.2993 49.5523 28.2993 49V26.0673C28.2993 20.3536 35.5295 17.8738 39.0361 22.3848L49.9988 36.4874V10C49.9988 8.89543 50.1034 8 48.9988 8H9.99976Z" fill="url(#paint1_linear_10558_11777)"></path><path d="M48.0003 0C53.523 0 58 4.47715 58 10V42.3189C58 48.0326 50.7699 50.5124 47.2633 46.0014L36.3006 31.8988V49C36.3006 53.9706 32.2712 58 27.3008 58C27.8531 58 28.3008 57.5523 28.3008 57V26.0673C28.3008 20.3536 35.5309 17.8738 39.0375 22.3848L50.0002 36.4874V2C50.0002 0.89543 49.1048 0 48.0003 0Z" fill="#B9FFB3"></path><defs><linearGradient id="paint0_linear_10558_11777" x1="57.9986" y1="58" x2="6.99848" y2="0.00123034" gradientUnits="userSpaceOnUse"><stop stop-color="#B9FFB3"></stop><stop offset="1" stop-color="#B9FFB3" stop-opacity="0"></stop></linearGradient><linearGradient id="paint1_linear_10558_11777" x1="57.9986" y1="58" x2="23.5492" y2="44.6006" gradientUnits="userSpaceOnUse"><stop stop-color="#1A1A1A" stop-opacity="0.9"></stop><stop offset="1" stop-color="#1A1A1A" stop-opacity="0"></stop></linearGradient></defs></svg></div>
          <div class="logo"><img alt="TypeORM" src="https://raw.githubusercontent.com/typeorm/typeorm/master/resources/logo_big.png"></div>
          <div class="logo"><img alt="Stripe" src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/stripe.svg"></div>
          <div class="logo"><img alt="Cloudinary" src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/cloudinary.svg"></div>
          <div class="logo"><img alt="Render" src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/render.svg"></div>
          <div class="logo"><img alt="GitHub" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"></div>
          <div class="logo"><img alt="JWT" src=https://www.vaadata.com/blog/wp-content/uploads/2016/12/jwt-json-web-token.png"></div>
          <div class="logo"><img alt="OpenAPI" src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/openapiinitiative.svg"></div>
        </div>
        <div class="hr"></div>
        <div class="flex">
          <span class="tag">Node 20 LTS</span>
          <span class="tag">NestJS 10+</span>
          <span class="tag">TypeORM</span>
          <span class="tag">JWT Auth</span>
          <span class="tag">RBAC</span>
          <span class="tag">Stripe Webhooks</span>
          <span class="tag">Cloudinary Uploads</span>
          <span class="tag">Render Deploy</span>
          <span class="tag">Neon Postgres</span>
          <span class="tag">OpenAPI/Swagger</span>
        </div>
      </section>

      <!-- Modules & Capabilities -->
      <section class="card">
        <h2>🧠 Capabilities</h2>
        <ul>
          <li><b>Authentication</b> (Register/Login) & <b>JWT Authorization</b></li>
          <li><b>Role-based Access Control</b> (Admin/Customer)</li>
          <li><b>Products & Categories</b> CRUD with validation</li>
          <li><b>Cart</b> with quantity, totals, and stock checks</li>
          <li><b>Orders</b> & <b>Order Items</b> (transactional)</li>
          <li><b>Stripe Integration</b> — PaymentIntent + <span class="kbd">/payment/webhook</span> handler</li>
          <li><b>Cloudinary</b> — media uploads via upload_stream</li>
          <li><b>Swagger</b> — auto API docs</li>
        </ul>
        <div class="hr"></div>
        <div>
          <span class="status-dot ok"></span>Backend
          <span class="status-dot ok" style="margin-left:12px"></span>Database
          <span class="status-dot ok" style="margin-left:12px"></span>Stripe Webhook
        </div>
      </section>
    </div>

    <!-- ERD -->
   <section class="card" style="margin-top:12px">
  <h2>🗺️ Entity Relationship Diagram (ERD)</h2>
  <p class="small">Database schema visualization generated from PostgreSQL (Neon).</p>
  <div class="erd" style="background:#0b1220;border-radius:12px;padding:12px">
    <img src="/erd.svg" alt="FlowCommerce ERD" style="width:100%;border-radius:12px;">
  </div>
</section>


    <!-- Folder Structure -->
    <section class="card" style="margin-top:12px">
      <h2>📁 Folder Structure</h2>
     <pre><code>flowcommerce/
├─ dist/
├─ node_modules/
├─ public/
├─ src/
│  ├─ app.module.ts
│  ├─ main.ts
│  ├─ swagger.ts
│  ├─ auth/
│  │  ├─ auth.controller.ts
│  │  ├─ auth.service.ts
│  │  └─ jwt.strategy.ts
│  ├─ users/
│  │  ├─ users.controller.ts
│  │  ├─ users.service.ts
│  │  └─ users.entity.ts
│  ├─ categories/
│  │  ├─ categories.controller.ts
│  │  ├─ categories.service.ts
│  │  └─ categories.entity.ts
│  ├─ products/
│  │  ├─ products.controller.ts
│  │  ├─ products.service.ts
│  │  └─ products.entity.ts
│  ├─ carts/
│  │  ├─ carts.controller.ts
│  │  ├─ carts.service.ts
│  │  └─ carts.entity.ts
│  ├─ orders/
│  │  ├─ orders.controller.ts
│  │  ├─ orders.service.ts
│  │  ├─ orders.entity.ts
│  │  └─ order-items.entity.ts
│  ├─ payment/
│  │  ├─ payment.controller.ts
│  │  └─ payment.service.ts
│  └─ uploads/
│     ├─ uploads.service.ts
│     └─ upload.controller.ts
├─ test/
│  └─ ...
├─ .env
├─ package.json
├─ render.yaml
└─ tsconfig.json
</code></pre>

    </section>

    <!-- ENV -->
    <section class="card" style="margin-top:12px">
      <h2>🔐 Environment Variables</h2>
      <button class="button copy" onclick="copyEnv()">Copy</button>
      <pre id="env"><code>DATABASE_URL=postgres://user:pass@neon.host/db
JWT_SECRET=supersecretkey

STRIPE_SECRET_KEY=sk_test_***
STRIPE_PUBLISHABLE_KEY=pk_test_***
STRIPE_WEBHOOK_SECRET=whsec_***

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

RENDER_EXTERNAL_URL=${baseUrl}</code></pre>
      <p class="small">Tip: On Render, set these in Dashboard → Environment. On local, create a <span class="kbd">.env</span> file.</p>
    </section>

    <!-- Endpoints -->
    <section class="card" style="margin-top:16px">
      <h2>🔗 Useful Links & Endpoints</h2>
      <ul>
        <li>Base URL: <span class="kbd">${baseUrl}</span></li>
        <li>Swagger Docs: <a href="/api/docs" target="_blank">/api/docs</a></li>
        <li>Stripe Webhook: <span class="kbd">/payment/webhook</span></li>
        <li>Auth: <span class="kbd">POST /auth/register</span>, <span class="kbd">POST /auth/login</span></li>
        <li>Users: <span class="kbd">GET /users</span>, <span class="kbd">GET /users/:id_user</span></li>
        <li>Categories: <span class="kbd">GET /categories</span>, <span class="kbd">POST /categories</span></li>
        <li>Products: <span class="kbd">GET /products</span>, <span class="kbd">POST /products</span></li>
        <li>Cart: <span class="kbd">GET /carts/me</span>, <span class="kbd">POST /carts</span>, <span class="kbd">DELETE /carts/me/clear</span></li>
        <li>Orders: <span class="kbd">GET /orders/me</span>, <span class="kbd">POST /orders/checkout</span></li>
      </ul>
    </section>

    <p class="footer">© 2025 FlowCommerce · built by Alif Haikal From Flowdev Teams</p>
  </div>

<script>
function copyEnv(){
  const t = document.getElementById('env').innerText;
  navigator.clipboard.writeText(t).then(()=>{
    alert('Environment template copied!');
  });
}
</script>
</body>
</html>
    `);
  }); const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running at ${baseUrlFromEnv()}`);
  console.log('📘 Swagger: /api/docs');
  console.log('📄 Overview: /');
}

function baseUrlFromEnv() {
  return process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
}

bootstrap();
