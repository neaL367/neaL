export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function cleanSnippet(text: string): string {
  let s = decodeHtmlEntities(text.replace(/<[^>]+>/g, ''));
  // Strip all emojis and pictographs
  s = s.replace(/\p{Extended_Pictographic}/gu, '');
  // Remove Wikipedia citation brackets like [29]
  s = s.replace(/\[(?:\d+|note\s+\d+)\]/gi, '');
  // Remove trailing ellipsis
  s = s.replace(/\s*\.{2,}\s*$/, '');
  // If there is an unclosed parenthesis like "(Experimental ..." at the end, remove it
  if (s.lastIndexOf('(') > s.lastIndexOf(')')) {
    s = s.slice(0, s.lastIndexOf('(')).trim();
  }
  // Remove leading numbers, bullets, or dashes
  s = s.replace(/^[\s•\-\*\d\.\)]+/, '').trim();
  return s;
}

export function formatSearchTitle(raw: string): string {
  const cleaned = raw
    .replace(/^(who is the|who was the|who are the|who is|who was|who are|who's|what are the|what is the|what were the|what are|what is|what was|tell me about the|tell me about|how does|how do|why is|why are|explain the|explain|the latest features in|latest features in|features in|features of|news about|overview of)\s+/i, '')
    .replace(/[?.,!]/g, '')
    .trim();
  if (!cleaned) return raw;
  return cleaned
    .split(/\s+/)
    .map(w => {
      const upper = w.toUpperCase();
      if (['GTA', 'API', 'HTML', 'CSS', 'UI', 'JS', 'TS', 'RSC', 'URL', 'SEO', 'US', 'USA', 'AI'].includes(upper)) {
        return upper;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

export function extractActualUrl(rawUrl: string): string {
  try {
    if (rawUrl.includes('uddg=')) {
      const param = rawUrl.split('uddg=')[1]?.split('&')[0];
      if (param) return decodeURIComponent(param);
    }
    if (rawUrl.startsWith('//')) return 'https:' + rawUrl;
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export function extractDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}
