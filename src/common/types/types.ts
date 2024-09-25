export type TagType = {
  id: string;
  label: string;
};

export type PostType = {
  id: string;
  title: string;
  body: string;
  tags?: TagType[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
};
