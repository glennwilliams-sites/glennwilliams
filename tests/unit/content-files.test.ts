// Only checks that every content file can be read. What the files say is Glenn's business.
import { describe, expect, it } from 'vitest';
import { content } from '../../src/lib/content';

describe('content files', () => {
  it.each(Object.entries(content))('%s parses', (_, load) => {
    expect(() => load()).not.toThrow();
  });
});
