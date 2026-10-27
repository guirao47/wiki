import { useEffect, useState } from 'react';
import { useSession, type SearchEngine } from '../hooks/useSession';

interface SpectatorViewProps {
  sessionId: string;
}

const ENGINE_META: Record<SearchEngine, { title: string; favicon: string; domain: string }> = {
  web: { title: 'Google', favicon: 'https://www.google.com/favicon.ico', domain: 'google.com' },
  images: { title: 'Google Imágenes', favicon: 'https://www.google.com/favicon.ico', domain: 'google.com' },
  maps: { title: 'Google Maps', favicon: 'https://www.gstatic.com/images/branding/mapslogo/1x/mapslogo_gm_blue_24dp.png', domain: 'google.com/maps' },
  youtube: { title: 'YouTube', favicon: 'https://www.youtube.com/s/desktop/b70e87ad/img/favicon_32x32.png', domain: 'youtube.com' },
  news: { title: 'Google Noticias', favicon: 'https://www.gstatic.com/images/branding/newslogo/1x/googlenewslogo_googlenews_24dp.png', domain: 'news.google.com' },
  shopping: { title: 'Google Shopping', favicon: 'https://www.gstatic.com/images/branding/productlogo/1x/shoppinglockup_24dp.png', domain: 'shopping.google.com' },
  wikipedia: { title: 'Wikipedia', favicon: 'https://www.wikipedia.org/static/favicon/wikipedia.ico', domain: 'wikipedia.org' },
};

const ENGINE_URLS: Record<SearchEngine, string> = {
  web: 'https://www.google.com/search?q=',
  images: 'https://www.google.com/search?tbm=isch&q=',
  maps: 'https://www.google.com/maps/search/',
  youtube: 'https://www.youtube.com/results?search_query=',
  news: 'https://www.google.com/search?tbm=nws&q=',
  shopping: 'https://www.google.com/search?tbm=shop&q=',
  wikipedia: 'https://en.wikipedia.org/w/index.php?search=',
};

interface SpectatorViewProps {
  sessionId: string;
}

export function SpectatorView({ sessionId }: SpectatorViewProps) {
  const { session } = useSession(sessionId, 'spectator');
  const [lastForcedQuery, setLastForcedQuery] = useState<string>('');

  // Update document title, favicon, and meta tags to match selected engine (for history disguise)
  useEffect(() => {
    const searchEngine = session?.control?.searchEngine || 'web';
    const meta = ENGINE_META[searchEngine] || ENGINE_META.web;

    document.title = meta.title;

    // Update favicon
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = meta.favicon;

    // Update meta description for history
    let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = `Buscar en ${meta.title}`;

    // Update canonical URL for history
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://${meta.domain}/`;

    // Update theme color for mobile browser UI
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = '#000000';
  }, [session?.control?.searchEngine]);

  // Watch for forced query from magician - use window.location.href for real navigation
  useEffect(() => {
    const forcedQuery = session?.control?.forcedQuery;
    const searchEngine = session?.control?.searchEngine || 'web';
    const timestamp = session?.control?.timestamp || 0;

    if (forcedQuery && forcedQuery !== lastForcedQuery && timestamp > 0) {
      setLastForcedQuery(forcedQuery);
      // Use window.location.href for real navigation (works in WebView)
      const baseUrl = ENGINE_URLS[searchEngine] || ENGINE_URLS.web;
      window.location.href = `${baseUrl}${encodeURIComponent(forcedQuery.trim())}`;
    }
  }, [session?.control?.forcedQuery, session?.control?.searchEngine, session?.control?.timestamp, lastForcedQuery]);

  // Sync engine selector with Firebase
  useEffect(() => {
    if (session?.control?.searchEngine) {
      // Engine sync happens via document title/favicon update
    }
  }, [session?.control?.searchEngine]);

  // Prevent pull-to-refresh, zoom, etc.
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Initial load - show a minimal waiting page
  return (
    <div className="spectator-view-waiting">
      <div className="waiting-content">
        <div className="google-logo">
          <svg viewBox="0 0 48 48" width="48" height="48">
            <path fill="#4285F4" d="M24 4c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm0 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            <path fill="#34A853" d="M24 4c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12c0-3.3-1.3-6.3-3.6-8.5H12v4.7h9.6v-4.7h8.4v-4.8H24V4z"/>
            <path fill="#FBBC05" d="M24 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-14c2.2 0 4.2.9 5.6 2.4l-3.6 3.6c-.9-1.3-2.3-2.4-4-2.4-4.4 0-8 3.6-8 8s3.6 8 8 8c2 0 3.7-.8 4.8-2.1l3.1 3.1C29.9 32.6 26.7 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.3 8.7 3.4l-2.8 2.8C29.3 8.1 26.7 6 24 6c-4.4 0-8 3.6-8 8s3.6 8 8 8zm0 0"/>
            <path fill="#EA4335" d="M36 24c0 1.3-.3 2.5-.8 3.6h-6.3v3.6h4.8c-.6 2-2.3 3.5-4.5 4.1v2.9h-4.8V24h6.3z"/>
          </svg>
        </div>
        <p className="waiting-text">Cargando...</p>
        <p className="hint">Mantén el móvil boca abajo</p>
      </div>
    </div>
  );
}