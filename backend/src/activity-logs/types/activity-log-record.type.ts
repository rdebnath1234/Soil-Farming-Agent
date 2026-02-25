export interface ActivityLogRecord {
  _id: string;
  action: string;
  actorEmail: string;
  actorRole: string;
  message: string;
  createdAt: string;
}
