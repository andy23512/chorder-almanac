import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { buildAlmanac } from "../src/lib/almanac";

const toPng = vi.hoisted(() => vi.fn());
vi.mock("html-to-image", () => ({ toPng }));

const TODAY = new Date(2024, 2, 15, 10, 30); // Friday 15 March 2024, local time

const dateInput = () => document.querySelector<HTMLInputElement>('input[type="date"]')!;
const setDate = (iso: string) => fireEvent.change(dateInput(), { target: { value: iso } });
const flush = () => act(async () => { await Promise.resolve(); });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(TODAY);
  localStorage.clear();
  window.history.replaceState(null, "", "/almanac/");
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.removeProperty("--paper");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("first page", () => {
  it("opens on today, with the heading, date and weekday", () => {
    render(<App />);
    expect(dateInput().value).toBe("2024-03-15");
    expect(document.querySelector(".big-date .day")!.textContent).toBe("15");
    expect(document.querySelector(".big-date .ym")!.textContent).toBe("March 2024");
    expect(document.querySelector(".big-date .weekday")!.textContent).toBe("Friday");
    expect(screen.getByText("ALMANAC")).toBeTruthy();
  });

  it("shows the four Do and four Don't items of the day, with descriptions", () => {
    render(<App />);
    const a = buildAlmanac(new Date(2024, 2, 15));
    const lists = document.querySelectorAll(".yiji ul");
    expect(lists).toHaveLength(2);
    const read = (ul: Element) =>
      [...ul.querySelectorAll("li")].map((li) => [
        li.querySelector(".item-name")!.textContent,
        li.querySelector(".item-desc")!.textContent,
      ]);
    expect(read(lists[0])).toEqual(a.doItems.map((i) => [i.name, i.desc]));
    expect(read(lists[1])).toEqual(a.dontItems.map((i) => [i.name, i.desc]));
    expect(document.querySelector(".yi .col-title")!.textContent).toBe("DO");
    expect(document.querySelector(".ji .col-title")!.textContent).toBe("DON’T");
  });

  it("shows each fortune value under the right label", () => {
    render(<App />);
    const f = buildAlmanac(new Date(2024, 2, 15)).fortune;
    const cells = Object.fromEntries(
      [...document.querySelectorAll(".fortune .cell")].map((c) => [
        c.querySelector(".label")!.textContent,
        c.querySelector(".value")!.textContent,
      ]),
    );
    expect(cells).toEqual({
      "Lucky CC Device": f.luckyDevice,
      "Lucky Finger": f.luckyFinger,
      "Lucky Number": String(f.luckyNumber),
      "Today’s Nemesis": f.clashNemesis,
      "Flow Hour": f.auspiciousHour,
      "Lucky Keycap": f.luckyKeycap,
    });
    expect(document.querySelector(".proverb")!.textContent).toBe(f.proverb);
  });

  it("hides the history section on a day with no verified entry", () => {
    render(<App />);
    expect(document.querySelector(".history")).toBeNull();
  });

  it("links to the source repository safely", () => {
    render(<App />);
    const link = screen.getByText("Source on GitHub") as HTMLAnchorElement;
    expect(link.href).toBe("https://github.com/andy23512/chorder-almanac");
    expect(link.target).toBe("_blank");
    expect(link.rel).toBe("noopener");
  });
});

describe("choosing a date", () => {
  it("steps to the previous and next day, across month and year ends", () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(dateInput().value).toBe("2024-03-16");
    fireEvent.click(screen.getByLabelText("Previous day"));
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(dateInput().value).toBe("2024-03-14");
    setDate("2024-01-01");
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(dateInput().value).toBe("2023-12-31");
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(dateInput().value).toBe("2024-01-01");
    setDate("2024-02-28");
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(dateInput().value).toBe("2024-02-29");
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(dateInput().value).toBe("2024-03-01");
  });

  it("jumps to a typed date and redraws the page for it", () => {
    render(<App />);
    setDate("2024-12-09");
    expect(document.querySelector(".big-date .day")!.textContent).toBe("9");
    expect(document.querySelector(".big-date .ym")!.textContent).toBe("December 2024");
    expect(document.querySelector(".big-date .weekday")!.textContent).toBe("Monday");
    expect(document.querySelector(".proverb")!.textContent).toBe(
      buildAlmanac(new Date(2024, 11, 9)).fortune.proverb,
    );
  });

  it("ignores a cleared date field", () => {
    render(<App />);
    setDate("");
    expect(dateInput().value).toBe("2024-03-15");
  });

  it("shows the same page again when you come back to a day", () => {
    render(<App />);
    const before = document.querySelector(".sheet")!.innerHTML;
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(document.querySelector(".sheet")!.innerHTML).not.toBe(before);
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(document.querySelector(".sheet")!.innerHTML).toBe(before);
  });

  it("Today is disabled on today, enabled elsewhere, and brings you back", () => {
    render(<App />);
    const today = screen.getByText("Today") as HTMLButtonElement;
    expect(today.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(today.disabled).toBe(false);
    fireEvent.click(today);
    expect(dateInput().value).toBe("2024-03-15");
    expect(today.disabled).toBe(true);
  });

  it("lists the on-this-day entry when there is one", () => {
    render(<App />);
    setDate("2024-12-09");
    const section = document.querySelector<HTMLElement>(".history")!;
    expect(within(section).getByText("On This Day · Typing History")).toBeTruthy();
    expect(section.querySelector(".year")!.textContent).toBe("1968");
    expect(section.querySelector(".event")!.textContent).toContain("Mother of All Demos");
  });
});

describe("share link and the address bar", () => {
  it("starts from ?d=YYYY-MM-DD when it is valid", () => {
    window.history.replaceState(null, "", "/almanac/?d=2024-01-01");
    render(<App />);
    expect(dateInput().value).toBe("2024-01-01");
    expect(document.querySelector(".history .year")!.textContent).toBe("2006");
  });

  it.each(["2024-1-1", "20240101", "abc", "", "2024-01-01x", "x2024-01-01", "2024-01-011", "12024-01-01"])(
    "falls back to today for a malformed ?d=%j",
    (raw) => {
      window.history.replaceState(null, "", `/almanac/?d=${raw}`);
      render(<App />);
      expect(dateInput().value).toBe("2024-03-15");
    },
  );

  it("rolls an out-of-range day over like a Date does (2024-02-30 → 2024-03-01)", () => {
    window.history.replaceState(null, "", "/almanac/?d=2024-02-30");
    render(<App />);
    expect(dateInput().value).toBe("2024-03-01");
  });

  it("keeps the address bar in step with the page, without adding history entries", () => {
    const length = window.history.length;
    render(<App />);
    expect(window.location.search).toBe("?d=2024-03-15");
    expect(window.location.pathname).toBe("/almanac/");
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(window.location.search).toBe("?d=2024-03-16");
    setDate("2023-07-04");
    expect(window.location.search).toBe("?d=2023-07-04");
    expect(window.history.length).toBe(length);
  });

  describe("copy link", () => {
    let writeText: ReturnType<typeof vi.fn>;
    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    });

    it("copies the full address of the page being shown, then says so for 1.6 seconds", async () => {
      render(<App />);
      setDate("2024-12-09");
      fireEvent.click(screen.getByText("🔗 Copy link"));
      await flush();
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/almanac/?d=2024-12-09`);
      expect(screen.getByText("✓ Link copied")).toBeTruthy();
      act(() => { vi.advanceTimersByTime(1599); });
      expect(screen.getByText("✓ Link copied")).toBeTruthy();
      act(() => { vi.advanceTimersByTime(1); });
      expect(screen.getByText("🔗 Copy link")).toBeTruthy();
    });

    it("asks the person to copy by hand when the clipboard refuses", async () => {
      writeText.mockRejectedValue(new Error("denied"));
      const prompt = vi.spyOn(window, "prompt").mockReturnValue(null);
      render(<App />);
      fireEvent.click(screen.getByText("🔗 Copy link"));
      await flush();
      expect(prompt).toHaveBeenCalledWith(
        "Copy this link to share:",
        `${window.location.origin}/almanac/?d=2024-03-15`,
      );
      expect(screen.queryByText("✓ Link copied")).toBeNull();
    });
  });
});

describe("theme", () => {
  const themeButton = () => document.querySelector<HTMLButtonElement>(".theme-btn")!;

  it("follows the system by default, with no data-theme on the page", () => {
    render(<App />);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(themeButton().textContent).toBe("🖥️ System");
    expect(themeButton().getAttribute("aria-label")).toBe("Theme: system. Click to switch.");
    expect(localStorage.getItem("theme")).toBe("system");
  });

  it("cycles system → light → dark → system, applying and saving each", () => {
    render(<App />);
    fireEvent.click(themeButton());
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(themeButton().textContent).toBe("☀️ Light");
    expect(localStorage.getItem("theme")).toBe("light");
    fireEvent.click(themeButton());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(themeButton().textContent).toBe("🌙 Dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    fireEvent.click(themeButton());
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("system");
  });

  it.each(["light", "dark"])("restores a saved %s choice on load", (saved) => {
    localStorage.setItem("theme", saved);
    render(<App />);
    expect(document.documentElement.getAttribute("data-theme")).toBe(saved);
  });

  it("treats an unknown saved value as system", () => {
    localStorage.setItem("theme", "sepia");
    render(<App />);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(themeButton().textContent).toBe("🖥️ System");
  });

  it("does not change the page when the theme changes", () => {
    render(<App />);
    const before = document.querySelector(".sheet")!.innerHTML;
    fireEvent.click(themeButton());
    expect(document.querySelector(".sheet")!.innerHTML).toBe(before);
  });
});

describe("download image", () => {
  let clicked: HTMLAnchorElement[];
  beforeEach(() => {
    clicked = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this);
    });
    toPng.mockReset();
  });

  it("renders the sheet at 2x with the theme's paper colour and saves it as a dated PNG", async () => {
    toPng.mockResolvedValue("data:image/png;base64,AAAA");
    // computed values can carry stray spaces, so the colour must be trimmed
    const real = window.getComputedStyle;
    vi.spyOn(window, "getComputedStyle").mockImplementation((el, pseudo) => {
      const style = real(el, pseudo);
      return { ...style, getPropertyValue: (name: string) => (name === "--paper" ? "  #112233 " : "") } as CSSStyleDeclaration;
    });
    render(<App />);
    setDate("2024-12-09");
    fireEvent.click(screen.getByText("🖼️ Download image"));
    await flush();
    expect(toPng).toHaveBeenCalledTimes(1);
    const [node, options] = toPng.mock.calls[0];
    expect(node).toBe(document.querySelector(".sheet"));
    expect(options).toEqual({ pixelRatio: 2, backgroundColor: "#112233", skipFonts: true });
    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe("chorders-almanac-2024-12-09.png");
    expect(clicked[0].getAttribute("href")).toBe("data:image/png;base64,AAAA");
  });

  it("falls back to the light paper colour when the theme sets none", async () => {
    toPng.mockResolvedValue("data:image/png;base64,AAAA");
    render(<App />);
    fireEvent.click(screen.getByText("🖼️ Download image"));
    await flush();
    expect(toPng.mock.calls[0][1].backgroundColor).toBe("#f4ece0");
  });

  it("shows Generating… and blocks a second click while it works", async () => {
    let finish!: (url: string) => void;
    toPng.mockReturnValue(new Promise<string>((resolve) => { finish = resolve; }));
    render(<App />);
    fireEvent.click(screen.getByText("🖼️ Download image"));
    await flush();
    const busy = screen.getByText("Generating…") as HTMLButtonElement;
    expect(busy.disabled).toBe(true);
    fireEvent.click(busy);
    expect(toPng).toHaveBeenCalledTimes(1);
    await act(async () => { finish("data:image/png;base64,BBBB"); });
    expect(screen.getByText("🖼️ Download image")).toBeTruthy();
    expect(clicked).toHaveLength(1);
  });

  it("tells the person and logs the error when rendering fails, then lets them retry", async () => {
    const error = new Error("boom");
    toPng.mockRejectedValue(error);
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    fireEvent.click(screen.getByText("🖼️ Download image"));
    await flush();
    expect(log).toHaveBeenCalledWith("Failed to generate image", error);
    expect(alert).toHaveBeenCalledWith("Could not generate the image. Please try again.");
    expect(clicked).toHaveLength(0);
    const again = screen.getByText("🖼️ Download image") as HTMLButtonElement;
    expect(again.disabled).toBe(false);
  });
});
