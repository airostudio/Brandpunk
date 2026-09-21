type TapeProps = {
  className?: string;
  rotate?: number;
};

/** A little scrap of duct tape, for pinning stickers/cards to the page. */
export function Tape({ className = "", rotate = -3 }: TapeProps) {
  return (
    <span
      aria-hidden="true"
      className={`tape pointer-events-none block h-6 w-20 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}
