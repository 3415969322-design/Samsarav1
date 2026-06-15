export type SearchItemType = "todo" | "document" | "diary" | "file";

export type SearchItem = {
  id: string;
  href: string;
  title: string;
  type: SearchItemType;
  excerpt?: string;
  updatedAt?: Date;
};
