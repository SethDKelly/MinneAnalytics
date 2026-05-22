"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DegreeMultiSelect } from "./DegreeMultiSelect";
import { TECHNICAL_LABELS } from "@/lib/constants";

type Props = {
  conferenceSlug: string;
  conferenceName: string;
};

export function SubmissionForm({ conferenceSlug, conferenceName }: Props) {
  const router = useRouter();
  const [degrees, setDegrees] = useState<string[]>(["None"]);
  const [coDegrees, setCoDegrees] = useState<string[]>(["None"]);
  const [hasCoPresenter, setHasCoPresenter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    form.set("conferenceSlug", conferenceSlug);
    form.set("degrees", JSON.stringify(degrees));
    if (hasCoPresenter) {
      form.set("coPresenterDegrees", JSON.stringify(coDegrees));
    }
    form.set("hasCoPresenter", String(hasCoPresenter));
    form.set("linkedinHasPhoto", form.get("linkedinHasPhoto") === "yes" ? "true" : "false");
    form.set(
      "travelReimbursementRequired",
      form.get("travelReimbursementRequired") === "yes" ? "true" : "false"
    );
    if (hasCoPresenter) {
      form.set(
        "coPresenterLinkedinHasPhoto",
        form.get("coPresenterLinkedinHasPhoto") === "yes" ? "true" : "false"
      );
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed");
        return;
      }
      router.push(
        `/submit/${conferenceSlug}/thanks?token=${encodeURIComponent(data.presenterToken)}`
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-minne-navy">Submit a presentation</h1>
        <p className="mt-2 text-gray-700">{conferenceName}</p>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-minne-navy">Primary presenter</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="firstName">First name *</label>
            <input id="firstName" name="firstName" required className="form-input" />
          </div>
          <div>
            <label className="form-label" htmlFor="lastName">Last name *</label>
            <input id="lastName" name="lastName" required className="form-input" />
          </div>
        </div>
        <DegreeMultiSelect
          name="degrees"
          label="Any degree(s) post Bachelors?"
          value={degrees}
          onChange={setDegrees}
          required
        />
        <div>
          <label className="form-label" htmlFor="jobTitle">Job title *</label>
          <input id="jobTitle" name="jobTitle" required className="form-input" />
        </div>
        <div>
          <label className="form-label" htmlFor="organization">Company / Organization *</label>
          <input id="organization" name="organization" required className="form-input" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-minne-navy">Presentation</h2>
        <div>
          <label className="form-label" htmlFor="title">Presentation title *</label>
          <input id="title" name="title" required className="form-input" />
        </div>
        <div>
          <label className="form-label" htmlFor="abstract">Presentation abstract *</label>
          <textarea
            id="abstract"
            name="abstract"
            required
            rows={6}
            className="form-input"
            minLength={50}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="technicalLevel">
            How much technical content does your presentation include? *
          </label>
          <select id="technicalLevel" name="technicalLevel" required className="form-input">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}: {TECHNICAL_LABELS[n]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="bio">Short professional bio *</label>
          <textarea id="bio" name="bio" required rows={4} className="form-input" minLength={20} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-minne-navy">Contact</h2>
        <div>
          <label className="form-label" htmlFor="email">Email address *</label>
          <input id="email" name="email" type="email" required className="form-input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="zipCode">Zip code *</label>
            <input id="zipCode" name="zipCode" required className="form-input" />
          </div>
          <div>
            <label className="form-label" htmlFor="phone">Phone number *</label>
            <input id="phone" name="phone" required className="form-input" />
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="linkedinUrl">LinkedIn profile URL *</label>
          <input id="linkedinUrl" name="linkedinUrl" type="url" required className="form-input" />
        </div>
        <div>
          <span className="form-label">Does your LinkedIn profile have a photo we can use? *</span>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="linkedinHasPhoto" value="yes" required defaultChecked />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="linkedinHasPhoto" value="no" required />
              No
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-minne-navy">Co-presenter</h2>
        <div>
          <span className="form-label">Will you have a co-presenter for this session? *</span>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="hasCoPresenterRadio"
                checked={!hasCoPresenter}
                onChange={() => setHasCoPresenter(false)}
              />
              No
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="hasCoPresenterRadio"
                checked={hasCoPresenter}
                onChange={() => setHasCoPresenter(true)}
              />
              Yes
            </label>
          </div>
        </div>
        {hasCoPresenter && (
          <div className="space-y-4 rounded border border-minne-navy/20 bg-gray-50 p-4">
            <div>
              <label className="form-label" htmlFor="coPresenterName">Co-presenter name *</label>
              <input id="coPresenterName" name="coPresenterName" className="form-input" />
            </div>
            <div>
              <label className="form-label" htmlFor="coPresenterEmail">Co-presenter e-mail *</label>
              <input id="coPresenterEmail" name="coPresenterEmail" type="email" className="form-input" />
            </div>
            <DegreeMultiSelect
              name="coPresenterDegrees"
              label="Co-presenter degree(s) post Bachelors?"
              value={coDegrees}
              onChange={setCoDegrees}
              required
            />
            <div>
              <label className="form-label" htmlFor="coPresenterJobTitle">Co-presenter job title *</label>
              <input id="coPresenterJobTitle" name="coPresenterJobTitle" className="form-input" />
            </div>
            <div>
              <label className="form-label" htmlFor="coPresenterOrganization">
                Co-presenter company / organization *
              </label>
              <input id="coPresenterOrganization" name="coPresenterOrganization" className="form-input" />
            </div>
            <div>
              <label className="form-label" htmlFor="coPresenterBio">Co-presenter short professional bio *</label>
              <textarea id="coPresenterBio" name="coPresenterBio" rows={3} className="form-input" />
            </div>
            <div>
              <label className="form-label" htmlFor="coPresenterLinkedinUrl">Co-presenter LinkedIn URL *</label>
              <input id="coPresenterLinkedinUrl" name="coPresenterLinkedinUrl" type="url" className="form-input" />
            </div>
            <div>
              <span className="form-label">Co-presenter LinkedIn photo for schedule? *</span>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="coPresenterLinkedinHasPhoto" value="yes" defaultChecked />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="coPresenterLinkedinHasPhoto" value="no" />
                  No
                </label>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-minne-navy">Logistics</h2>
        <div>
          <label className="form-label" htmlFor="travelRestriction">
            Travel restriction (only if you cannot travel certain days)
          </label>
          <textarea id="travelRestriction" name="travelRestriction" rows={2} className="form-input" />
        </div>
        <div>
          <span className="form-label">Do you require reimbursement for travel expenses? *</span>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="travelReimbursementRequired" value="no" defaultChecked />
              No
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="travelReimbursementRequired" value="yes" />
              Yes
            </label>
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="additionalInfo">
            Additional info for the selection committee
          </label>
          <textarea id="additionalInfo" name="additionalInfo" rows={3} className="form-input" />
        </div>
      </section>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Submitting…" : "Submit abstract"}
      </button>
    </form>
  );
}
