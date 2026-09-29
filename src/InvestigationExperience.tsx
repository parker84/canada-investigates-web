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
    label: "The photograph",
    icon: Crosshair,
    position: "photo-clue",
    number: "01",
    title: "A place. Not an answer.",
    text: "A photograph can tell you where to look. It can’t tell you what happened. Start by asking who took it, when, and why.",
    question: "What would you need to verify this image?",
    note: "Illustrative artwork · not evidence",
  },
  {
    label: "The record",
    icon: FileSearch,
    position: "record",
    number: "02",
    title: "Two records. One loose end.",
    text: "In this fictional case, two archival entries give different dates for the same signal. A transcription error? A second event? Both possibilities stay open.",
    question: "Find the original entry before choosing a theory.",
    note: "Fictional case · source comparison",
  },
  {
    label: "The location",
    icon: MapPin,
    position: "location",
    number: "03",
    title: "Follow the shoreline.",
    text: "A place name is a lead. Historical maps, public archives, and local knowledge could help establish whether both accounts describe the same location.",
    question: "What changed between the two accounts?",
    note: "Fictional case · next research step",
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
      className="investigation-experience"
      ref={panel}
      aria-labelledby="experience-title"
    >
      <div className="chapter-heading">
        <span>01 / FOLLOW THE SIGNAL</span>
        <span>
          <span className="signal-dot" /> FIELD NOTES: NOVA SCOTIA
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
          Three loose ends. Take a closer look.
          <br />
          <span>A fictional case to explore.</span>
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
            src="/images/coastal-mystery.jpg"
            alt="Illustrative houseboat on a dark, misty inlet"
          />
          <div className="scene-vignette" />
          <div className="flashlight" aria-hidden="true" />
          <span className="scene-caption">
            EXHIBIT A / THE INLET
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
            <span>CASE NOTES / 002</span>
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
            <span className="clue-number">CLUE {clue.number}</span>
            <h3>{clue.title}</h3>
            <p>{clue.text}</p>
            <blockquote>{clue.question}</blockquote>
            <small>{clue.note}</small>
          </div>
          <div className="dossier-actions">
            <button onClick={() => inspect((active + 1) % clues.length)}>
              Next clue <ArrowRight size={16} />
            </button>
            <a href="#/cases/a-signal-from-the-coast">
              Open full case <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="experience-bottom">
        <span>
          {opened.length === 3
            ? "ALL THREE LEADS EXPLORED. THE QUESTION IS STILL OPEN."
            : "A CLUE IS A STARTING POINT. FOLLOW IT BACK TO THE SOURCE."}
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
