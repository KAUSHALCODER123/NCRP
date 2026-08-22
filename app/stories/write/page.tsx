"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { IconCheck, IconLock, IconShield } from "@/components/icons";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-now";
import { canShare, outcomeOf, OUTCOME_LABEL, OUTCOME_TONE } from "@/lib/stories";
import { formatPaise } from "@/lib/money";

/**
 * Writing a story, gated on a real case number.
 *
 * The case ID is the verification. It is the only credential this product
 * already owns, it cannot be produced by someone who has not been through the
 * process, and using it here turns a receipt number into proof of standing.
 *
 * Anonymity is the default rather than an option, and the privacy rules are
 * stated before the text box rather than buried in a checkbox underneath it —
 * someone deciding whether to tell this story publicly should know the terms
 * before they start writing, not after.
 */
export default function WriteStoryPage() {
  const hydrated = useHydrated();
  const cases = useStore((s) => s.cases);

  const [caseId, setCaseId] = useState("");
  const [checked, setChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lesson, setLesson] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const kase = cases.find(
    (c) => c.id.toLowerCase() === caseId.trim().toLowerCase(),
  );
  const eligible = canShare(kase);

  if (!hydrated) {
    return (
      <Shell>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-9 w-64 rounded bg-sunken" />
          <div className="h-32 rounded-card bg-sunken" />
        </div>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <>
        <TopBar back={{ href: "/stories", label: "Survivor stories" }} />
        <Shell>
          <Chip tone="held">
            <IconCheck className="h-4 w-4" />
            Sent for review
          </Chip>
          <h1 className="mt-4 font-display text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
            Thank you. That was not an easy thing to write.
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
            A person reads every story before it goes up, checking that nothing
            in it could identify you — a bank branch, an employer, an unusual
            amount on a specific date. If anything needs changing we will ask
            you first, and you can withdraw it at any time, permanently.
          </p>
          <Button href="/stories" className="mt-7">
            Read other stories
          </Button>
        </Shell>
      </>
    );
  }

  return (
    <>
      <TopBar back={{ href: "/stories", label: "Survivor stories" }} />
      <Shell>
        <h1 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[36px]">
          Write your story
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
          Someone is about to be targeted the same way you were. Reading that it
          happened to a real person, and that they reported it, is the thing
          most likely to stop them.
        </p>

        {/* The terms, before the text box rather than under it. */}
        <Card className="mt-7">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-soft text-primary-text">
            <IconLock className="h-5 w-5" />
          </span>
          <p className="mt-4 text-[18px] font-semibold text-ink">
            Before you start
          </p>
          <ul className="mt-3 space-y-2.5 text-[16px] leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">Anonymous by default.</strong> Leave
              the name field blank and you appear as &ldquo;Anonymous&rdquo;.
            </li>
            <li>
              <strong className="text-ink">A person reviews it</strong> for
              anything that could identify you before it is published.
            </li>
            <li>
              <strong className="text-ink">You can withdraw it</strong> at any
              time, and it is removed permanently.
            </li>
            <li>
              <strong className="text-ink">Never name a suspect.</strong> Name
              the method instead — that is what protects the next reader, and it
              keeps you out of a defamation claim.
            </li>
            <li>
              Cases involving women and children are never published, at any
              stage. Anonymity is what makes those reports possible.
            </li>
          </ul>
        </Card>

        {/* Step 1 — the gate */}
        <Card className="mt-5">
          <label
            htmlFor="caseId"
            className="block text-[18px] font-semibold text-ink"
          >
            Your case number
          </label>
          <p className="mt-1 text-[16px] text-ink-soft">
            This is how we know you went through it. It is never published in
            full.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              id="caseId"
              value={caseId}
              onChange={(e) => {
                setCaseId(e.target.value);
                setChecked(false);
              }}
              placeholder="SHY-2026-07-1180"
              className="data min-w-0 flex-1 rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
            />
            <Button onClick={() => setChecked(true)} disabled={!caseId.trim()}>
              Check
            </Button>
          </div>

          {checked && !eligible.ok ? (
            <p
              role="alert"
              className="mt-3 rounded-[10px] border border-tertiary-border bg-tertiary-soft p-4 text-[16px] leading-relaxed text-ink"
            >
              {eligible.reason}
            </p>
          ) : null}

          {checked && eligible.ok && kase ? (
            <div className="mt-3 rounded-[10px] border border-secondary-border bg-secondary-soft p-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <IconShield className="h-5 w-5 text-secondary-text" />
                <span className="text-[16px] font-semibold text-ink">
                  Case found
                </span>
                <Chip tone={OUTCOME_TONE[outcomeOf(kase)]}>
                  {OUTCOME_LABEL[outcomeOf(kase)]}
                </Chip>
              </div>
              <p className="mt-2 text-[16px] text-ink-soft">
                <span className="data">
                  {formatPaise(kase.transaction?.amountPaise ?? 0)}
                </span>{" "}
                reported ·{" "}
                <span className="data">
                  {formatPaise(kase.restoration.creditedPaise)}
                </span>{" "}
                returned. We will show this outcome honestly on your story,
                whatever it is.
              </p>
            </div>
          ) : null}

          {!checked ? (
            <p className="mt-3 text-[15px] text-ink-faint">
              Signed in as a demo persona? Try{" "}
              <button
                type="button"
                onClick={() => {
                  setCaseId("SHY-2026-07-1180");
                  setChecked(true);
                }}
                className="font-semibold text-primary-text underline underline-offset-4"
              >
                SHY-2026-07-1180
              </button>{" "}
              (eligible) or{" "}
              <button
                type="button"
                onClick={() => {
                  setCaseId("SHY-2026-08-3312");
                  setChecked(true);
                }}
                className="font-semibold text-primary-text underline underline-offset-4"
              >
                SHY-2026-08-3312
              </button>{" "}
              (still open).
            </p>
          ) : null}
        </Card>

        {/* Step 2 — the story */}
        <fieldset
          disabled={!eligible.ok || !checked}
          className={clsx(
            "mt-5 transition-opacity",
            !eligible.ok || !checked ? "opacity-45" : "opacity-100",
          )}
        >
          <Card>
            <legend className="sr-only">Your story</legend>

            <label
              htmlFor="title"
              className="block text-[17px] font-semibold text-ink"
            >
              One line, in your words
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nine hours on a video call with a man in a police uniform"
              className="mt-2 w-full rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
            />

            <label
              htmlFor="body"
              className="mt-5 block text-[17px] font-semibold text-ink"
            >
              What happened
            </label>
            <p className="mt-1 text-[15px] text-ink-soft">
              How it started, what they said, and what you did. Write it in any
              language you like.
            </p>
            <textarea
              id="body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 w-full resize-y rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] leading-relaxed focus:border-primary focus:outline-none"
            />

            <label
              htmlFor="lesson"
              className="mt-5 block text-[17px] font-semibold text-ink"
            >
              The one thing you want the reader to remember
            </label>
            <input
              id="lesson"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="If someone tells you not to tell your family, that instruction is the crime."
              className="mt-2 w-full rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
            />

            <label
              htmlFor="name"
              className="mt-5 block text-[17px] font-semibold text-ink"
            >
              Name to show{" "}
              <span className="font-normal text-ink-faint">optional</span>
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous"
              className="mt-2 w-full rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
            />
            <p className="mt-1.5 text-[15px] text-ink-soft">
              Blank is the common choice, and the safe one. A first name and
              initial is as much as we would ever show.
            </p>

            <Button
              className="mt-6 w-full"
              disabled={!title.trim() || body.trim().length < 60}
              onClick={() => setSubmitted(true)}
            >
              Send for review
            </Button>
            <p className="mt-2 text-center text-[15px] text-ink-faint">
              Nothing is published straight away.
            </p>
          </Card>
        </fieldset>

        <p className="mt-8 text-[16px] text-ink-soft">
          Not ready to write?{" "}
          <Link
            href="/stories"
            className="link-draw font-semibold text-primary-text"
          >
            Read what others have written
          </Link>
          .
        </p>
      </Shell>
    </>
  );
}
