import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Crosshair,
  FileSearch,
  Fingerprint,
  MapPin,
} from "lucide-react";
import "./experience.css";

const clues = [
  {
    label: "The report",
    icon: Crosshair,
    position: "photo-clue",
    number: "01",
    title: "Start with what’s on record.",
    text: "A Winnipeg shop reported a break-in. The Free Press included police confirmation in its September 11 coverage.",
    question:
      "Separate a confirmed report from an explanation of what happened.",
    note: "Winnipeg Free Press · September 11, 2026",
    url: "https://www.winnipegfreepress.com/breakingnews/2026/09/11/pokemon-thieves-clear-out-collectibles-shop",
  },
  {
    label: "The account",
    icon: FileSearch,
    position: "record",
    number: "02",
    title: "An estimate. An open question.",
    text: "The owner described thousands of missing Pokémon cards. The inventory estimate comes from the owner’s account.",
    question: "Who is the source of each claim? Follow the attribution.",
    note: "Owner’s account · reported by the Free Press",
    url: "https://www.winnipegfreepress.com/breakingnews/2026/09/11/pokemon-thieves-clear-out-collectibles-shop",
  },
  {
    label: "Your next step",
    icon: MapPin,
    position: "location",
    number: "03",
    title: "Know something first-hand?",
    text: "Relevant information belongs with investigators. Winnipeg Police lists a non-emergency reporting number: 204-986-6222.",
    question:
      "Share what you know directly with police. Keep private details out of public posts.",
    note: "Winnipeg Police · official contact information",
    url: "https://www.winnipeg.ca/police/contact",
  },
];

export function InvestigationExperience() {
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState<number[]>([]);
  const panel = useRef<HTMLElement>(null);
  const clue = clues[active];
  const inspect = (index: number) => {
    setActive(index);
    setOpened((previous) =>
      previous.includes(index) ? previous : [...previous, index],
    );
  };
  return (
    <section
      id="source-explorer"
      className="investigation-experience"
      ref={panel}
      aria-labelledby="experience-title"
    >
      <div className="chapter-heading">
        <span>01 / FOLLOW THE SOURCE</span>
        <span>
          <span className="signal-dot" /> FIELD NOTES: WINNIPEG
        </span>
      </div>
      <div className="experience-heading">
        <div>
          <p className="eyebrow">DON’T JUST READ THE STORY.</p>
          <h2 id="experience-title">
            Get inside the <em>investigation.</em>
          </h2>
        </div>
        <p>
          A real case. Three ways to look closer.
          <br />
          <span>The Pokémon shop break-in.</span>
        </p>
      </div>
      <div
        className="evidence-stage"
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty(
            "--beam-x",
            `${event.clientX - bounds.left}px`,
          );
          event.currentTarget.style.setProperty(
            "--beam-y",
            `${event.clientY - bounds.top}px`,
          );
        }}
      >
        <div className="scene-art">
          <img
            src="/images/archive-mystery.jpg"
            alt="Illustrative research desk with maps and papers"
          />
          <div className="scene-vignette" />
          <div className="flashlight" aria-hidden="true" />
          <span className="scene-caption">
            THE RESEARCH DESK
            <br />
            ILLUSTRATIVE ART
          </span>
          <div className="scene-reticle" aria-hidden="true" />
          {clues.map((item, index) => (
            <button
              key={item.label}
              className={`evidence-pin ${item.position} ${active === index ? "is-active" : ""}`}
              onClick={() => inspect(index)}
              aria-label={`Inspect ${item.label.toLowerCase()}`}
              aria-pressed={active === index}
              aria-controls="clue-detail"
            >
              <span>
                {opened.includes(index) ? <Check size={15} /> : item.number}
              </span>
              <b>{item.label}</b>
            </button>
          ))}
          <span className="scene-instruction">
            <Fingerprint size={15} /> TAP A MARKER TO INSPECT
          </span>
        </div>
        <div className="evidence-dossier">
          <div className="dossier-top">
            <span>CASE NOTES / 001</span>
            <span>{opened.length} / 3 EXPLORED</span>
          </div>
          <div className="clue-tabs" aria-label="Investigation clues">
            {clues.map((item, index) => (
              <button
                key={item.label}
                aria-label={`Read ${item.label.toLowerCase()}`}
                aria-pressed={active === index}
                onClick={() => inspect(index)}
              >
                <item.icon size={16} />
                <span>{item.number}</span>
              </button>
            ))}
          </div>
          <div
            id="clue-detail"
            className="clue-detail"
            aria-live="polite"
            aria-atomic="true"
            key={active}
          >
            <span className="clue-number">SOURCE NOTE {clue.number}</span>
            <h3>{clue.title}</h3>
            <p>{clue.text}</p>
            <blockquote>{clue.question}</blockquote>
            <a
              className="clue-source"
              href={clue.url}
              target="_blank"
              rel="noreferrer"
            >
              {clue.note} ↗
            </a>
          </div>
          <div className="dossier-actions">
            <button onClick={() => inspect((active + 1) % clues.length)}>
              Next note <ArrowRight size={16} />
            </button>
            <a href="#/cases/terris-pokemon-break-in">
              Open full case <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="experience-bottom">
        <span>
          {opened.length === 3
            ? "THREE NOTES EXPLORED. KEEP FOLLOWING THE SOURCES."
            : "EVERY CLAIM HAS A SOURCE. START THERE."}
        </span>
        <span>
          KEEP GOING <ArrowDown size={12} />
        </span>
      </div>
    </section>
  );
}

export function ScrollAtmosphere() {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = document.querySelectorAll(
      ".spotlight-section, .investigation-experience, .case-card, .aside-card",
    );
    let observer: IntersectionObserver | undefined;
    if (!reduced.matches) {
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer?.unobserve(entry.target);
            }
          }),
        { threshold: 0.08 },
      );
      elements.forEach((element) => {
        element.classList.add("scroll-reveal");
        observer?.observe(element);
      });
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - innerHeight;
      const ratio =
        distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
      if (progress.current)
        progress.current.style.transform = `scaleX(${ratio})`;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      observer?.disconnect();
      elements.forEach((element) =>
        element.classList.remove("scroll-reveal", "is-revealed"),
      );
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <>
      <div className="reading-progress" aria-hidden="true">
        <div ref={progress} />
      </div>
      <div className="atmospheric-grain" aria-hidden="true" />
    </>
  );
}
