/**
 * RSS-feed van de blog. Alleen gepubliceerde posts. Drafts ontbreken, ook als het bestand in de repo staat.
 * Links zonder trailing slash, gelijk aan de rest van de site.
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { BLOG_BESCHRIJVING, BLOG_TITEL, gepubliceerdePosts, postPad } from '../../lib/blog';
import { blogCategorie } from '../../data/blog-categories';

export const GET: APIRoute = async (context) => {
  const posts = await gepubliceerdePosts();
  return rss({
    title: BLOG_TITEL,
    description: BLOG_BESCHRIJVING,
    site: context.site ?? 'https://paulbreuker.nl',
    trailingSlash: false,
    customData: '<language>nl-nl</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPad(post.id),
      categories: [blogCategorie(post.data.category).label],
    })),
  });
};
