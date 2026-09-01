import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";

const MIN_HEIGHT = 88;
const MAX_HEIGHT = 340;
const DEFAULT_HEIGHT = 132;
const MAX_BYTES = 2400000;

const clampHeight = (value) =>
  Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Number(value) || DEFAULT_HEIGHT));

export default function SpiritualImageTile({ shopId, collapsed }) {
  const inputRef = useRef(null);
  const dragRef = useRef(null);
  const baseKey = `wineshop_spiritual_tile_v1_${shopId || "unknown"}`;

  const [image, setImage] = useState("");
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setImage(localStorage.getItem(`${baseKey}_image`) || "");
      setHeight(clampHeight(localStorage.getItem(`${baseKey}_height`) || DEFAULT_HEIGHT));
    } catch {
      setImage("");
      setHeight(DEFAULT_HEIGHT);
    }
  }, [baseKey]);

  function saveHeight(next) {
    const safe = clampHeight(next);
    setHeight(safe);
    try {
      localStorage.setItem(`${baseKey}_height`, String(safe));
    } catch {
      // Optional device persistence.
    }
  }

  function acceptFile(file) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Use JPEG, PNG or WebP.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setMessage("Use an image smaller than 2.4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      try {
        localStorage.setItem(`${baseKey}_image`, value);
        setImage(value);
        setMessage("");
      } catch {
        setMessage("Image is too large for browser storage.");
      }
    };
    reader.onerror = () => setMessage("Unable to read this image.");
    reader.readAsDataURL(file);
  }

  function removeImage(event) {
    event.stopPropagation();
    try {
      localStorage.removeItem(`${baseKey}_image`);
    } catch {
      // Keep UI usable.
    }
    setImage("");
    setMessage("");
  }

  function startResize(event) {
    if (collapsed) return;
    event.preventDefault();

    dragRef.current = {
      y: event.clientY,
      height,
    };

    const move = (moveEvent) => {
      if (!dragRef.current) return;
      setHeight(
        clampHeight(
          dragRef.current.height + moveEvent.clientY - dragRef.current.y,
        ),
      );
    };

    const end = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      setHeight((current) => {
        try {
          localStorage.setItem(`${baseKey}_height`, String(current));
        } catch {
          // Optional persistence.
        }
        return current;
      });
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  }

  if (collapsed) {
    return (
      <div className="spiritual-tile spiritual-tile-collapsed">
        <button
          type="button"
          className="spiritual-collapsed-button"
          onClick={() => inputRef.current?.click()}
          title={image ? "Replace spiritual image" : "Add spiritual image"}
        >
          {image ? <img src={image} alt=""/> : <Plus size={18}/>}
        </button>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => acceptFile(event.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <section
      className={`spiritual-tile${dragOver ? " is-drop-active" : ""}`}
      style={{ height }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        acceptFile(event.dataTransfer.files?.[0]);
      }}
    >
      {image ? (
        <img className="spiritual-image" src={image} alt="Devotional"/>
      ) : (
        <button
          type="button"
          className="spiritual-empty"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={21}/>
          <strong>Add spiritual image</strong>
          <small>Click + or drop image here</small>
        </button>
      )}

      <div className="spiritual-controls">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={image ? "Replace spiritual image" : "Add spiritual image"}
          title={image ? "Replace image" : "Add image"}
        >
          <Plus size={15}/>
        </button>
        {image ? (
          <button
            type="button"
            onClick={removeImage}
            aria-label="Remove spiritual image"
            title="Remove image"
          >
            <Trash2 size={14}/>
          </button>
        ) : null}
      </div>

      {message ? <span className="spiritual-message">{message}</span> : null}

      <div
        className="spiritual-resize-handle"
        role="separator"
        aria-orientation="horizontal"
        tabIndex={0}
        title="Drag up/down to resize"
        onPointerDown={startResize}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            saveHeight(height + 12);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            saveHeight(height - 12);
          }
        }}
      >
        <span/>
      </div>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
    </section>
  );
}
