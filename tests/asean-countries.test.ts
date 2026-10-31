import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ASEAN_MEMBERS,
  ASEAN_LOGO_SRC,
  getMember,
  countStartupsByCountry,
} from '../src/data/aseanCountries';
import { ALL_STARTUPS } from '../src/data/startups';
import type { ASEANCountry } from '../src/types';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, '..', 'public');
const publicPath = (src: string) => path.join(publicDir, src.replace(/^\//, ''));

test('ASEAN_MEMBERS has exactly 11 unique codes including TL', () => {
  const codes = ASEAN_MEMBERS.map((m) => m.code);
  assert.strictEqual(codes.length, 11);
  assert.strictEqual(new Set(codes).size, 11);
  assert.ok(codes.includes('TL'));
});

test('ASEAN_MEMBERS is sorted alphabetically by name', () => {
  const names = ASEAN_MEMBERS.map((m) => m.name);
  assert.deepStrictEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
});

test('every flag file exists under public/', () => {
  for (const m of ASEAN_MEMBERS) {
    assert.ok(fs.existsSync(publicPath(m.flagSrc)), `missing flag for ${m.code}: ${m.flagSrc}`);
  }
});

test('ASEAN logo file exists under public/', () => {
  assert.ok(fs.existsSync(publicPath(ASEAN_LOGO_SRC)));
});

test('getMember is case-insensitive', () => {
  assert.strictEqual(getMember('SG')?.name, 'Singapore');
  assert.strictEqual(getMember('sg')?.name, 'Singapore');
  assert.strictEqual(getMember('XX'), undefined);
});

test('every ASEANCountry value resolves via getMember', () => {
  const values: ASEANCountry[] = ['SG', 'MY', 'ID', 'VN', 'TH', 'PH'];
  for (const v of values) assert.ok(getMember(v), `unresolved ${v}`);
});

test('countStartupsByCountry covers all startups and all 11 keys', () => {
  const counts = countStartupsByCountry(ALL_STARTUPS);
  assert.strictEqual(Object.keys(counts).length, 11);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.strictEqual(total, ALL_STARTUPS.length);
  assert.strictEqual(counts.BN, 0);
});
