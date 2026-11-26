export const SECTOR_COLORS = {
  financial: '#1565c0',
  energy: '#f9a825',
  materials: '#8d6e63',
  health: '#2e7d32',
  utilities: '#00838f',
  real_estate: '#6a1b9a',
  industrials: '#455a64',
  consumer: '#c2185b',
  technology: '#3949ab',
  communication: '#5d4037',
  other: '#9e9e9e',
};

export function pieSegments(groups) {
  let angle = 0;
  return groups.map((group) => {
    const startAngle = angle;
    angle += group.allocation * 360;
    return {
      sector: group.sector,
      percentage: group.allocation * 100,
      color: SECTOR_COLORS[group.sector] ?? SECTOR_COLORS.other,
      startAngle,
      endAngle: angle,
    };
  });
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

export function arcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}
