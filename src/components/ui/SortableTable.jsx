import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function textOf(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (!isValidElement(node)) return "";
  if (["input", "select", "textarea"].includes(node.type)) {
    return String(node.props?.value ?? "");
  }
  return textOf(node.props?.children);
}

function comparable(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const numeric = text.replace(/[₹$€£,%]/g, "").replace(/,/g, "").trim();
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(numeric)) {
    return { kind: "number", value: Number(numeric) };
  }
  if (
    /^\d{4}-\d{2}-\d{2}/.test(text) ||
    /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(text) ||
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(text)
  ) {
    const n = Date.parse(text);
    if (Number.isFinite(n)) return { kind: "number", value: n };
  }
  return { kind: "text", value: text };
}

function compare(a, b) {
  const x = comparable(a);
  const y = comparable(b);
  if (x.kind === "number" && y.kind === "number") return x.value - y.value;
  return String(x.value).localeCompare(String(y.value), "en", {
    numeric: true,
    sensitivity: "base",
  });
}

function cellText(row, index) {
  if (!isValidElement(row)) return "";
  return textOf(Children.toArray(row.props?.children)[index]);
}

function sortable(th) {
  if (!isValidElement(th) || th.props?.["data-sort"] === "false") return false;
  const label = textOf(th.props?.children).trim();
  return Boolean(label) && !/^(action|actions|view|details)$/i.test(label);
}

function readWidths(key) {
  if (!key) return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(`wineshop_table_widths:${key}`) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function SortableTable({
  children,
  showSerial = true,
  resizeKey = "",
  defaultColumnWidths = [],
  minColumnWidth = 72,
  maxColumnWidth = 640,
  ...props
}) {
  const [sort, setSort] = useState({ column: null, direction: "asc" });
  const [widths, setWidths] = useState(() => readWidths(resizeKey));
  const dragRef = useRef(null);

  useEffect(() => {
    if (!resizeKey) return;
    try {
      localStorage.setItem(`wineshop_table_widths:${resizeKey}`, JSON.stringify(widths));
    } catch {
      // Browser storage is a convenience only.
    }
  }, [resizeKey, widths]);

  useEffect(() => {
    function move(event) {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = event.clientX - drag.startX;
      const next = Math.max(
        minColumnWidth,
        Math.min(maxColumnWidth, Math.round(drag.startWidth + delta)),
      );
      setWidths((current) => ({ ...current, [drag.displayColumn]: next }));
    }

    function up() {
      dragRef.current = null;
      document.body.classList.remove("table-column-resizing");
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.classList.remove("table-column-resizing");
    };
  }, [minColumnWidth, maxColumnWidth]);

  const parts = Children.toArray(children);
  const hi = parts.findIndex((x) => isValidElement(x) && x.type === "thead");
  const bi = parts.findIndex((x) => isValidElement(x) && x.type === "tbody");

  const defaults = useMemo(() => {
    const map = {};
    defaultColumnWidths.forEach((value, index) => {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) {
        map[index + (showSerial ? 1 : 0)] = Math.max(
          minColumnWidth,
          Math.min(maxColumnWidth, n),
        );
      }
    });
    if (showSerial) map[0] = 68;
    return map;
  }, [defaultColumnWidths, showSerial, minColumnWidth, maxColumnWidth]);

  if (hi < 0 || bi < 0) return <table {...props}>{children}</table>;

  const head = parts[hi];
  const body = parts[bi];
  const firstHeadRow = Children.toArray(head.props.children).find(
    (row) => isValidElement(row) && row.type === "tr",
  );
  const originalColumnCount = firstHeadRow
    ? Children.toArray(firstHeadRow.props.children).length
    : 0;
  const displayColumnCount = originalColumnCount + (showSerial ? 1 : 0);

  function widthFor(displayColumn) {
    const custom = Number(widths[displayColumn]);
    if (Number.isFinite(custom) && custom > 0) return custom;
    const fallback = Number(defaults[displayColumn]);
    return Number.isFinite(fallback) && fallback > 0 ? fallback : undefined;
  }

  function beginResize(event, displayColumn) {
    if (!resizeKey || (displayColumn === 0 && showSerial)) return;
    event.preventDefault();
    event.stopPropagation();
    const th = event.currentTarget.closest("th");
    const currentWidth =
      th?.getBoundingClientRect().width || widthFor(displayColumn) || 120;
    dragRef.current = {
      displayColumn,
      startX: event.clientX,
      startWidth: currentWidth,
    };
    document.body.classList.add("table-column-resizing");
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function decorateHeader(th, originalColumn) {
    if (!isValidElement(th)) return th;
    const displayColumn = originalColumn + (showSerial ? 1 : 0);
    const active = sort.column === originalColumn;
    const canSort = sortable(th);
    const arrow = !active ? "↕" : sort.direction === "asc" ? "↑" : "↓";
    const headerContent = canSort ? (
      <button
        type="button"
        className={`table-sort-button${active ? " active" : ""}`}
        onClick={() =>
          setSort((s) => ({
            column: originalColumn,
            direction:
              s.column === originalColumn && s.direction === "asc" ? "desc" : "asc",
          }))
        }
      >
        <span>{th.props.children}</span>
        <span className="table-sort-arrow" aria-hidden="true">{arrow}</span>
      </button>
    ) : th.props.children;

    return cloneElement(
      th,
      {
        ...th.props,
        style: {
          ...th.props.style,
          width: widthFor(displayColumn),
          minWidth: widthFor(displayColumn),
        },
      },
      <>
        {headerContent}
        {resizeKey ? (
          <span
            className="table-column-resizer"
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${textOf(th.props.children) || "column"}`}
            onPointerDown={(event) => beginResize(event, displayColumn)}
          />
        ) : null}
      </>,
    );
  }

  const headRows = Children.toArray(head.props.children).map((row) => {
    if (!isValidElement(row) || row.type !== "tr") return row;
    const headers = Children.toArray(row.props.children).map((th, column) =>
      decorateHeader(th, column),
    );
    const serial = showSerial ? (
      <th
        key="__sr"
        data-sort="false"
        className="table-serial-column"
        style={{ width: widthFor(0), minWidth: widthFor(0) }}
      >
        Sr. No.
      </th>
    ) : null;
    return cloneElement(row, row.props, showSerial ? [serial, ...headers] : headers);
  });

  const rows = Children.toArray(body.props.children);
  if (sort.column != null) {
    rows.sort((a, b) => {
      const c = compare(cellText(a, sort.column), cellText(b, sort.column));
      return sort.direction === "asc" ? c : -c;
    });
  }

  const displayRows = rows.map((row, index) => {
    if (!isValidElement(row) || row.type !== "tr") return row;
    const cells = Children.toArray(row.props.children);
    if (
      cells.length === 1 &&
      isValidElement(cells[0]) &&
      cells[0].props?.colSpan
    ) {
      return cloneElement(
        row,
        row.props,
        cloneElement(cells[0], {
          ...cells[0].props,
          colSpan: Number(cells[0].props.colSpan) + (showSerial ? 1 : 0),
        }),
      );
    }

    const styledCells = cells.map((cell, originalColumn) => {
      if (!isValidElement(cell)) return cell;
      const displayColumn = originalColumn + (showSerial ? 1 : 0);
      return cloneElement(cell, {
        ...cell.props,
        style: {
          ...cell.props.style,
          width: widthFor(displayColumn),
          minWidth: widthFor(displayColumn),
        },
      });
    });

    return cloneElement(
      row,
      row.props,
      showSerial
        ? [
            <td
              key="__sr_cell"
              className="table-serial-column"
              style={{ width: widthFor(0), minWidth: widthFor(0) }}
            >
              {index + 1}
            </td>,
            ...styledCells,
          ]
        : styledCells,
    );
  });

  const next = [...parts];
  next[hi] = cloneElement(head, head.props, headRows);
  next[bi] = cloneElement(body, body.props, displayRows);

  const colgroup = (
    <colgroup>
      {Array.from({ length: displayColumnCount }, (_, displayColumn) => (
        <col
          key={displayColumn}
          style={
            widthFor(displayColumn)
              ? { width: widthFor(displayColumn), minWidth: widthFor(displayColumn) }
              : undefined
          }
        />
      ))}
    </colgroup>
  );

  const tableClass = [props.className, resizeKey ? "resizable-table" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {resizeKey ? (
        <div className="table-column-controls">
          <span>Drag column dividers to resize.</span>
          <button
            type="button"
            className="secondary-button table-reset-widths"
            onClick={() => {
              setWidths({});
              try {
                localStorage.removeItem(`wineshop_table_widths:${resizeKey}`);
              } catch {
                // no-op
              }
            }}
          >
            Reset column widths
          </button>
        </div>
      ) : null}
      <table {...props} className={tableClass}>
        {colgroup}
        {next}
      </table>
    </>
  );
}
