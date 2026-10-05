import { useState } from "react";
import { cn } from "@/lib/cn";
import { assetUrl } from "@/lib/images";

// The first letter of the name stands in when there is no image
const initialOf = (name) => (Array.from(name.trim())[0] ?? "?").toUpperCase();

const tileClasses = "size-9 shrink-0 rounded-lg";

const Thumbnail = ({ title, image, muted }) => {
  // A missing or broken file falls back to the letter tile
  const [failed, setFailed] = useState(false);

  if (image && !failed) {
    return (
      <img
        src={assetUrl(image)}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(tileClasses, "border border-line bg-paper object-cover", muted && "opacity-60")}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        tileClasses,
        "grid place-items-center text-sm font-bold",
        muted ? "bg-paper text-muted" : "bg-brand-soft text-brand-strong",
      )}
    >
      {initialOf(title)}
    </span>
  );
};

// Main cell of a row: the image (or a letter tile), the name, and a second
// line of detail
const RecordCell = ({ title, subtitle, image, muted = false }) => (
  <div className="flex max-w-xs items-center gap-3">
    {/* Keyed by image so a new image gets a fresh try after a broken one */}
    <Thumbnail key={image ?? "none"} title={title} image={image} muted={muted} />
    <div className="min-w-0">
      <p className="truncate font-medium">{title}</p>
      {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
    </div>
  </div>
);

export default RecordCell;
