CREATE TABLE wishes (
  id          integer      PRIMARY KEY AUTOINCREMENT,
  listId      integer      NOT NULL,
  label       varchar(40)  NOT NULL,
  description varchar      NOT NULL DEFAULT '',
  draft       integer      NOT NULL DEFAULT 1,
  bookedBy    varchar(40)  NOT NULL DEFAULT ''
);
