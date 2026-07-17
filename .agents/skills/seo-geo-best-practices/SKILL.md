---
name: seo-geo-best-practices
description: Best practices for implementing SEO, AEO, and GEO in Next.js App Router applications.
---

# SEO, AEO, and GEO Guide for Next.js App Router

To optimize a Next.js App Router project for Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO), you need to cater to both traditional search crawlers and modern AI models (like ChatGPT, Perplexity, and Gemini).

## Core Concepts

- **SEO (Search Engine Optimization):** Focuses on traditional search ranking signals like crawling, indexing, keywords, and Core Web Vitals.
- **AEO (Answer Engine Optimization):** Targets "Position Zero" (featured snippets, voice assistants) by providing direct, concise, and structured answers.
- **GEO (Generative Engine Optimization):** Focuses on being cited as a trusted source in LLM responses by providing clear, well-structured, and authoritative data.

## 1. Content Architecture & Rendering

### Prioritize Server Components (RSC)

AI models and traditional crawlers prefer fast, static-like HTML.

- **Do:** Use React Server Components (the default in App Router) for public-facing content to minimize JavaScript and ensure content is available in the initial HTML.
- **Don't:** Use Client Components (`'use client'`) for purely static text or content that needs to be indexed. Reserve them for interactive elements.

### Streaming and Performance

Core Web Vitals remain a key ranking factor for both Google and AI search.

- Utilize `loading.tsx` and React Suspense boundaries to improve perceived performance.
- Use `next/image` and `next/font` for automatic optimization.

## 2. Content Structure (The "Answer-First" Pattern)

AI engines "chunk" content based on headings, not routes.

- **Heading Hierarchy:** Use a strict semantic `H1`–`H4` structure. AI relies heavily on headings to understand context.
- **Direct Answers:** Provide a concise summary or answer (40–60 words) immediately under your main headings to optimize for AEO and GEO.
- **Semantic HTML:** Wrap content in semantic tags (`<article>`, `<section>`, `<nav>`, `<aside>`) to help AI distinguish primary content from boilerplate (like footers or sidebars).

## 3. Metadata & Discoverability (SEO & Social)

Use the built-in Next.js Metadata API for deterministic, SEO-friendly meta tags. Export a `metadata` object or `generateMetadata` function from your `layout.tsx` or `page.tsx`.

### OpenGraph and Twitter Card Configuration

Define OpenGraph and Twitter properties directly in the Metadata API to ensure rich link previews on social media and chat applications.

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    // Keep this description answer-focused:
    description: post.description,
    metadataBase: new URL('https://yourdomain.com'),
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      siteName: 'Your Site Name',
      images: [
        {
          url: `https://yourdomain.com/og/${post.slug}.png`,
          width: 1200,
          height: 630,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [`https://yourdomain.com/og/${post.slug}.png`],
    },
  };
}
```

### Descriptive, Answer-Focused Meta Tags

Instead of just stuffing keywords into the `description`, phrase it as a direct answer to a user's potential query. This serves dual purposes for traditional CTR and AEO.

## 4. JSON-LD Structured Data Setup

Structured data is critical for GEO, explicitly telling AI systems what your content represents. Because the Next.js Metadata API is designed for standard `<meta>` tags, JSON-LD must be injected as a `<script>` tag directly within your Server Component's JSX.

```tsx
// app/products/[id]/page.tsx
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
    },
  };

  return (
    <section>
      {/* Inject JSON-LD directly into the component tree */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // Security: Always replace the < character with \u003c to prevent XSS attacks
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </section>
  );
}
```

**Important JSON-LD Notes:**

- **Server Components:** Keep JSON-LD logic inside Server Components.
- **Escape Characters:** Always use `.replace(/</g, '\\u003c')` when stringifying JSON-LD to prevent XSS.
- **Schema Types:** Utilize `FAQPage`, `Article`, `BreadcrumbList`, or `Product` schemas heavily for AEO and GEO.

## Summary Checklist

- [ ] Use Next.js Metadata API for titles, descriptions, OpenGraph, and Twitter cards.
- [ ] Ensure `metadataBase` is defined.
- [ ] Serve primary content via React Server Components.
- [ ] Place direct answers (40-60 words) immediately below corresponding headings.
- [ ] Use valid `<script type="application/ld+json">` tags for Schema.org structured data in your page components.
- [ ] Include automated `sitemap.ts` and `robots.ts` files at the root of your app.
