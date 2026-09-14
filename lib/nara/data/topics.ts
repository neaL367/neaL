import { GAMES_TOPICS } from './topics/rockstar-games-topics';
import { ROCKSTAR_COMPANY_TOPICS } from './topics/rockstar-company-topics';
import { GTA_VI_ERA_TOPICS } from './topics/gta-vi-era-topics';
import { ROCKSTAR_TECH_TOPICS } from './topics/rockstar-tech-topics';
import { GTA_DEEP_TOPICS } from './topics/rockstar-gta-deep-topics';
import { FRANCHISES_DEEP_TOPICS } from './topics/rockstar-franchises-deep-topics';
import { PEOPLE_STUDIOS_TOPICS } from './topics/rockstar-people-studios-topics';
import { IMPACT_DEEP_TOPICS } from './topics/rockstar-impact-deep-topics';
import type { DetailedTopic } from './topics/types';

export type { DetailedTopic } from './topics/types';
export { CONCEPTS_DICT as CONCEPTS } from './topics/concepts-dict';

/**
 * The site's answerable subjects.
 *
 * The former JavaScript/TypeScript/React/CSS topic curriculum was removed along
 * with the quiz feature; the site now covers Rockstar Games. Every remaining
 * topic is either a Rockstar subject or describes this site's own author.
 *
 * `GTA_VI_ERA_TOPICS` is kept separate because everything in it is volatile —
 * an unreleased game, an active labour dispute, moving sales figures. Grouping
 * the time-sensitive entries makes re-verification a single pass.
 *
 * `ROCKSTAR_TECH_TOPICS` carries the deep RAGE/middleware entries and REPLACES
 * the three short stubs of the same id in `ROCKSTAR_COMPANY_TOPICS`
 * (rage-engine, euphoria, open-world-design). The stubs stay in their file for
 * history but are filtered here so ids stay unique — one topic per concept.
 */
const TECH_IDS = new Set(ROCKSTAR_TECH_TOPICS.map(t => t.id));
const COMPANY_DEDUPED = ROCKSTAR_COMPANY_TOPICS.filter(t => !TECH_IDS.has(t.id));

export const TOPICS: DetailedTopic[] = [
  ...GAMES_TOPICS,
  ...COMPANY_DEDUPED,
  ...GTA_VI_ERA_TOPICS,
  ...ROCKSTAR_TECH_TOPICS,
  ...GTA_DEEP_TOPICS,
  ...FRANCHISES_DEEP_TOPICS,
  ...PEOPLE_STUDIOS_TOPICS,
  ...IMPACT_DEEP_TOPICS,
];
