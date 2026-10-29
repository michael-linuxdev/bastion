// Kontrastverhältnis nach WCAG 2.x für Farben wie „#1f7a72“.

function leuchtdichte(farbe: string): number {
  const kanal = (i: number) => {
    const v = parseInt(farbe.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanal(1) + 0.7152 * kanal(3) + 0.0722 * kanal(5);
}

/** 1 (gleich) bis 21 (Schwarz auf Weiß). */
export function kontrast(a: string, b: string): number {
  const [hell, dunkel] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hell + 0.05) / (dunkel + 0.05);
}
