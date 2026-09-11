const definition = /^\s*([a-zA-Z_][a-zA-Z_0-9]*)\s*(?:\[[^\[\]]+\]\s*)?=/;
const identifier = /^[a-zA-Z_][a-zA-Z_0-9]*$/;

export function variableNames(text: string): string[] {
  return [...new Set(text.split('\n').flatMap(line => {
    if (!line.trimEnd().endsWith('=')) return [];
    const match = definition.exec(line.trimEnd().slice(0, -1));
    return match ? [match[1]] : [];
  }))];
}

// Match units and numbers first so their text can never become variable references.
function mapReferences(line: string, replace: (name: string) => string): string {
  if (!line.trimEnd().endsWith('=')) return line;
  return line.replace(/\[[^\]]*\]|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-zA-Z_][a-zA-Z_0-9]*/gi,
    (token: string, offset: number) => {
      if (!identifier.test(token) || /^\s*\(/.test(line.slice(offset + token.length))) return token;
      return replace(token);
    });
}

export function renameVariable(text: string, from: string, to: string): string {
  if (!identifier.test(to)) throw new Error('Use letters, numbers and underscores, starting with a letter or underscore.');
  if (!variableNames(text).includes(from)) throw new Error('Choose a variable defined in your notes.');
  if (from === to) throw new Error('Choose a different name.');
  let collision = false;
  for (const line of text.split('\n')) mapReferences(line, name => {
    if (name === to) collision = true;
    return name;
  });
  if (collision) throw new Error(`${to} is already used in a formula. Choose another name.`);
  return text.split('\n').map(line => mapReferences(line, name => name === from ? to : name)).join('\n');
}
