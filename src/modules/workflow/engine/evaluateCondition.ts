export function evaluateCondition(expression: string | undefined, variables: Record<string, unknown>): boolean | undefined {
  if (!expression?.trim()) {
    return undefined;
  }

  return evaluateLogicalExpression(expression.trim(), variables);
}

function evaluateLogicalExpression(expression: string, variables: Record<string, unknown>): boolean | undefined {
  const orParts = splitByLogicalOperator(expression, "or");
  if (orParts.length > 1) {
    const results = orParts.map((part) => evaluateLogicalExpression(part, variables));
    return results.some((result) => result === true);
  }

  const andParts = splitByLogicalOperator(expression, "and");
  if (andParts.length > 1) {
    const results = andParts.map((part) => evaluateLogicalExpression(part, variables));
    return results.every((result) => result === true);
  }

  return evaluateSingleCondition(stripWrappingParentheses(expression), variables);
}

function splitByLogicalOperator(expression: string, operator: "and" | "or"): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | undefined;
  let start = 0;
  const lower = expression.toLowerCase();
  const token = ` ${operator} `;

  for (let index = 0; index < expression.length; index += 1) {
    const char = expression[index];
    if ((char === "'" || char === "\"") && expression[index - 1] !== "\\") {
      quote = quote === char ? undefined : char;
    }
    if (quote) {
      continue;
    }
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
    }
    if (depth === 0 && lower.slice(index, index + token.length) === token) {
      parts.push(expression.slice(start, index).trim());
      start = index + token.length;
    }
  }

  if (parts.length === 0) {
    return [expression];
  }
  parts.push(expression.slice(start).trim());
  return parts;
}

function stripWrappingParentheses(expression: string): string {
  let normalized = expression.trim();
  while (normalized.startsWith("(") && normalized.endsWith(")")) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function evaluateSingleCondition(expression: string, variables: Record<string, unknown>): boolean | undefined {
  const existsMatch = expression.match(/^exists\(([\w.]+)\)$/i);
  if (existsMatch) {
    return resolvePath(variables, existsMatch[1]) !== undefined;
  }

  const containsMatch = expression.match(/^([\w.]+)\s+contains\s+(.+)$/i);
  if (containsMatch) {
    const actual = resolvePath(variables, containsMatch[1]);
    const expected = parseLiteral(containsMatch[2], variables);
    return Array.isArray(actual) ? actual.includes(expected) : String(actual ?? "").includes(String(expected));
  }

  const inMatch = expression.match(/^(.+)\s+in\s+([\w.]+)$/i);
  if (inMatch) {
    const expected = parseLiteral(inMatch[1], variables);
    const actual = resolvePath(variables, inMatch[2]);
    return Array.isArray(actual) ? actual.includes(expected) : false;
  }

  const match = expression.match(/^([\w.]+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) {
    return undefined;
  }
  const [, key, operator, rawExpected] = match;
  const actual = resolvePath(variables, key);
  const expected = parseLiteral(rawExpected, variables);

  const expectedNumber = Number(expected);
  const actualNumber = Number(actual);
  const compareAsNumber = Number.isFinite(expectedNumber) && Number.isFinite(actualNumber);
  const comparableActual = compareAsNumber ? actualNumber : String(actual);
  const comparableExpected = compareAsNumber ? expectedNumber : String(expected);

  switch (operator) {
    case "==":
      return comparableActual === comparableExpected;
    case "!=":
      return comparableActual !== comparableExpected;
    case ">":
      return comparableActual > comparableExpected;
    case "<":
      return comparableActual < comparableExpected;
    case ">=":
      return comparableActual >= comparableExpected;
    case "<=":
      return comparableActual <= comparableExpected;
    default:
      return undefined;
  }
}

function resolvePath(variables: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, variables);
}

function parseLiteral(raw: string, variables: Record<string, unknown>): unknown {
  const trimmed = raw.trim();
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith("\"") && trimmed.endsWith("\""))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === "true") {
    return true;
  }
  if (trimmed === "false") {
    return false;
  }
  if (trimmed === "null") {
    return null;
  }
  const numberValue = Number(trimmed);
  if (Number.isFinite(numberValue)) {
    return numberValue;
  }
  const variableValue = resolvePath(variables, trimmed);
  return variableValue === undefined ? trimmed : variableValue;
}
