/**
 * Safe, deterministic recursive-descent math evaluator.
 * Evaluates basic arithmetic (+, -, *, /, %), powers (^, **), and percentages (N%, X% of Y)
 * without using Function() eval or external dependencies.
 */
export function evaluateMathExpression(raw: string): number | null {
  const clean = raw
    .replace(/\btimes\b|\bx\b/gi, '*')
    .replace(/\bplus\b/gi, '+')
    .replace(/\bminus\b/gi, '-')
    .replace(/\bdivided\s+by\b/gi, '/')
    .replace(/\bmod(?:ulo)?\b/gi, '%')
    .replace(/\^/g, '**')
    .trim();

  // 1. Percentage-of pattern: "15% of 80" or "20% * 150"
  const pctOf = clean.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:of|\*)\s*(\d+(?:\.\d+)?)$/i);
  if (pctOf) {
    const res = (parseFloat(pctOf[1]) / 100) * parseFloat(pctOf[2]);
    return Number.isInteger(res) ? res : parseFloat(res.toFixed(4));
  }

  // 2. Convert standalone N% in arithmetic into (N/100)
  const converted = clean.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // Tokenize operators and numbers safely
  const tokens = converted.match(/\*\*|\d+(?:\.\d+)?|[+*/%()\-]/g);
  if (!tokens || tokens.join('').length !== converted.replace(/\s+/g, '').length) return null;

  let idx = 0;
  const peek = () => tokens[idx];
  const consume = () => tokens[idx++];

  function parseExpr(): number {
    let val = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const rhs = parseTerm();
      val = op === '+' ? val + rhs : val - rhs;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parsePower();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = consume();
      const rhs = parsePower();
      if (op === '*') val *= rhs;
      else if (op === '/') {
        if (rhs === 0) throw new Error('div 0');
        val /= rhs;
      } else if (op === '%') {
        val %= rhs;
      }
    }
    return val;
  }

  function parsePower(): number {
    let val = parseFactor();
    if (peek() === '**') {
      consume();
      val = Math.pow(val, parsePower());
    }
    return val;
  }

  function parseFactor(): number {
    const t = consume();
    if (t === '+') return parseFactor();
    if (t === '-') return -parseFactor();
    if (t === '(') {
      const val = parseExpr();
      if (consume() !== ')') throw new Error('unmatched (');
      return val;
    }
    const num = parseFloat(t);
    if (isNaN(num)) throw new Error('expected number');
    return num;
  }

  try {
    const res = parseExpr();
    if (idx !== tokens.length) return null;
    return Number.isInteger(res) ? res : parseFloat(res.toFixed(4));
  } catch {
    return null;
  }
}
