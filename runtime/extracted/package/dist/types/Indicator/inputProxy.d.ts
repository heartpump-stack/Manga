import type { IPineInput } from './types';
/**
 * Build the live `.input` view exposed on an `Indicator` instance.
 *
 * Keyed by **varId** (the assigned variable name) as the canonical, primary
 * override key, with the input's **title** registered as a secondary alias.
 * This makes every input overridable by a stable, unique handle — robust to
 * empty or duplicated titles — while `.input['Title']` keeps working for the
 * common case (unique, non-empty titles). When two inputs share a title, the
 * title aliases the first; the second is reachable only by its varId.
 *
 * Backing machinery lives in `keyedProxy.ts` and is shared with `.prop`.
 */
export declare function buildInputProxy(metas: IPineInput[], onSet?: (key: string) => void): {
    proxy: Record<string, unknown>;
    values: Record<string, unknown>;
    metaByKey: Map<string, IPineInput>;
};
