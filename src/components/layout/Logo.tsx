import { Link } from "react-router-dom";

const PORTRAIT_SRC = "/meta/portrait.png";

export function Logo({
  size = 40,
  className = "",
  linked = false,
}: {
  size?: number;
  className?: string;
  linked?: boolean;
}) {
  const image = (
    <img
      src={PORTRAIT_SRC}
      alt="Obed Prince Kofi Yesu"
      width={size}
      height={size}
      className={`rounded-[22%] object-cover shadow-sm ${className}`}
    />
  );

  if (linked) {
    return (
      <Link to="/" className="inline-flex shrink-0 transition hover:opacity-90" aria-label="Home">
        {image}
      </Link>
    );
  }

  return image;
}
