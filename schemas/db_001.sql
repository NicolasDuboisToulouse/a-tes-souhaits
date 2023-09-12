CREATE TABLE users (
  userName     varchar(40) NOT NULL,
  displayName  varchar(40) NOT NULL,
  passwordHash varchar(40) NOT NULL,
  firstLogin   integer     NOT NULL DEFAULT 1,
  isAdmin      integer     NOT NULL DEFAULT 0,
  PRIMARY KEY (userName)
);
