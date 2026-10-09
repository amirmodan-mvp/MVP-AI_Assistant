
export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
};

export type CreateNoteInput = {
  title: string;
  content: string;
};

export type UpdateNoteInput = Partial<CreateNoteInput>;