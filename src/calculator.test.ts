import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, evaluate, format } from './calculator';
import { example } from './example';
const calc = (s: string) => evaluate(s, new Map());
test('arithmetic precedence, signed powers, decimals and percentages', () => {
  for (const [input, expected] of [['2 + 3 * 4', 14], ['(2 + 3) * 4', 20], ['2^3^2', 512], ['-2^2', -4], ['2^-2', .25], ['1e3 * .5', 500], ['100 * (1 + 20%)', 120]] as const) assert.equal(calc(input), expected);
});
test('rounding and nested functions', () => {
  assert.equal(calc('ceil(6.5)'), 7);
  assert.equal(calc('max(2, min(8, 3))'), 3);
  assert.equal(calc('sqrt(9) + abs(-4)'), 7);
});
test('notes stay notes, formulas require trailing equals, and named values flow down', () => {
  const rows = calculate('A note\nx = 10 =\nx / 4 =\nx = 20\nx =\n');
  assert.deepEqual(rows.map(r => r.value), [undefined, 10, 2.5, undefined, 10, undefined]);
});
test('errors are local and invalid redefinitions cannot reuse stale values', () => {
  const rows = calculate('x = 4 =\nx = 1 / 0 =\nx * 2 =\n2 + 2 =');
  assert.match(rows[1].error!, /zero/);
  assert.match(rows[2].error!, /Define x/);
  assert.equal(rows[3].value, 4);
});
test('malformed and executable input is rejected', () => {
  for (const input of ['1/0', 'sqrt(-1)', '2 3', '(2+3', 'ceil(1,2)', 'constructor(1)', 'globalThis.alert(1)', '1;2', '']) assert.throws(() => calc(input));
});
test('coal liquefaction example has correct flow and plant counts', () => {
  const rows = calculate(example);
  assert.equal(rows.filter(r => r.error).length, 0);
  const value = (prefix: string) => rows.find(r => r.source.startsWith(prefix))!.value!;
  assert.equal(value('heavy ='), 130);
  assert.equal(value('light_total ='), 137.5);
  assert.equal(value('ceil(heavy_plants)'), 7);
  assert.equal(value('ceil(light_plants)'), 10);
  assert.ok(Math.abs(value('gas_total =') - 111.66666666666667) < 1e-10);
  assert.equal(format(0.1 + 0.2), '0.3');
});

test('unit labels annotate declarations without changing or propagating through arithmetic', () => {
  const rows = calculate('coal [items/s] = 20 =\nenergy [ MJ / s ] = coal * 4 =\ncoal / 2 =\ncoal [kg] = 3 =\ncoal =');
  assert.deepEqual(rows.map(r => r.value), [20, 80, 10, 3, 3]);
  assert.deepEqual(rows.map(r => r.unit), ['items/s', 'MJ / s', undefined, 'kg', undefined]);
  assert.equal(rows[0].source, 'coal [items/s] = 20 =');
});
test('annotated notes still need a trailing equals and invalid formulas stay errors', () => {
  const rows = calculate('coal [items/s] = 20\ncoal =\nx [MW] = 1 / 0 =\n2 + 2 =');
  assert.equal(rows[0].value, undefined);
  assert.match(rows[1].error!, /Define coal/);
  assert.match(rows[2].error!, /zero/);
  assert.equal(rows[3].value, 4);
});
