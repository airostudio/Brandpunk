type TornDividerProps = {
  color?: string;
  flip?: boolean;
  className?: string;
};

/**
 * A jagged "ripped paper" strip. Renders as an SVG so the tear stays crisp
 * at any width instead of relying on a hand-tuned clip-path.
 */
export function TornDivider({ color = "var(--background)", flip = false, className = "" }: TornDividerProps) {
  const teeth = 26;
  const points: string[] = ["0,0"];
  for (let i = 0; i <= teeth; i++) {
    const x = (i / teeth) * 100;
    const y = i % 2 === 0 ? 30 : 100;
    points.push(`${x},${y}`);
  }
  points.push("100,0");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`block h-5 w-full sm:h-7 ${flip ? "-scale-y-100" : ""} ${className}`}
      aria-hidden="true"
    >
      <polygon points={points.join(" ")} fill={color} />
    </svg>
  );
}
