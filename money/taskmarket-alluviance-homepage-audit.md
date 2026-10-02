# Evidence-Backed Alluviance Homepage Audit

**Audit date:** 2026-10-02  
**Page audited:** https://www.alluviance.co/  
**Focus:** conversion clarity, trust, freshness, accessibility, and offer architecture.

## Executive summary

The homepage has strong raw ingredients: a differentiated "inner + outer game" positioning, named customer outcomes, multiple pathways for individuals and organizations, and substantial testimonial proof.

The largest conversion risk is not weak copy. It is **decision friction and freshness**:

1. the homepage is still actively promoting three events whose dates have already passed;
2. the same core offer is presented under several different names and CTA labels;
3. the visitor is asked to choose between multiple different decision models (program format, audience type, and free-entry products) on one page;
4. the partner-logo proof is not accessible or identifiable in the page's text layer;
5. some of the strongest evidence appears far below the initial positioning instead of immediately reducing skepticism.

If only one thing ships today, fix the expired event block. If one conversion experiment follows, simplify the homepage to one primary low-friction CTA plus one high-intent CTA and use consistent product naming everywhere.

---

## 1. P0 — "Upcoming Immersions" is showing expired events with live CTAs

### Evidence

The homepage currently lists:

- **Live Online Course:** April 22 – May 27, 2026 — "Sign Up"
- **New York Retreat:** June 18 – 21, 2026 — "Apply here!"
- **Austin Retreat:** September 17 – 20, 2026 — "Apply here!"

As of **October 2, 2026, all three dates are in the past**.

Source: https://www.alluviance.co/ — section "Upcoming Immersions".

### Why it matters

This creates a direct trust and conversion failure at the moment of purchase intent. A visitor who reaches the event section has already demonstrated interest; seeing expired dates signals that the site may not be maintained and makes the CTA outcome uncertain.

### Recommended fix

Do not hard-code expired events into the homepage.

Use one of these patterns:

- automatically hide an event after its end date;
- replace expired rows with the next confirmed cohort/retreat;
- if no future event is confirmed, replace the whole block with:
  **"Join the next immersion — get first access when new dates open."**

### Acceptance test

On any date later than an event's end date, that event must not render with an active "Sign Up" or "Apply" CTA.

### Conversion experiment

**Control:** current event block.  
**Variant:** next available event only + "Get first access" fallback.  
**Primary metric:** event CTA → completed signup/application rate.  
**Guardrail:** bounce/exit rate from the event section.

---

## 2. P1 — One core offer is named several different ways

### Evidence

The homepage refers to what appears to be the online learning/community pathway as:

- **"Online Course + Live Calls"**
- CTA: **"Explore Community"**
- later: **"Mastery With Meaning"**
- footer: **"Online Course"**
- footer resource label: **"Mastery Course"**

Source: https://www.alluviance.co/

### Why it matters

A visitor has to infer whether these labels represent:

- one product,
- different tiers,
- a course plus a separate community,
- or separate programs.

That uncertainty appears exactly where the page should be reducing cognitive load and moving the user to the next step.

### Recommended fix

Choose one canonical product name and use it everywhere.

Example:

**Mastery With Meaning — 5-Week Sales Mastery Cohort**

Then keep CTA language action-based and consistent:

- **Explore Mastery With Meaning**
- **Join the Next Cohort**

If community access is part of the offer, explain it as a benefit, not a competing product label.

### Acceptance test

A site-wide text check should find one canonical public name for the core course/cohort product; aliases should only appear where intentionally defined as sub-products or tiers.

---

## 3. P1 — The homepage changes decision models mid-journey

### Evidence

The homepage first presents **three offer formats**:

1. Online Course + Live Calls
2. Immersive In-Person Retreats
3. Team & Org Development

It then presents **three audience pathways**:

1. Individual Sellers
2. Leaders & Teams
3. Organizations & Executives

Later, it presents **three entry products**:

1. Mastery With Meaning
2. Take 5, Give 5 Challenge
3. Weekly Alluviance Newsletter

Source: https://www.alluviance.co/

### Why it matters

All three structures are individually reasonable, but together they create three different questions:

- "Which format do I want?"
- "Which audience am I?"
- "Which entry point should I choose?"

The visitor must mentally map them together before acting.

### Recommended fix

Use **one routing model** on the homepage.

Best fit for the current brand:

> **Start with who you are.**

- **I sell** → Individual path
- **I lead a team** → Leadership/team path
- **I run a sales organization** → Enterprise path

Inside each destination, present the relevant format: cohort, retreat, team engagement, strategy session, etc.

Keep the free masterclass/newsletter as acquisition CTAs, not as a third parallel product taxonomy.

### Acceptance test

A first-time visitor should be able to answer "Where do I click?" using one question and one choice set, without having to reconcile separate audience and product taxonomies.

---

## 4. P1 — Partner-logo social proof is visually present but textually unidentified

### Evidence

The homepage places a large social-proof band under:

> "Trusted by elite sales professionals and teams at"

But the page's accessible/text layer exposes the images repeatedly as **"Partner logo"**, rather than identifying the organizations.

Source: https://www.alluviance.co/

The same pattern is visible on the Team Engagements page, where the proof strip is also exposed as repeated "Partner logo" images:
https://www.alluviance.co/team-engagements

### Why it matters

This weakens the proof for:

- screen-reader users;
- text-only/low-bandwidth rendering;
- crawlers and AI search systems trying to understand which companies are represented.

It also makes the proof unverifiable when the logos are not visually available.

### Recommended fix

Give every logo an organization-specific accessible name.

Example:

- `alt="Verkada"`
- `alt="GoFundMe"`
- `alt="Gartner"`

If a logo is purely decorative because the company name is already adjacent in text, use empty alt text intentionally rather than the generic "Partner logo".

### Acceptance test

No client/company logo on the homepage should have the literal generic alt value "Partner logo".

---

## 5. P2 — The strongest proof should appear closer to the promise

### Evidence

The homepage contains unusually strong named proof, including:

- Cameron Breck: **74% YOY income growth**, two President's Clubs, move from mid-market to enterprise;
- Hank Wells: reports finishing Q1 at **1084%**;
- team/enterprise pages include named leaders describing record-breaking revenue and organizational outcomes.

Sources:

- https://www.alluviance.co/
- https://www.alluviance.co/team-engagements
- https://www.alluviance.co/enterprise

The homepage's first detailed quantitative result appears only after the methodology/inner-game explanation.

### Why it matters

"Inner game", nervous-system regulation, purpose, and belonging are highly differentiated positioning, but also require trust. Quantitative and named proof can answer the visitor's immediate skepticism:

> "Does this personal-development framing actually translate into sales performance?"

### Recommended fix

Move one compact proof strip directly below the hero / free-masterclass CTA.

Example:

> **Built for performance, not just inspiration.**  
> 74% YOY income growth · 2× President's Club · mid-market → enterprise  
> — Cameron Breck, Enterprise AE, Verkada

Then link to the full story and clearly frame it as an **individual testimonial outcome**, not a guaranteed or average result.

For B2B visitors, rotate or segment the proof:

> Record-breaking Q3 revenue · improved KPIs · stronger accountability  
> — Aaron Leonard, Director of Sales, Verkada

### Acceptance test

Within the first two major homepage sections, include at least one named, attributable result that directly connects Alluviance's method to a business/performance outcome.

---

# Recommended homepage hierarchy

## Hero

**Master the inner game that drives sustainable sales performance.**

Alluviance helps ambitious sellers and sales leaders sharpen their craft, stay steady under pressure, and perform at a high level without sacrificing themselves in the process.

**Primary CTA:** Watch the Free Masterclass  
**Secondary CTA:** Find Your Path

Immediately below:

**Proof strip:** one quantitative individual result + one team result.

## Then route by audience

### I sell
For ambitious sellers who want stronger execution, confidence under pressure, and sustainable performance.

### I lead
For managers and sales leaders building accountability, clarity, and high standards without burnout.

### I run a sales organization
For executive teams aligning revenue execution, leadership, and culture at scale.

Each route should lead to the appropriate programs rather than forcing the homepage to explain every program at once.

---

# 48-hour implementation order

1. **Remove/replace all expired event CTAs.**
2. **Standardize the course/cohort name across homepage, footer, and destination pages.**
3. **Add company-specific alt text to partner/customer logos.**
4. **Move one compact result/proof module near the hero.**
5. **Consolidate routing around audience type; keep free content as acquisition CTAs.**

---

# Evidence notes

This audit intentionally separates observable facts from hypotheses.

**Observed directly:** page copy, CTA labels, event dates, audience/product structures, testimonial claims, and generic logo alt text.

**Hypotheses to test:** that reducing naming/CTA ambiguity and surfacing proof earlier will improve conversion. Those should be validated with analytics/A/B tests rather than assumed.

External context also supports that the site is intended as a new, clearer articulation of Alluviance with more ways to engage and more case-study proof; founder Alex Kremer described the website in those terms when announcing the redesign. That makes freshness and route clarity especially important.

External context: https://www.linkedin.com/posts/kremeralex_new-website-who-dis-3-years-ago-alluviance-activity-7437142382388649984-ogCT
