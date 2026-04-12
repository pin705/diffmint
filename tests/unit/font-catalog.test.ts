import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fontVariables } from '../../apps/web/src/components/themes/font.config.ts';

const fontConfigPath = path.resolve(process.cwd(), 'apps/web/src/components/themes/font.config.ts');

describe('font catalog', () => {
  it('keeps the layout font class stable for offline builds', () => {
    expect(fontVariables).toBe('diffmint-font-catalog');
  });

  it('avoids Google font imports during build', () => {
    const source = readFileSync(fontConfigPath, 'utf8');

    expect(source).not.toContain('next/font/google');
  });
});
