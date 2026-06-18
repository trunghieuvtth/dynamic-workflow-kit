export function evaluateCondition(expression: string | undefined, variables: Record<string, unknown>): boolean | undefined {
  if (!expression?.trim()) {
    return undefined;
  }

  const normalized = expression.trim();
  const match = normalized.match(/^([\w.]+)\s*(==|!=|>=|<=|>|<)\s*['"]?([^'"]+)['"]?$/);
  if (!match) {
    return undefined;
  }

  const [, key, operator, rawExpected] = match;
  const actual = key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, variables);

  const expectedNumber = Number(rawExpected);
  const actualNumber = Number(actual);
  const compareAsNumber = Number.isFinite(expectedNumber) && Number.isFinite(actualNumber);
  const expected = compareAsNumber ? expectedNumber : rawExpected;
  const comparableActual = compareAsNumber ? actualNumber : String(actual);

  switch (operator) {
    case "==":
      return comparableActual === expected;
    case "!=":
      return comparableActual !== expected;
    case ">":
      return compareAsNumber ? actualNumber > expectedNumber : String(actual) > rawExpected;
    case "<":
      return compareAsNumber ? actualNumber < expectedNumber : String(actual) < rawExpected;
    case ">=":
      return compareAsNumber ? actualNumber >= expectedNumber : String(actual) >= rawExpected;
    case "<=":
      return compareAsNumber ? actualNumber <= expectedNumber : String(actual) <= rawExpected;
    default:
      return undefined;
  }
}

