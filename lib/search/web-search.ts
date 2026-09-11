/**
 * Universal Web Knowledge Retriever with Generative-Style Synthesizer
 * Retrieves factual knowledge across Wikipedia and web APIs, extracts structured
 * attributes (runtime, release date, director, creator, location, dates) for any entity,
 * and formulates warm, soulful, accurate responses in Nara's voice.
 */

export interface WebSearchResult {
  found: boolean;
  answer: string;
  sourceTitle: string;
  sourceUrl: string;
}

const WIKI_HEADERS = {
  'User-Agent': 'NaraAssistant/1.0 (https://neal367.com; atichatbusiness@gmail.com)',
  Accept: 'application/json',
};

function formatRuntime(minutesStr: string): string {
  const match = minutesStr.match(/\d+/);
  if (!match) return minutesStr;
  const totalMins = parseInt(match[0], 10);
  if (totalMins >= 60) {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${totalMins} minutes (${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` and ${mins} minutes` : ''})`;
  }
  return `${totalMins} minutes`;
}

function parseFilmDates(dateStr: string): string {
  const dateParts = dateStr.match(/\b(19\d\d|20\d\d)\|(\d{1,2})\|(\d{1,2})\b/g);
  if (dateParts && dateParts.length > 0) {
    const months = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const formatted = dateParts.map((p) => {
      const [y, m, d] = p.split('|');
      const monthName = months[parseInt(m, 10)] || m;
      return `${monthName} ${parseInt(d, 10)}, ${y}`;
    });

    if (formatted.length >= 2) {
      return `${formatted[0]} (world premiere) and ${formatted[1]} (theatrical release)`;
    }
    return formatted[0];
  }
  return dateStr.replace(/[{}[\]]/g, '').trim();
}

function extractCoreEntity(query: string): string {
  return query
    .replace(
      /\b(running time|duration|runtime|release date|when was it released|when released|when did it come out|director|who directed|creator|author|who wrote|cast|starring|actors|budget|box office|how long is it|how long was it|how long|what is the)\b/gi,
      ''
    )
    .replace(/[?.,!']/g, '')
    .trim();
}

export async function fetchWebAnswer(
  query: string,
  timeoutMs: number = 4500
): Promise<WebSearchResult | null> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return null;

  const isDurationQuery = /\b(duration|runtime|running time|how long is|how long was|length of)\b/i.test(
    clean
  );
  const isReleaseDateQuery = /\b(release date|when released|when did it come out|when was it released|premiered|release year)\b/i.test(
    clean
  );
  const isDirectorQuery = /\b(director|who directed|directed by)\b/i.test(clean);
  const isCreatorQuery = /\b(who created|creator|who wrote|author|who made)\b/i.test(clean);

  // Derive core entity for search
  const coreEntity = extractCoreEntity(clean);
  const searchTerm = coreEntity.length >= 2 ? coreEntity : clean;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // 1. Search Wikipedia for matching article titles
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      searchTerm
    )}&format=json&utf8=&origin=*`;

    const searchRes = await fetch(searchUrl, {
      signal: controller.signal,
      headers: WIKI_HEADERS,
    });

    if (!searchRes.ok) {
      clearTimeout(timeoutId);
      return null;
    }

    const searchData = await searchRes.json();
    const items = searchData?.query?.search;

    if (!items || !Array.isArray(items) || items.length === 0) {
      clearTimeout(timeoutId);
      return null;
    }

    // Disambiguation preference: if query mentioned movie/film, prefer movie title
    let topItem = items[0];
    if (/\b(movie|film)\b/i.test(clean)) {
      const filmItem = items.find((it: { title: string }) =>
        /\((film|movie)\)/i.test(it.title)
      );
      if (filmItem) {
        topItem = filmItem;
      }
    }

    const topTitle = topItem.title;
    const displayTitle = topTitle.replace(/\s*\([^)]+\)/g, '').trim();

    // 2. Structured attribute extraction for entity properties (runtime, release date, director, creator)
    if (isDurationQuery || isReleaseDateQuery || isDirectorQuery || isCreatorQuery) {
      try {
        const leadWikitextUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles=${encodeURIComponent(
          topTitle
        )}&format=json`;

        const wikitextRes = await fetch(leadWikitextUrl, {
          signal: controller.signal,
          headers: WIKI_HEADERS,
        });

        if (wikitextRes.ok) {
          const wikiData = await wikitextRes.json();
          const pageObj = Object.values(wikiData?.query?.pages || {})[0] as {
            revisions?: Array<{ '*'?: string }>;
          };
          const rawWikitext = pageObj?.revisions?.[0]?.['*'] || '';

          if (isDurationQuery) {
            const runtimeMatch = rawWikitext.match(/\|\s*runtime\s*=\s*([^|\n<]+)/i);
            if (runtimeMatch && runtimeMatch[1]) {
              const formattedTime = formatRuntime(runtimeMatch[1].trim());
              clearTimeout(timeoutId);
              return {
                found: true,
                answer: `🎬 **${displayTitle}** has an official running time of **${formattedTime}**!`,
                sourceTitle: topTitle,
                sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle.replace(/\s+/g, '_'))}`,
              };
            }
          }

          if (isReleaseDateQuery) {
            const filmDateMatch = rawWikitext.match(/\{\{Film date\|([^}]+)\}\}/i);
            const releasedMatch = rawWikitext.match(/\|\s*released\s*=\s*([^|\n<]+)/i);
            const rawDate = filmDateMatch?.[1] || releasedMatch?.[1];

            if (rawDate) {
              const parsedDate = parseFilmDates(rawDate);
              clearTimeout(timeoutId);
              return {
                found: true,
                answer: `✨ **${displayTitle}** was released in **${parsedDate}**!`,
                sourceTitle: topTitle,
                sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle.replace(/\s+/g, '_'))}`,
              };
            }
          }

          if (isDirectorQuery) {
            const directorMatch = rawWikitext.match(/\|\s*director\s*=\s*([^|\n<]+)/i);
            if (directorMatch && directorMatch[1]) {
              const directorName = directorMatch[1].replace(/[\[\]]/g, '').trim();
              clearTimeout(timeoutId);
              return {
                found: true,
                answer: `🎬 **${displayTitle}** was directed by **${directorName}**.`,
                sourceTitle: topTitle,
                sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle.replace(/\s+/g, '_'))}`,
              };
            }
          }

          if (isCreatorQuery) {
            const creatorMatch =
              rawWikitext.match(/\|\s*(creator|author|developer)\s*=\s*([^|\n<]+)/i);
            if (creatorMatch && creatorMatch[2]) {
              const creatorName = creatorMatch[2].replace(/[\[\]]/g, '').trim();
              clearTimeout(timeoutId);
              return {
                found: true,
                answer: `✨ **${displayTitle}** was created by **${creatorName}**.`,
                sourceTitle: topTitle,
                sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle.replace(/\s+/g, '_'))}`,
              };
            }
          }
        }
      } catch {
        // Fall through to summary
      }
    }

    // 3. Natural Page Summary
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        topTitle.replace(/\s+/g, '_')
      )}`;

      const summaryRes = await fetch(summaryUrl, {
        signal: controller.signal,
        headers: WIKI_HEADERS,
      });

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (summaryData.extract && summaryData.type !== 'disambiguation') {
          clearTimeout(timeoutId);

          let formattedAnswer = summaryData.extract;
          if (/\b(film|movie)\b/i.test(topTitle) || /\b(film|movie)\b/i.test(summaryData.description || '')) {
            formattedAnswer = `🎬 **${displayTitle}**:\n\n${summaryData.extract}`;
          } else {
            formattedAnswer = `✨ **${displayTitle}**:\n\n${summaryData.extract}`;
          }

          return {
            found: true,
            answer: formattedAnswer,
            sourceTitle: summaryData.title || topTitle,
            sourceUrl:
              summaryData.content_urls?.desktop?.page ||
              `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle.replace(/\s+/g, '_'))}`,
          };
        }
      }
    } catch {
      // Fallback
    }

    clearTimeout(timeoutId);

    // 4. Fallback snippet
    if (topItem.snippet) {
      const cleanSnippet = topItem.snippet
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();

      return {
        found: true,
        answer: cleanSnippet,
        sourceTitle: topTitle,
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle.replace(/\s+/g, '_'))}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}
