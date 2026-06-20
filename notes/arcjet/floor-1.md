# Floor 1 — The Problem That Exists

Before understanding any tool, you need to understand **what chaos it's trying to control.**

So let me ask you something simple first —

**When you build a web app and deploy it... who do you think visits it?**

You'd say — *"my users obviously!"*

But the reality is —

When your app is live on the internet, it's not just your users visiting. It's **the entire internet.** And a big chunk of that internet is not human. It's automated. It's bots, scripts, crawlers, attackers — running 24/7, hitting thousands of apps simultaneously, looking for weaknesses.

Your innocent little classroom dashboard sitting on the internet? It will get hit too. Not because someone personally targeted you. Just because **automated tools scan everything.**

---

So what kind of chaos actually happens? Let's break it down in plain language —

---

## 🔴 Problem 1 — Brute Force Attacks

Imagine your `/login` route.

An attacker writes a simple script that tries **thousands of username + password combinations** in a loop. No human is typing. It's a bot hammering your login endpoint automatically.

```javascript
POST /login { email: "admin@school.com", password: "123456" }
POST /login { email: "admin@school.com", password: "password" }
POST /login { email: "admin@school.com", password: "admin123" }
... 10,000 more attempts
```

Your server just keeps responding. It doesn't know it's being abused. It's just doing its job.

This is called a **brute force attack.**

---

## 🔴 Problem 2 — Rate Abuse / API Hammering

You have an endpoint like `/api/students` or `/api/classes`.

Someone — could be a competitor, could be a malicious user — writes a script that calls your API **thousands of times per second.**

What happens?

Your server gets overwhelmed. Legitimate users start getting slow responses or errors. In worst case — **your server crashes.** This is basically a mini **DDoS (Distributed Denial of Service).**

Even without crashing — your **database gets hammered**, your **Neon DB bill spikes**, your server resources drain. All from one bad actor.

---

## 🔴 Problem 3 — Bot Traffic

Not all bots are evil by the way. Google's crawler is a bot. That's fine.

But malicious bots do things like —

- **Scrape your entire app's data** — stealing your content or student data
- **Create fake accounts in bulk** — spamming your signup form with fake emails
- **Click fraud, form spam** — submitting garbage data into your forms thousands of times

Your database slowly fills with junk. Your app behaves weirdly. Real users get affected.

---

## 🔴 Problem 4 — Fake / Disposable Emails at Signup

This one is super relevant for your multi-role dashboard —

Someone signs up with `randomguy@mailinator.com` or `test@guerrillamail.com` — these are **disposable throwaway email services.** They're used to bypass email verification and create fake accounts.

In a classroom management system where a teacher or admin is supposed to be a real person — fake account creation is a real problem.

---

## So What's The Common Thread Here?

All of these problems share one thing —

**Your server has no way to distinguish between a legitimate request and a malicious one by default.**

Your Express server just sees incoming requests. It doesn't know if it's a real teacher logging in or a bot hammering your login route for the 5,000th time. It just... responds. Blindly.

That's the core problem. ☝️

---

## The Simple Mental Model For Floor 1

Think of your app like a **school building.**

Right now your school has no —

- Security guard at the gate
- ID check system
- Visitor log
- Suspicious behavior detector

Anyone can walk in, anyone can do anything, as many times as they want.

**Arcjet and tools like it are basically your school's security system.** Different tools place that security at different points — some outside the building, some inside. That's what Floor 2 is all about.
