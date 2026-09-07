export type Result = { source: string; value?: number; unit?: string; error?: string };

// A deliberately small arithmetic grammar: never execute scratchpad text as code.
export function evaluate(source: string, variables: Map<string, number>): number {
  const tokens: string[] = [];
  let rest = source.trim();
  while (rest) {
    const match = /^(?:(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-zA-Z_][a-zA-Z_0-9]*|[+\-*/^(),%])/i.exec(rest);
    if (!match) throw new Error(`Unexpected character: ${rest[0]}`);
    tokens.push(match[0]);
    rest = rest.slice(match[0].length).trimStart();
    if (tokens.length > 500) throw new Error('Formula is too long');
  }
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  function atom(): number {
    const token = take();
    if (token === undefined) throw new Error('Finish the formula');
    if (token === '(') {
      const value = expression();
      if (take() !== ')') throw new Error('Missing closing parenthesis');
      return value;
    }
    if (/^(?:\d|\.)/.test(token)) return Number(token);
    if (/^[a-zA-Z_]/.test(token)) {
      if (peek() === '(') {
        take();
        const args = [expression()];
        while (peek() === ',') { take(); args.push(expression()); }
        if (take() !== ')') throw new Error('Missing closing parenthesis');
        const functions: Record<string, (...values: number[]) => number> = {
          ceil: Math.ceil, floor: Math.floor, round: Math.round,
          abs: Math.abs, sqrt: Math.sqrt, min: Math.min, max: Math.max,
        };
        const fn = Object.hasOwn(functions, token) ? functions[token] : undefined;
        if (!fn) throw new Error(`Unknown function: ${token}`);
        if (!['min', 'max'].includes(token) && args.length !== 1) throw new Error(`${token} takes one value`);
        return fn(...args);
      }
      const value = variables.get(token);
      if (value === undefined) throw new Error(`Define ${token} above this line`);
      return value;
    }
    throw new Error(`Unexpected token: ${token}`);
  }
  function power(): number {
    let value = atom();
    while (peek() === '%') { take(); value /= 100; }
    if (peek() === '^') { take(); value **= unary(); }
    return value;
  }
  function unary(): number {
    if (peek() === '+') { take(); return unary(); }
    if (peek() === '-') { take(); return -unary(); }
    return power();
  }
  function product(): number {
    let value = unary();
    while (peek() === '*' || peek() === '/') {
      const op = take();
      const right = unary();
      if (op === '/' && right === 0) throw new Error('Cannot divide by zero');
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }
  function expression(): number {
    let value = product();
    while (peek() === '+' || peek() === '-') {
      const op = take();
      const right = product();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }
  const value = expression();
  if (position !== tokens.length) throw new Error(`Unexpected token: ${peek()}`);
  if (!Number.isFinite(value)) throw new Error('Result is not a finite number');
  return value;
}

export function calculate(text: string): Result[] {
  const variables = new Map<string, number>();
  return text.split('\n').map((source) => {
    if (!source.trimEnd().endsWith('=')) return { source };
    const formula = source.trim().slice(0, -1).trim();
    const assignment = /^([a-zA-Z_][a-zA-Z_0-9]*)\s*(?:\[([^\[\]]+)\]\s*)?=\s*(.*)$/.exec(formula);
    if (assignment) variables.delete(assignment[1]);
    try {
      const value = evaluate(assignment ? assignment[3] : formula, variables);
      if (assignment) variables.set(assignment[1], value);
      return { source, value, unit: assignment?.[2]?.trim() || undefined };
    } catch (error) {
      return { source, error: error instanceof Error ? error.message : 'Invalid formula' };
    }
  });
}

export function format(value: number): string {
  return Number(value.toPrecision(10)).toLocaleString('en-US', { maximumSignificantDigits: 10 });
}
