export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export type EventTag = Pick<Tag, 'id' | 'name' | 'color'>;

export interface TagsResponse {
  result: Tag[];
}
