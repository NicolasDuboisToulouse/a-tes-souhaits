CREATE TABLE users (
  userName     varchar(40) NOT NULL,
  displayName  varchar(40) NOT NULL,
  passwordHash varchar(40) NOT NULL,
  firstLogin   integer     NOT NULL DEFAULT 1,
  isAdmin      integer     NOT NULL DEFAULT 0,
  PRIMARY KEY (userName)
);

CREATE TABLE lists (
  id    integer     PRIMARY KEY AUTOINCREMENT,
  title varchar(40) NOT NULL
);

CREATE TABLE listsOwners (
  listId   integer     NOT NULL,
  userName varchar(40) NOT NULL,
  PRIMARY KEY (listId, userName)
);

CREATE TABLE wishes (
  id          integer      PRIMARY KEY AUTOINCREMENT,
  listId      integer      NOT NULL,
  label       varchar(40)  NOT NULL,
  description varchar      NOT NULL DEFAULT '',
  draft       integer      NOT NULL DEFAULT 1,
  bookedBy    varchar(40)  NOT NULL DEFAULT ''
);
