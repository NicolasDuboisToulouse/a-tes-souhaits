CREATE TABLE lists (
  id    integer     PRIMARY KEY AUTOINCREMENT,
  title varchar(40) NOT NULL
);

CREATE TABLE listsOwners (
  listId   integer     NOT NULL,
  userName varchar(40) NOT NULL,
  PRIMARY KEY (listId, userName)
);
