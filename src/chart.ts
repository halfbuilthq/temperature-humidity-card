export const CHART_WIDTH = 120;
export const CHART_HEIGHT = 34;

export function sparklinePath(values: Array<number | undefined>): string {
  const numeric = values.filter((value): value is number => value !== undefined);
  if (numeric.length === 0) return "";

  const minimum = Math.min(...numeric);
  const maximum = Math.max(...numeric);
  const range = Math.max(0.5, maximum - minimum);
  const coordinates = values
    .map((value, index) =>
      value === undefined
        ? undefined
        : ([
            (index / Math.max(1, values.length - 1)) * CHART_WIDTH,
            CHART_HEIGHT - ((value - minimum) / range) * (CHART_HEIGHT - 4) - 2
          ] as [number, number])
    )
    .filter((point): point is [number, number] => point !== undefined);

  if (coordinates.length === 1) {
    return `M 0 ${coordinates[0][1]} L ${CHART_WIDTH} ${coordinates[0][1]}`;
  }

  return coordinates.slice(1).reduce((path, [x, y], index) => {
    const [previousX, previousY] = coordinates[index];
    const midpoint = (previousX + x) / 2;
    return `${path} C ${midpoint} ${previousY}, ${midpoint} ${y}, ${x} ${y}`;
  }, `M ${coordinates[0][0]} ${coordinates[0][1]}`);
}
