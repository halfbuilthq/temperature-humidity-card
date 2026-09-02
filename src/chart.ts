export const CHART_WIDTH = 120;
export const CHART_HEIGHT = 34;

export function nearestChartPointIndex(
  clientX: number,
  left: number,
  width: number,
  pointCount: number
): number {
  if (pointCount <= 1 || width <= 0) return 0;
  const progress = Math.min(1, Math.max(0, (clientX - left) / width));
  return Math.round(progress * (pointCount - 1));
}

export function chartPositionPercent(index: number, pointCount: number): number {
  if (pointCount <= 1) return 0;
  return (Math.min(pointCount - 1, Math.max(0, index)) / (pointCount - 1)) * 100;
}

function sparklineCoordinates(
  values: Array<number | undefined>
): Array<[number, number] | undefined> {
  const numeric = values.filter((value): value is number => value !== undefined);
  if (numeric.length === 0) return values.map(() => undefined);

  const minimum = Math.min(...numeric);
  const maximum = Math.max(...numeric);
  const range = Math.max(0.5, maximum - minimum);
  return values.map((value, index) =>
    value === undefined
      ? undefined
      : [
          (index / Math.max(1, values.length - 1)) * CHART_WIDTH,
          CHART_HEIGHT - ((value - minimum) / range) * (CHART_HEIGHT - 4) - 2
        ]
  );
}

export function sparklinePoint(
  values: Array<number | undefined>,
  index: number
): [number, number] | undefined {
  return sparklineCoordinates(values)[index];
}

export function sparklinePath(values: Array<number | undefined>): string {
  const coordinates = sparklineCoordinates(values)
    .filter((point): point is [number, number] => point !== undefined);

  if (coordinates.length === 0) return "";

  if (coordinates.length === 1) {
    return `M 0 ${coordinates[0][1]} L ${CHART_WIDTH} ${coordinates[0][1]}`;
  }

  return coordinates.slice(1).reduce((path, [x, y], index) => {
    const [previousX, previousY] = coordinates[index];
    const midpoint = (previousX + x) / 2;
    return `${path} C ${midpoint} ${previousY}, ${midpoint} ${y}, ${x} ${y}`;
  }, `M ${coordinates[0][0]} ${coordinates[0][1]}`);
}
