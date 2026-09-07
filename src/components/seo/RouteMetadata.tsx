import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_ORIGIN = (import.meta.env.VITE_SITE_ORIGIN ?? 'https://mju-craft.shop').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_ORIGIN}/mjucraftLogo_Blue_Round.png`;

type Metadata = {
  title: string;
  description: string;
  image?: string | null;
};

function absoluteUrl(value: string) {
  return new URL(value, `${SITE_ORIGIN}/`).href;
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

function clearManagedMetadata() {
  document.head.querySelectorAll(
    'link[rel="canonical"], meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]',
  ).forEach((element) => element.remove());
}

function isPublicContentPath(pathname: string) {
  return pathname === '/' || pathname === '/about' || pathname === '/projects' || pathname === '/notices' || /^\/projects\/[^/]+(?:\/items\/[^/]+)?$/.test(pathname) || /^\/notices\/[^/]+$/.test(pathname);
}

export function ApplicationRouteMetadata() {
  const location = useLocation();

  useEffect(() => {
    if (isPublicContentPath(location.pathname)) return;
    document.title = '명지공방';
    clearManagedMetadata();
    setMeta('meta[name="robots"]', { name: 'robots', content: 'noindex,nofollow' });
  }, [location.pathname]);

  return null;
}

export default function RouteMetadata({ title, description, image }: Metadata) {
  const location = useLocation();

  useEffect(() => {
    const canonical = absoluteUrl(location.pathname);
    const socialImage = absoluteUrl(image || DEFAULT_IMAGE);
    document.title = title;
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', { name: 'robots', content: 'index,follow' });
    setCanonical(canonical);
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: socialImage });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: socialImage });
  }, [description, image, location.pathname, title]);

  return null;
}
