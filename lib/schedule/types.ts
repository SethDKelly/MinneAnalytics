export type ScheduleTalk = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  organization: string;
  technicalLevel: number;
  isSoftSkill: boolean;
  degrees: string[];
};

export type ScheduleState = {
  conferenceName: string;
  rooms: { id: string; name: string }[];
  slots: { id: string; label: string; slotType: string }[];
  placements: {
    id: string;
    slotId: string;
    roomId: string;
    submission: ScheduleTalk | null;
  }[];
  unscheduled: ScheduleTalk[];
  approvedCount: number;
};
