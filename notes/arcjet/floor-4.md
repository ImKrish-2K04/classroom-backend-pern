# Floor 4 — Arcjet Features

## 1. Rate Limiting

Your Express server by default has no memory. Every request is treated fresh. Rate limiting gives your server memory — "this user/IP has hit this endpoint X times in Y seconds."

Arcjet lets you define a limit like:

```ts
const aj = arcjet({
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,    // 10 tokens added per interval
      interval: 60,      // every 60 seconds
      capacity: 20,      // max 20 tokens stored
    })
  ]
})
```

**Token bucket** is the algorithm Arcjet uses. Think of it like a bucket that slowly refills. Each request costs one token. If the bucket is empty, you're blocked. This is better than a hard "10 requests per minute" counter because it handles bursts naturally — a user can send 20 requests quickly if they haven't used the endpoint in a while.

In your classroom dashboard — your `GET /api/students` endpoint should have a limit. A teacher legitimately browsing won't hit it. A script hammering it will.

---

## 2. Bot Protection

Not all bots are bad. Googlebot crawling your site is fine. A scraper extracting your student list is not.

Arcjet's bot protection classifies bots into categories:

- `LIKELY_AUTOMATED` — headless browsers, scripts with no real browser fingerprint
- `LIKELY_NOT_A_BOT` — normal browser with proper headers, JS environment, etc.
- `VERIFIED_BOT` — known good bots like Googlebot (whitelisted)

```ts
botProtection({
  mode: "LIVE",
  allow: ["CATEGORY:SEARCH_ENGINE"]  // allow Googlebot etc.
})
```

Arcjet checks things like User-Agent, request timing patterns, missing browser headers, and whether JavaScript challenges are passed.

In your classroom dashboard — your login endpoint and your student data endpoints should block `LIKELY_AUTOMATED`. Your public pages (if any) can allow search engine bots.

---

## 3. Shield

Shield is Arcjet's WAF-equivalent — it looks at incoming requests and flags known attack patterns:

- SQL injection attempts in query params or body
- XSS payloads
- Path traversal like `../../etc/passwd`
- Malformed headers

```ts
shield({
  mode: "LIVE"
})
```

That's literally it on the code side. Shield runs automatically on every request you protect.

The difference from Cloudflare's WAF — Cloudflare's WAF runs at the edge before your server. Arcjet Shield runs inside your server. If you have no Cloudflare, Arcjet Shield is your only WAF-like protection. If you have both, Shield is a second check that catches anything Cloudflare missed.

In your classroom dashboard — wrap Shield around every single route. There's no reason not to.

---

## 4. Email Validation

When a user signs up, they can put anything in the email field. Arcjet's email validation goes beyond just checking `@` exists:

- Is this a **disposable/temporary email** (mailinator, guerrillamail, etc.)?
- Does the **domain actually have MX records** (can it even receive emails)?
- Is it a **free provider** (gmail, yahoo) — which you might allow or disallow depending on your use case?
- Is it **valid format**?

```ts
validateEmail({
  mode: "LIVE",
  block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"]
})
```

In your classroom dashboard — your `POST /api/auth/register` route needs this. You don't want fake student signups with throwaway emails clogging your classroom data.

---

## 5. How Arcjet Combines These

You don't pick one feature per route. You stack them:

```ts
const protectedRoute = arcjet({
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({ mode: "LIVE", refillRate: 10, interval: 60, capacity: 20 }),
    botProtection({ mode: "LIVE", allow: [] })
  ]
})
```

Every request goes through all rules in order. If any rule says DENY, the request is blocked immediately and the rest don't run.

---

## 6. LIVE vs DRY_RUN mode

Every rule has a `mode` field:

- `LIVE` — actually blocks requests
- `DRY_RUN` — runs the check, logs the decision, but **never blocks**

You use `DRY_RUN` when you're testing. You deploy to production with `LIVE`. This is important for interviews — shows you think about safe rollouts.

---

## The Decision Object

Whatever mode you're in, Arcjet always returns a decision:

```ts
const decision = await aj.protect(req)

if (decision.isDenied()) {
  res.status(429).json({ error: "Too many requests" })
  return
}
// continue to your route logic
```

`decision` also tells you *why* it was denied — which rule triggered, what it saw. Useful for logging.

---

## Arcjet Feature → Your Route mapping

| Feature | Your route |
|---|---|
| Shield | Every route — always on |
| Rate limiting | `/api/students`, `/api/classrooms`, any data endpoint |
| Bot protection | `/api/auth/login`, `/api/auth/register`, data endpoints |
| Email validation | `/api/auth/register` only |
