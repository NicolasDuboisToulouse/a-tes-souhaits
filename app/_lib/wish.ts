export enum BookedBy {
  Nobody = 0,
  Me     = 1,
  Other  = 2,
};

export type Wish = {
  id:          number,
  label:       string,
  description: string,
  draft:       boolean,
  bookedBy:    BookedBy,
};

export type WishArray = Array<Wish>;
