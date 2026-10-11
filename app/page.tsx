"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const ComputationalField = dynamic(
  () => import("@/src/components/ui/ComputationalField"),
  { ssr: false }
);

// ─── Types ──────────────────────────────────────────────────────────────────

interface DemoFormData {
  fullName: string;
  workEmail: string;
  company: string;
  jobTitle: string;
  teamSize: string;
  message: string;
}

type FormState = "idle" | "submitting" | "success" | "error";

// ─── Sections Data ──────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    n: "01",
    heading: "Knowledge lives in people, not systems.",
    body: "Critical know-how is scattered across conversations, inboxes, shared drives, and the heads of long-tenured employees. When those people move on, the knowledge goes with them.",
  },
  {
    n: "02",
    heading: "New employees spend too long finding answers.",
    body: "Onboarding relies on personal introductions, tribal knowledge, and time-sensitive availability of experienced colleagues. Processes that aren't written down must be re-explained every time.",
  },
  {
    n: "03",
    heading: "Teams repeat work and lose consistency.",
    body: "Without a shared record of how decisions were made or how procedures actually run, teams reinvent the wheel and outcomes vary. No audit trail. No institutional memory.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    label: "Capture",
    heading: "Bring company knowledge together.",
    body: "Ingest authorized documents, policies, procedural guides, and internal know-how into Workloom's organizational memory layer.",
    color: "#C978A0",
  },
  {
    step: "02",
    label: "Understand",
    heading: "Make knowledge searchable and accessible.",
    body: "Employees can ask natural-language questions and get answers grounded in what your organization has actually documented—with traceable sources.",
    color: "#E79ABF",
  },
  {
    step: "03",
    label: "Act",
    heading: "Turn processes into structured workflows.",
    body: "Convert repeatable procedures into defined workflows with steps, conditions, actions, and human approval gates. Every run is logged and traceable.",
    color: "#B36393",
  },
];

const CAPABILITIES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    title: "Organizational Memory",
    body: "Preserve how your company operates. Store procedures, rationale, and institutional knowledge so it remains accessible—even as teams grow and change.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
    title: "Ask Workloom",
    body: "Employees ask questions in plain language and get answers sourced directly from your organization's documented knowledge—with clear attribution and honest gaps.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
    title: "Workflow Intelligence",
    body: "Guide any repeatable process through defined steps with conditions, actions, and notifications. Human approval gates ensure oversight where it matters.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: "Employee Onboarding",
    body: "Give new hires role-specific procedural guides and structured onboarding flows. Reduce dependency on colleagues for explanations that should already be documented.",
  },
];

const USE_CASES = [
  {
    dept: "HR & People",
    label: "HUMAN RESOURCES",
    example: "New hire onboarding",
    scenarios: [
      "Structured onboarding flows for each role and department",
      "Role-specific procedure guides accessible on day one",
      "Benefits, policy, and compliance answers without repeated explanations",
    ],
  },
  {
    dept: "Sales & Revenue",
    label: "SALES OPERATIONS",
    example: "Qualification & deal review",
    scenarios: [
      "Qualification criteria and deal stage requirements in one place",
      "Standard review checklists surfaced during pipeline reviews",
      "Consistent deal documentation across the entire sales team",
    ],
  },
  {
    dept: "Product & Engineering",
    label: "PRODUCT MANAGEMENT",
    example: "Spec & roadmap decisions",
    scenarios: [
      "Feature specification templates and approval workflows",
      "Product decisions documented with context and rationale",
      "Roadmap change processes with stakeholder notification steps",
    ],
  },
  {
    dept: "IT & Operations",
    label: "IT OPERATIONS",
    example: "Internal procedures",
    scenarios: [
      "IT runbooks and operational procedures available on demand",
      "Incident response workflows with defined escalation steps",
      "Access provisioning and offboarding checklists that actually run",
    ],
  },
];

const TRUST_ITEMS = [
  {
    heading: "Answers grounded in what you've documented.",
    body: "Workloom answers employee questions using your organization's actual content—not external data or model guesses. Sources are shown alongside answers.",
  },
  {
    heading: "Human approval where it matters.",
    body: "Decisions that require authorization don't execute automatically. Workloom pauses workflows for human review and tracks what was approved, by whom, and when.",
  },
  {
    heading: "Honest about what it doesn't know.",
    body: "When the answer isn't in your documentation or a workflow step can't proceed, Workloom says so clearly—rather than confidently providing unhelpful guidance.",
  },
  {
    heading: "Traceable results you can verify.",
    body: "Every workflow run creates a log. Every knowledge answer cites its source. You can always see what happened, what was used, and what was decided.",
  },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: "var(--ink-soft)",
        textDecoration: "none",
        padding: "4px 2px",
        transition: "color 150ms",
        letterSpacing: "-0.01em",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-soft)"; }}
    >
      {children}
    </a>
  );
}

function useScrollReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ─── Demo Modal ─────────────────────────────────────────────────────────────

function DemoModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<DemoFormData>({
    fullName: "",
    workEmail: "",
    company: "",
    jobTitle: "",
    teamSize: "",
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitted || state === "submitting") return;
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setState("success");
    } catch {
      setState("error");
      setErrorMsg("Unable to submit. Please check your connection and try again.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius)",
    background: "var(--surface)",
    color: "var(--ink)",
    outline: "none",
    transition: "border-color 120ms",
    letterSpacing: "-0.01em",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: 5,
    fontFamily: "var(--font-ibm-plex-mono), monospace",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(13, 13, 15, 0.65)",
        backdropFilter: "blur(6px)",
        animation: "fade-in-overlay 200ms ease forwards",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--line)",
          boxShadow: "0 24px 60px rgba(13,13,15,0.25)",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "slide-in-up 240ms ease forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 24px 18px",
            borderBottom: "1px solid var(--line-soft)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent-deep)",
                marginBottom: 4,
                fontFamily: "var(--font-ibm-plex-mono), monospace",
              }}
            >
              BOOK A DEMO
            </div>
            <h2
              id="demo-modal-title"
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                lineHeight: 1.2,
              }}
            >
              See Workloom in action
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              Tell us a bit about your team and we'll set up a focused 30-minute walkthrough.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "none",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              width: 30,
              height: 30,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              flexShrink: 0,
              marginLeft: 16,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px" }}>
          {state === "success" ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 16px",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--success-bg)",
                  border: "1px solid var(--success-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                Request received
              </h3>
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  lineHeight: 1.6,
                }}
              >
                Thanks, {form.fullName.split(" ")[0]}. We'll review your request and reach out
                at <strong>{form.workEmail}</strong> within one business day.
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 500,
                  background: "var(--ink)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
                {/* Full name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="demo-fullName" style={labelStyle}>Full Name *</label>
                  <input
                    id="demo-fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Alex Johnson"
                    style={inputStyle}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-deep)"; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--line)"; }}
                  />
                </div>

                {/* Work email */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="demo-workEmail" style={labelStyle}>Work Email *</label>
                  <input
                    id="demo-workEmail"
                    name="workEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.workEmail}
                    onChange={handleChange}
                    placeholder="alex@yourcompany.com"
                    style={inputStyle}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-deep)"; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--line)"; }}
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="demo-company" style={labelStyle}>Company *</label>
                  <input
                    id="demo-company"
                    name="company"
                    type="text"
                    required
                    autoComplete="organization"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    style={inputStyle}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-deep)"; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--line)"; }}
                  />
                </div>

                {/* Job title */}
                <div>
                  <label htmlFor="demo-jobTitle" style={labelStyle}>Job Title *</label>
                  <input
                    id="demo-jobTitle"
                    name="jobTitle"
                    type="text"
                    required
                    autoComplete="organization-title"
                    value={form.jobTitle}
                    onChange={handleChange}
                    placeholder="Head of Operations"
                    style={inputStyle}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-deep)"; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--line)"; }}
                  />
                </div>

                {/* Team size */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="demo-teamSize" style={labelStyle}>Team Size</label>
                  <select
                    id="demo-teamSize"
                    name="teamSize"
                    value={form.teamSize}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = "var(--accent-deep)"; }}
                    onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = "var(--line)"; }}
                  >
                    <option value="">Select team size (optional)</option>
                    <option value="1–10">1–10 people</option>
                    <option value="11–50">11–50 people</option>
                    <option value="51–200">51–200 people</option>
                    <option value="201–500">201–500 people</option>
                    <option value="500+">500+ people</option>
                  </select>
                </div>

                {/* Message */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="demo-message" style={labelStyle}>
                    What would you like to solve with Workloom?
                  </label>
                  <textarea
                    id="demo-message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="e.g. We're struggling with consistent onboarding and knowledge retention when team members leave..."
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: 80,
                    }}
                    onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent-deep)"; }}
                    onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--line)"; }}
                  />
                </div>
              </div>

              {state === "error" && errorMsg && (
                <div
                  role="alert"
                  style={{
                    marginTop: 14,
                    padding: "9px 12px",
                    border: "1px solid var(--error-border)",
                    borderRadius: "var(--radius)",
                    background: "var(--error-bg)",
                    fontSize: 12,
                    color: "var(--error)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                id="demo-submit-btn"
                disabled={state === "submitting"}
                style={{
                  marginTop: 18,
                  width: "100%",
                  padding: "11px",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  background: state === "submitting" ? "var(--muted)" : "var(--ink)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: state === "submitting" ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "background 150ms",
                }}
              >
                {state === "submitting" ? "Sending…" : "Book a Demo →"}
              </button>

              <p
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: "var(--muted)",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                We'll respond within one business day.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on nav click
  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <>
      {/* ── Demo Modal ───────────────────────────────────────────── */}
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}

      {/* ── Mobile menu overlay ──────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(13,13,15,0.5)",
            animation: "fade-in-overlay 200ms ease",
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div style={{ background: "var(--bg)", color: "var(--ink)", overflowX: "hidden" }}>

        {/* ════════════════════════════════════════════
            NAVIGATION
            ════════════════════════════════════════════ */}
        <header
          role="banner"
          style={{
            position: "sticky",
            top: 3,
            zIndex: 80,
            background: scrolled ? "rgba(247,246,243,0.92)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? "1px solid var(--line-soft)" : "1px solid transparent",
            transition: "background 250ms, border-color 250ms, backdrop-filter 250ms",
          }}
        >
          <nav
            aria-label="Main navigation"
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "0 24px",
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            {/* Wordmark */}
            <a
              href="/"
              aria-label="Workloom home"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
            >
              <Image
                src="/workloom-logo.png"
                alt="Workloom"
                width={26}
                height={26}
                style={{ objectFit: "contain" }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                Workloom
              </span>
            </a>

            {/* Desktop nav */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
              }}
              className="landing-desktop-nav"
            >
              <NavLink href="#product">Product</NavLink>
              <NavLink href="#how-it-works">How It Works</NavLink>
              <NavLink href="#use-cases">Use Cases</NavLink>
              <NavLink href="#trust">About</NavLink>
            </div>

            {/* CTA cluster */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <button
                type="button"
                id="nav-book-demo-btn"
                onClick={() => setDemoOpen(true)}
                style={{
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "var(--ink)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "-0.01em",
                  transition: "background 150ms, transform 100ms",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2a2830"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--ink)"; }}
              >
                Book a Demo
              </button>

              {/* Hamburger */}
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="landing-hamburger"
                style={{
                  display: "none",
                  padding: 6,
                  background: "none",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  color: "var(--ink)",
                }}
              >
                {mobileMenuOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--surface)",
                borderBottom: "1px solid var(--line)",
                padding: "8px 24px 16px",
                zIndex: 89,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "var(--shadow-md)",
                animation: "slide-in-up 200ms ease",
              }}
            >
              {[
                { href: "#product", label: "Product" },
                { href: "#how-it-works", label: "How It Works" },
                { href: "#use-cases", label: "Use Cases" },
                { href: "#trust", label: "About" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={handleNavClick}
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--ink)",
                    textDecoration: "none",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--line-soft)",
                    display: "block",
                  }}
                >
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoOpen(true);
                }}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "var(--ink)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "center",
                }}
              >
                Book a Demo
              </button>
            </div>
          )}
        </header>

        {/* ════════════════════════════════════════════
            HERO
            ════════════════════════════════════════════ */}
        <div
          style={{
            position: "relative",
            background: "var(--bg-dark)",
            minHeight: "min(92vh, 760px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Particle field */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            <ComputationalField
              preset="fabric"
              opacity={0.38}
              color={[231, 154, 191]}
            />
          </div>

          {/* Subtle warm glow bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 700,
              height: 200,
              background: "radial-gradient(ellipse at center, rgba(201,120,160,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Hero content */}
          <div
            style={{
              position: "relative",
              maxWidth: 1120,
              margin: "0 auto",
              padding: "80px 24px 88px",
              width: "100%",
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                border: "1px solid rgba(231,154,191,0.3)",
                borderRadius: 100,
                marginBottom: 28,
                background: "rgba(231,154,191,0.07)",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "inline-block",
                  animation: "pulse-live 2.5s ease infinite",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                }}
              >
                ORGANIZATIONAL MEMORY, REIMAGINED
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                margin: "0 0 22px",
                fontSize: "clamp(32px, 5.5vw, 60px)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.08,
                color: "#F7F6F3",
                maxWidth: 780,
              }}
            >
              Your organization's knowledge
              shouldn't leave when
              <span style={{ color: "var(--accent)" }}> people do.</span>
            </h1>

            {/* Description */}
            <p
              style={{
                margin: "0 0 36px",
                fontSize: "clamp(15px, 1.8vw, 17px)",
                lineHeight: 1.65,
                color: "rgba(247,246,243,0.62)",
                maxWidth: 560,
                fontWeight: 400,
              }}
            >
              Workloom turns scattered company knowledge into accessible answers
              and actionable workflows—helping teams preserve expertise, onboard faster,
              and operate with greater consistency.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button
                type="button"
                id="hero-book-demo-btn"
                onClick={() => setDemoOpen(true)}
                style={{
                  padding: "13px 28px",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "var(--accent-deep)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "-0.01em",
                  transition: "background 150ms, transform 100ms, box-shadow 150ms",
                  boxShadow: "0 4px 18px rgba(201,120,160,0.35)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "#b85f90";
                  el.style.transform = "translateY(-1px)";
                  el.style.boxShadow = "0 6px 24px rgba(201,120,160,0.4)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "var(--accent-deep)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 4px 18px rgba(201,120,160,0.35)";
                }}
              >
                Book a Demo
              </button>
              <a
                href="#how-it-works"
                id="hero-how-it-works-link"
                style={{
                  padding: "13px 24px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(247,246,243,0.72)",
                  background: "rgba(247,246,243,0.07)",
                  border: "1px solid rgba(247,246,243,0.16)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  transition: "background 150ms, color 150ms",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "rgba(247,246,243,0.12)";
                  el.style.color = "rgba(247,246,243,0.92)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "rgba(247,246,243,0.07)";
                  el.style.color = "rgba(247,246,243,0.72)";
                }}
              >
                Explore How It Works
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Hero stats row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px 40px",
                marginTop: 52,
                paddingTop: 28,
                borderTop: "1px solid rgba(247,246,243,0.08)",
              }}
            >
              {[
                { value: "Knowledge", label: "preserved as processes change" },
                { value: "Onboarding", label: "without repeated explanations" },
                { value: "Workflows", label: "with full audit trail" },
              ].map(({ value, label }) => (
                <div key={value} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(247,246,243,0.5)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(247,246,243,0.82)",
                        fontWeight: 500,
                        marginRight: 5,
                      }}
                    >
                      {value}
                    </span>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            THE PROBLEM
            ════════════════════════════════════════════ */}
        <div id="product" style={{ background: "var(--bg)" }}>
          <RevealSection style={{ maxWidth: 1120, margin: "0 auto", padding: "88px 24px 0" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                marginBottom: 16,
              }}
            >
              THE PROBLEM
            </div>
            <h2
              style={{
                margin: "0 0 56px",
                fontSize: "clamp(24px, 3.5vw, 38px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "var(--ink)",
                maxWidth: 680,
              }}
            >
              Your people know how work gets done.
              But where does that knowledge live?
            </h2>
          </RevealSection>

          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "0 24px 88px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 1,
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "var(--line)",
            }}
          >
            {PROBLEMS.map((p, i) => (
              <RevealSection key={p.n} delay={i * 80}>
                <div
                  style={{
                    background: "var(--surface)",
                    padding: "32px 28px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: "var(--accent)",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      marginBottom: 14,
                    }}
                  >
                    {p.n}
                  </div>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.3,
                      color: "var(--ink)",
                    }}
                  >
                    {p.heading}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {p.body}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            HOW IT WORKS
            ════════════════════════════════════════════ */}
        <div
          id="how-it-works"
          style={{
            background: "var(--surface-alt)",
            borderTop: "1px solid var(--line-soft)",
            borderBottom: "1px solid var(--line-soft)",
          }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "88px 24px" }}>
            <RevealSection>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  marginBottom: 16,
                }}
              >
                HOW IT WORKS
              </div>
              <h2
                style={{
                  margin: "0 0 60px",
                  fontSize: "clamp(24px, 3.5vw, 38px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "var(--ink)",
                  maxWidth: 560,
                }}
              >
                Three stages. One coherent system.
              </h2>
            </RevealSection>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {HOW_IT_WORKS.map((stage, i) => (
                <RevealSection key={stage.step} delay={i * 100}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: "0 32px",
                      padding: "32px 0",
                      borderBottom: i < HOW_IT_WORKS.length - 1 ? "1px solid var(--line-soft)" : "none",
                    }}
                  >
                    {/* Step indicator */}
                    <div style={{ paddingTop: 2 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius)",
                          border: `1px solid ${stage.color}40`,
                          background: `${stage.color}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            color: stage.color,
                            fontFamily: "var(--font-ibm-plex-mono), monospace",
                          }}
                        >
                          {stage.step}
                        </span>
                      </div>
                      {i < HOW_IT_WORKS.length - 1 && (
                        <div
                          style={{
                            width: 1,
                            height: 40,
                            background: "var(--line)",
                            margin: "0 auto",
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ paddingTop: 4 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: stage.color,
                          fontFamily: "var(--font-ibm-plex-mono), monospace",
                          marginBottom: 8,
                        }}
                      >
                        {stage.label}
                      </div>
                      <h3
                        style={{
                          margin: "0 0 10px",
                          fontSize: 20,
                          fontWeight: 600,
                          letterSpacing: "-0.025em",
                          color: "var(--ink)",
                          lineHeight: 1.2,
                        }}
                      >
                        {stage.heading}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          lineHeight: 1.65,
                          color: "var(--ink-soft)",
                          maxWidth: 600,
                        }}
                      >
                        {stage.body}
                      </p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            CAPABILITIES
            ════════════════════════════════════════════ */}
        <div id="capabilities" style={{ background: "var(--bg)" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "88px 24px" }}>
            <RevealSection>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  marginBottom: 16,
                }}
              >
                CORE CAPABILITIES
              </div>
              <h2
                style={{
                  margin: "0 0 52px",
                  fontSize: "clamp(24px, 3.5vw, 38px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "var(--ink)",
                  maxWidth: 560,
                }}
              >
                What Workloom actually does.
              </h2>
            </RevealSection>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {CAPABILITIES.map((cap, i) => (
                <RevealSection key={cap.title} delay={i * 70}>
                  <div
                    style={{
                      padding: "24px",
                      background: "var(--surface)",
                      border: "1px solid var(--line-soft)",
                      borderRadius: "var(--radius-lg)",
                      height: "100%",
                      transition: "border-color 200ms, box-shadow 200ms, transform 200ms",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = "var(--accent-border)";
                      el.style.boxShadow = "0 4px 20px rgba(231,154,191,0.10)";
                      el.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = "var(--line-soft)";
                      el.style.boxShadow = "none";
                      el.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius)",
                        background: "var(--accent-dim)",
                        border: "1px solid var(--accent-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                        color: "var(--accent-deep)",
                      }}
                    >
                      {cap.icon}
                    </div>
                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        color: "var(--ink)",
                      }}
                    >
                      {cap.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        lineHeight: 1.65,
                        color: "var(--ink-soft)",
                      }}
                    >
                      {cap.body}
                    </p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            USE CASES
            ════════════════════════════════════════════ */}
        <div
          id="use-cases"
          style={{
            background: "var(--bg-dark)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle pink glow */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              right: "-10%",
              width: 500,
              height: 500,
              background: "radial-gradient(ellipse, rgba(201,120,160,0.06) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              maxWidth: 1120,
              margin: "0 auto",
              padding: "88px 24px",
            }}
          >
            <RevealSection>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(231,154,191,0.6)",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  marginBottom: 16,
                }}
              >
                USE CASES
              </div>
              <h2
                style={{
                  margin: "0 0 52px",
                  fontSize: "clamp(24px, 3.5vw, 38px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "#F7F6F3",
                  maxWidth: 560,
                }}
              >
                Where Workloom fits into your organization.
              </h2>
            </RevealSection>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
              }}
            >
              {USE_CASES.map((uc, i) => (
                <RevealSection key={uc.dept} delay={i * 80}>
                  <div
                    style={{
                      padding: "24px",
                      background: "rgba(247,246,243,0.04)",
                      border: "1px solid rgba(247,246,243,0.09)",
                      borderRadius: "var(--radius-lg)",
                      height: "100%",
                      transition: "background 200ms, border-color 200ms",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = "rgba(247,246,243,0.07)";
                      el.style.borderColor = "rgba(231,154,191,0.25)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = "rgba(247,246,243,0.04)";
                      el.style.borderColor = "rgba(247,246,243,0.09)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        fontFamily: "var(--font-ibm-plex-mono), monospace",
                        marginBottom: 8,
                      }}
                    >
                      {uc.label}
                    </div>
                    <h3
                      style={{
                        margin: "0 0 6px",
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        color: "#F7F6F3",
                        lineHeight: 1.25,
                      }}
                    >
                      {uc.dept}
                    </h3>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(247,246,243,0.4)",
                        marginBottom: 18,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {uc.example}
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {uc.scenarios.map((s) => (
                        <li
                          key={s}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            fontSize: 13,
                            color: "rgba(247,246,243,0.6)",
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "var(--accent)",
                              flexShrink: 0,
                              marginTop: 6,
                            }}
                          />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            TRUST & TRANSPARENCY
            ════════════════════════════════════════════ */}
        <div
          id="trust"
          style={{
            background: "var(--bg)",
            borderTop: "1px solid var(--line-soft)",
          }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "88px 24px" }}>
            <RevealSection>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  marginBottom: 16,
                }}
              >
                TRUST & TRANSPARENCY
              </div>
              <h2
                style={{
                  margin: "0 0 52px",
                  fontSize: "clamp(24px, 3.5vw, 38px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "var(--ink)",
                  maxWidth: 620,
                }}
              >
                Grounded answers. Traceable decisions. Honest about limits.
              </h2>
            </RevealSection>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 1,
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                background: "var(--line)",
              }}
            >
              {TRUST_ITEMS.map((item, i) => (
                <RevealSection key={item.heading} delay={i * 60}>
                  <div
                    style={{
                      padding: "28px 24px",
                      background: "var(--surface)",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--success-bg)",
                        border: "1px solid var(--success-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 14,
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: "-0.015em",
                        color: "var(--ink)",
                        lineHeight: 1.35,
                      }}
                    >
                      {item.heading}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: "var(--ink-soft)",
                      }}
                    >
                      {item.body}
                    </p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            FINAL CTA
            ════════════════════════════════════════════ */}
        <div
          style={{
            background: "var(--ink)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Particle field on dark CTA */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <ComputationalField
              preset="minimal"
              opacity={0.2}
              color={[231, 154, 191]}
            />
          </div>

          <div
            style={{
              position: "relative",
              maxWidth: 1120,
              margin: "0 auto",
              padding: "88px 24px",
              textAlign: "center",
            }}
          >
            <RevealSection>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(231,154,191,0.7)",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  marginBottom: 18,
                }}
              >
                GET STARTED
              </div>
              <h2
                style={{
                  margin: "0 0 18px",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 700,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.1,
                  color: "#F7F6F3",
                }}
              >
                Keep your organization's knowledge working for you.
              </h2>
              <p
                style={{
                  margin: "0 auto 40px",
                  fontSize: "clamp(14px, 1.6vw, 16px)",
                  lineHeight: 1.65,
                  color: "rgba(247,246,243,0.55)",
                  maxWidth: 540,
                }}
              >
                Discover how Workloom can help your team preserve expertise, make
                processes easier to follow, and build continuity as your organization grows.
              </p>
              <button
                type="button"
                id="cta-book-demo-btn"
                onClick={() => setDemoOpen(true)}
                style={{
                  padding: "14px 32px",
                  fontSize: 15,
                  fontWeight: 600,
                  background: "var(--accent-deep)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "-0.01em",
                  transition: "background 150ms, transform 100ms, box-shadow 150ms",
                  boxShadow: "0 4px 20px rgba(201,120,160,0.4)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "#b85f90";
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = "0 8px 28px rgba(201,120,160,0.5)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "var(--accent-deep)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 4px 20px rgba(201,120,160,0.4)";
                }}
              >
                Book a Demo
              </button>
            </RevealSection>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            FOOTER
            ════════════════════════════════════════════ */}
        <footer
          role="contentinfo"
          style={{
            background: "var(--bg-dark)",
            borderTop: "1px solid rgba(247,246,243,0.07)",
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "52px 24px 36px",
            }}
          >
            {/* Top row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 32,
                marginBottom: 40,
                paddingBottom: 32,
                borderBottom: "1px solid rgba(247,246,243,0.07)",
              }}
            >
              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <Image
                    src="/workloom-logo.png"
                    alt="Workloom"
                    width={22}
                    height={22}
                    style={{ objectFit: "contain" }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "#F7F6F3",
                    }}
                  >
                    Workloom
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "rgba(247,246,243,0.4)",
                    maxWidth: 340,
                  }}
                >
                  Organizational memory and workflow intelligence for teams that need
                  to preserve expertise and operate consistently as they grow.
                </p>
              </div>

              {/* Nav columns */}
              <div
                style={{
                  display: "flex",
                  gap: 48,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(247,246,243,0.3)",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      marginBottom: 14,
                    }}
                  >
                    Product
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "How It Works", href: "#how-it-works" },
                      { label: "Capabilities", href: "#capabilities" },
                      { label: "Use Cases", href: "#use-cases" },
                    ].map(({ label, href }) => (
                      <a
                        key={label}
                        href={href}
                        style={{
                          fontSize: 13,
                          color: "rgba(247,246,243,0.5)",
                          textDecoration: "none",
                          transition: "color 150ms",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(247,246,243,0.85)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(247,246,243,0.5)"; }}
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(247,246,243,0.3)",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      marginBottom: 14,
                    }}
                  >
                    Contact
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setDemoOpen(true)}
                      style={{
                        fontSize: 13,
                        color: "var(--accent)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        padding: 0,
                        textAlign: "left",
                        transition: "color 150ms",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-deep)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"; }}
                    >
                      Book a Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(247,246,243,0.25)",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                }}
              >
                © {new Date().getFullYear()} Workloom. All rights reserved.
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(247,246,243,0.2)",
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                }}
              >
                ENTERPRISE KNOWLEDGE OS
              </span>
            </div>
          </div>
        </footer>

      </div>

      {/* Inline responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .landing-desktop-nav { display: none !important; }
          .landing-hamburger { display: flex !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .computational-field canvas { display: none; }
        }
      `}</style>
    </>
  );
}
