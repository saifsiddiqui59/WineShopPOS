import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const IMG_KEY = "wsp_spirit_tile_image";
const H_KEY = "wsp_spirit_tile_height";

export default function SidebarExtras({ collapsed = false }) {
  const fileRef = useRef(null);
  const [image, setImage] = useState("");
  const [height, setHeight] = useState(150);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    try {
      const storedImage = localStorage.getItem(IMG_KEY) || "";
      const storedHeight = Number(localStorage.getItem(H_KEY) || "150");
      setImage(storedImage);
      setHeight(Math.min(260, Math.max(92, storedHeight || 150)));
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    function onMove(event) {
      if (!dragging) return;
      const y = event.touches?.[0]?.clientY ?? event.clientY;
      const host = document.querySelector(".sidebar-spirit-tile");
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const nextHeight = Math.min(260, Math.max(92, y - rect.top));
      setHeight(nextHeight);
      try {
        localStorage.setItem(H_KEY, String(nextHeight));
      } catch {}
    }

    function stop() {
      setDragging(false);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", stop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", stop);
    };
  }, [dragging]);

  function chooseFile() {
    fileRef.current?.click();
  }

  function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setImage(value);
      try {
        localStorage.setItem(IMG_KEY, value);
      } catch {}
    };
    reader.readAsDataURL(file);
  }

  function removeImage(event) {
    event.stopPropagation();
    setImage("");
    try {
      localStorage.removeItem(IMG_KEY);
    } catch {}
  }

  return (
    <div className={`sidebar-extras${collapsed ? " sidebar-extras-collapsed" : ""}`}>
      <div
        className={`sidebar-spirit-tile${image ? " has-image" : ""}${collapsed ? " is-collapsed" : ""}`}
        style={{ "--spirit-tile-height": `${collapsed ? 88 : height}px` }}
      >
        <div className="spirit-tile-header">
          {!collapsed ? <span>Devotional Tile</span> : <span className="sr-only">Devotional Tile</span>}
          {!collapsed && image ? (
            <button
              type="button"
              className="spirit-tile-remove"
              aria-label="Remove devotional image"
              title="Remove devotional image"
              onClick={removeImage}
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className="spirit-tile-content"
          onClick={chooseFile}
          title={image ? "Replace devotional image" : "Add devotional image"}
        >
          {image ? (
            <img src={image} alt="Devotional tile" className="spirit-tile-image" />
          ) : (
            <span className="spirit-tile-empty">
              <Plus size={collapsed ? 18 : 24} />
              {!collapsed ? <span>Add image</span> : null}
            </span>
          )}
        </button>

        {!collapsed ? (
          <button
            type="button"
            className="spirit-tile-resize"
            aria-label="Drag to change devotional tile height"
            title="Drag to change devotional tile height"
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
          >
            <span />
          </button>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          hidden
        />
      </div>
    </div>
  );
}
