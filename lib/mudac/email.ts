import { sendEmailStub } from "@/lib/email-stub";

export function emailMudacJudgeRegistered(params: {
  email: string;
  name: string;
  eventName: string;
  judgePortalUrl: string;
}): void {
  sendEmailStub({
    to: params.email,
    subject: `MinneMUDAC judge access — ${params.eventName}`,
    template: "mudac-judge-registered",
    body: `Hi ${params.name},\n\nThank you for volunteering to judge ${params.eventName}.\n\nUse your private judging link (save this email):\n\n${params.judgePortalUrl}\n\nYou will score student team presentations assigned to your panel. Do not share this link.\n\nThank you,\nMinneAnalytics`,
  });
}
