import { defineCollection, z } from 'astro:content';

const speakersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string().optional(),
    bio: z.string(),
    // Exact <title> and meta description for the profile page (optional).
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    image: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
    isOrganizer: z.boolean().default(false),
    // Thin profiles: noindex the page (also excluded from the sitemap in astro.config.mjs).
    noindex: z.boolean().default(false),
    sessionizeId: z.string().optional(),
    presentations: z.array(z.object({
      title: z.string(),
      url: z.string().optional(),
      event: z.string().optional(),
      date: z.coerce.date().optional(),
    })).default([]),
  }),
});

export const collections = {
  speakers: speakersCollection,
};
