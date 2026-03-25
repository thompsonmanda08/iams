export const notifications: Notification[] = [];

export type Notification = {
  id: number;
  title: string;
  role: string;
  desc: string;
  avatar: string;
  status: string;
  unread_message?: boolean;
  has_notification?: boolean;
  type: string;
  date: string;
};
