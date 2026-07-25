import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildAlmanac, toIso } from "./lib/almanac";

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function addDays(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta);
}

// Read a date from the URL's ?d=YYYY-MM-DD (for shareable links).
function dateFromUrl(): Date | null {
  const raw = new URLSearchParams(window.location.search).get("d");
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, dd] = raw.split("-").map(Number);
  const dt = new Date(y, m - 1, dd);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export default function App() {
  const [date, setDate] = useState<Date>(() => dateFromUrl() ?? startOfToday());
  const almanac = useMemo(() => buildAlmanac(date), [date]);
  const { fortune, history, doItems, dontItems } = almanac;

  const isToday = almanac.isoDate === toIso(startOfToday());

  const sheetRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Keep the URL in sync with the date so the current page is copy-and-shareable.
  useEffect(() => {
    const url = `${window.location.pathname}?d=${almanac.isoDate}`;
    window.history.replaceState(null, "", url);
  }, [almanac.isoDate]);

  const shareUrl = `${window.location.origin}${window.location.pathname}?d=${almanac.isoDate}`;

  async function handleDownload() {
    if (!sheetRef.current || busy) return;
    setBusy(true);
    try {
      // skipFonts: use system fonts only and skip html-to-image's font embedding
      // (that step is slow and can hang).
      // Fill the rounded-corner gaps with the current theme's paper color so the
      // PNG matches light or dark mode.
      const paper =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--paper")
          .trim() || "#f4ece0";
      const dataUrl = await toPng(sheetRef.current, {
        pixelRatio: 2,
        backgroundColor: paper,
        skipFonts: true,
      });
      const a = document.createElement("a");
      a.download = `chorders-almanac-${almanac.isoDate}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      window.alert("Could not generate the image. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Some browsers need a user gesture or HTTPS; fall back to a manual prompt.
      window.prompt("Copy this link to share:", shareUrl);
    }
  }

  return (
    <div className="app">
      <div className="toolbar">
        <button
          onClick={() => setDate((d) => addDays(d, -1))}
          aria-label="Previous day"
        >
          ‹ Prev
        </button>
        <input
          type="date"
          value={almanac.isoDate}
          onChange={(e) => {
            const [y, m, dd] = e.target.value.split("-").map(Number);
            if (y && m && dd) setDate(new Date(y, m - 1, dd));
          }}
        />
        <button
          onClick={() => setDate((d) => addDays(d, 1))}
          aria-label="Next day"
        >
          Next ›
        </button>
        <button
          className="today-btn"
          onClick={() => setDate(startOfToday())}
          disabled={isToday}
        >
          Today
        </button>
      </div>

      <div className="sheet" ref={sheetRef}>
        {/* Header */}
        <div className="head">
          <div className="brand">
            CHORDER’S
            <span>ALMANAC</span>
          </div>
          <div className="big-date">
            <div className="day">{date.getDate()}</div>
            <div className="ym">
              {almanac.monthLabel} {date.getFullYear()}
            </div>
            <div className="weekday">{almanac.weekdayLabel}</div>
          </div>
          <div className="fortune-seal">
            <span className="seal-word">CHORD</span>
            <small>the day away</small>
          </div>
        </div>

        {/* Do / Don't */}
        <div className="yiji">
          <div className="col yi">
            <div className="col-title">DO</div>
            <ul>
              {doItems.map((item) => (
                <li key={item.name}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="col ji">
            <div className="col-title">DON’T</div>
            <ul>
              {dontItems.map((item) => (
                <li key={item.name}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Today's fortune */}
        <div className="fortune">
          <div className="fortune-grid">
            <div className="cell">
              <div className="label">Lucky Layout</div>
              <div className="value">{fortune.luckyLayout}</div>
            </div>
            <div className="cell">
              <div className="label">Lucky Finger</div>
              <div className="value">{fortune.luckyFinger}</div>
            </div>
            <div className="cell">
              <div className="label">Lucky Number</div>
              <div className="value gold">{fortune.luckyNumber}</div>
            </div>
            <div className="cell">
              <div className="label">Today’s Nemesis</div>
              <div className="value red">{fortune.clashNemesis}</div>
            </div>
            <div className="cell">
              <div className="label">Flow Hour</div>
              <div className="value">{fortune.auspiciousHour}</div>
            </div>
            <div className="cell">
              <div className="label">Lucky Keycap</div>
              <div className="value">{fortune.luckyKeycap}</div>
            </div>
          </div>
        </div>

        <div className="proverb">{fortune.proverb}</div>

        {/* On this day in typing history */}
        {history.length > 0 && (
          <div className="history">
            <div className="section-title">On This Day · Typing History</div>
            <ul>
              {history.map((h, i) => (
                <li key={i}>
                  <div className="year">{h.year}</div>
                  <div className="event">{h.text}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="foot">
          Do / Don’t and the fortune are generated deterministically from the
          date (for entertainment only).
          <br />
          On-this-day entries are only included when the exact date is verified.
        </div>
      </div>

      {/* Share bar */}
      <div className="share-bar">
        <button onClick={handleDownload} disabled={busy}>
          {busy ? "Generating…" : "🖼️ Download image"}
        </button>
        <button onClick={handleCopyLink}>
          {copied ? "✓ Link copied" : "🔗 Copy link"}
        </button>
      </div>
    </div>
  );
}
