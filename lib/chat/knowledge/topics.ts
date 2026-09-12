import { CORE_TOPICS } from './topics/core-topics';
import { JS_TS_TOPICS } from './topics/js-ts-topics';
import { WEB_FRAMEWORK_TOPICS } from './topics/web-framework-topics';
import type { DetailedTopic } from './topics/types';

export type { DetailedTopic } from './topics/types';
export { CONCEPTS } from './topics/concepts-dict';

export const TOPICS: DetailedTopic[] = [
  ...CORE_TOPICS,
  ...JS_TS_TOPICS,
  ...WEB_FRAMEWORK_TOPICS,
];
