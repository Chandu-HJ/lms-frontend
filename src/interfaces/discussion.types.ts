export interface DiscussionMessage {
  id: number;
  parentId: number | null;
  content: string;
  senderName: string;
  senderAvatar: string | null;
  createdAt: string;
  replies: DiscussionMessage[];
  pinned: boolean;
  bestAnswer: boolean;
}
