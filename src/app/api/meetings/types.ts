export interface MeetingQueryFilter {
  $or: Array<{ createdBy: string } | { participants: { $in: string[] } }>;
  startsAt?: { $gt: string } | { $lt: string };
}