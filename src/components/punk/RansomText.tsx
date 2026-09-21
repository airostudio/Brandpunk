const WORD_STYLES = [
  { font: "font-display", color: "text-foreground", rotate: -2 },
  { font: "font-display", color: "text-accent", rotate: 1.5 },
  { font: "font-marker", color: "text-accent-2", rotate: -1 },
  { font: "font-display", color: "text-accent-3", rotate: 2 },
];

type RansomTextProps = {
  text: string;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
};

/**
 * Ransom-note headline: each word gets a different cut-out font, color, and
 * tilt, like it was scissored from separate magazine pages.
 */
export function RansomText({ text, as = "h1", className = "" }: RansomTextProps) {
  const Tag = as;
  const words = text.split(" ");

  return (
    <Tag className={`leading-[0.95] ${className}`}>
      {words.map((word, i) => {
        const style = WORD_STYLES[i % WORD_STYLES.length];
        return (
          <span
            key={`${word}-${i}`}
            className={`${style.font} ${style.color} mr-[0.22em] inline-block last:mr-0`}
            style={{ transform: `rotate(${style.rotate}deg)` }}
          >
            {word}
          </span>
        );
      })}
    </Tag>
  );
}
