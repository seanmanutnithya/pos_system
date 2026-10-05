import { useEffect, useId, useRef, useState } from "react";
import Button from "./Button";
import Icon from "./Icon";
import { cn } from "@/lib/cn";
import { assetUrl, IMAGE_HINT, IMAGE_TYPES, MAX_IMAGE_MB } from "@/lib/images";

// Picks one image, with a preview. Click the preview or the button to choose
// a file, or drop one on the preview.
// value: the saved image's path, null for no image, or { file, url } for a
// newly picked file, where `url` is a temporary preview link.
const ImageField = ({ label, hint = IMAGE_HINT, value, onChange, error }) => {
  const id = useId();
  const inputRef = useRef(null);
  // The preview link of the picked file, freed when it is replaced or the
  // form closes
  const previewUrl = useRef(null);
  const [pickError, setPickError] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );

  const setPicked = (picked) => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = picked?.url ?? null;
    onChange(picked);
  };

  // Same checks as the server, so a wrong file is caught before saving
  const pick = (file) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setPickError("Choose a JPEG, PNG, GIF or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setPickError(`Choose an image of ${MAX_IMAGE_MB} MB or less.`);
      return;
    }
    setPickError(null);
    setPicked({ file, url: URL.createObjectURL(file) });
  };

  const openPicker = () => inputRef.current?.click();
  const src = value == null ? null : typeof value === "string" ? assetUrl(value) : value.url;
  const message = pickError ?? error;

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <div className="flex items-center gap-4">
        {/* A mouse shortcut and drop target; keyboard users use the button */}
        <div
          aria-hidden="true"
          onClick={openPicker}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pick(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border bg-paper text-muted transition-colors",
            src ? "border-line" : "border-dashed border-ink/30 hover:border-brand hover:text-brand",
            dragging && "border-brand text-brand",
          )}
        >
          {src ? (
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <Icon name="image" size={24} />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="upload"
              onClick={openPicker}
              aria-describedby={`${id}-hint`}
            >
              {src ? "Replace Image" : "Upload Image"}
            </Button>
            {src && (
              <Button
                variant="ghost"
                size="sm"
                icon="trash"
                onClick={() => {
                  setPickError(null);
                  setPicked(null);
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        </div>
      </div>
      {message && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-danger">
          <Icon name="alert" size={14} className="shrink-0" />
          {message}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        aria-labelledby={`${id}-label`}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          // Allows picking the same file again after removing it
          event.target.value = "";
        }}
      />
    </div>
  );
};

export default ImageField;
