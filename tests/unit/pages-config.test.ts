import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

type Field = { name: string; type?: string; component?: string; fields?: Field[]; list?: unknown };
type Entry = { name: string; type: 'file' | 'collection' | 'group'; path?: string; fields?: Field[]; items?: Entry[] };

const config = existsSync('.pages.yml') ? parse(readFileSync('.pages.yml', 'utf8')) : { content: [] };
const components: Record<string, Field> = config.components ?? {};

function resolve(field: Field): Field {
  if (!field.component) return field;
  const base = components[field.component];
  if (!base) throw new Error(`Unknown component ${field.component}`);
  return { ...base, ...field, component: undefined };
}

/** Every .yml file under a folder, as forward-slash paths. */
function yamlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name).replaceAll('\\', '/');
    if (statSync(path).isDirectory()) return yamlFiles(path);
    return name.endsWith('.yml') ? [path] : [];
  });
}

function files(entries: Entry[]): Entry[] {
  return entries.flatMap((e) => (e.type === 'group' ? files(e.items ?? []) : e.type === 'file' ? [e] : []));
}

/** Every key present in the data must have a matching form field (recursively). */
function uncovered(data: unknown, fields: Field[], path: string): string[] {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  const byName = new Map(fields.map((f) => [f.name, resolve(f)]));
  return Object.entries(data as Record<string, unknown>).flatMap(([key, value]) => {
    const field = byName.get(key);
    if (!field) return [`${path}.${key}`];
    if (field.type !== 'object' || !field.fields) return [];
    const items = Array.isArray(value) ? value : [value];
    return items.flatMap((item) => uncovered(item, field.fields!, `${path}.${key}`));
  });
}

describe('.pages.yml', () => {
  const entries = files(config.content ?? []);

  it('has a form for every content file', () => {
    const configured = new Set(entries.map((e) => e.path));
    const expected = yamlFiles('src/content');
    expect(expected.length).toBeGreaterThan(0);
    for (const path of expected) expect(configured.has(path), path).toBe(true);
  });

  it('stores uploads where the site looks for images', () => {
    expect(config.media).toMatchObject({ input: 'src/assets/images', output: '/src/assets/images' });
  });

  it.each(files(config.content ?? []).map((e) => [e.path!, e] as const))('%s: every value has a form field', (path, entry) => {
    const data = parse(readFileSync(path, 'utf8')) ?? {};
    expect(uncovered(data, entry.fields ?? [], path)).toEqual([]);
  });
});
