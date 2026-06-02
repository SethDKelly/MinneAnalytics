export type EmailStubPayload = {
  to: string;
  subject: string;
  body: string;
  template?: string;
};

/** Demo: log intended emails instead of sending via SMTP. */
export function sendEmailStub(payload: EmailStubPayload): void {
  const line = [
    "[MinneAnalytics email stub]",
    `To: ${payload.to}`,
    `Subject: ${payload.subject}`,
    payload.template ? `Template: ${payload.template}` : "",
    "---",
    payload.body,
    "---",
  ]
    .filter(Boolean)
    .join("\n");
  console.log(line);
}

export function emailPresenterFeedback(params: {
  email: string;
  presenterName: string;
  title: string;
  presenterPortalUrl: string;
  kind: "ABSTRACT" | "GENERAL";
}): void {
  const kindLabel =
    params.kind === "ABSTRACT" ? "abstract feedback" : "general feedback";
  sendEmailStub({
    to: params.email,
    subject: `Committee feedback on your submission — ${params.title}`,
    template: "presenter-feedback",
    body: `Hi ${params.presenterName},\n\nThe program committee left ${kindLabel} on your presentation "${params.title}". Sign in to your presenter portal to read it and update your submission if needed:\n\n${params.presenterPortalUrl}\n\nThank you,\nMinneAnalytics`,
  });
}

export function emailAbstractApproved(params: {
  email: string;
  presenterName: string;
  title: string;
  presenterPortalUrl: string;
}): void {
  sendEmailStub({
    to: params.email,
    subject: `Your talk was approved — ${params.title}`,
    template: "abstract-approved",
    body: `Hi ${params.presenterName},\n\nYour presentation "${params.title}" has been approved for the program. Upload your slide deck using your private presenter link:\n\n${params.presenterPortalUrl}\n\nThank you,\nMinneAnalytics`,
  });
}
