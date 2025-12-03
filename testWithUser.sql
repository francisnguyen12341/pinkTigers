DROP DATABASE obsidianclone;

CREATE DATABASE obsidianclone;
\c obsidianclone

CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE
);  

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  main_folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  content VARCHAR(10000),
  folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE edges (
  id SERIAL PRIMARY KEY,
  note1 INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  note2 INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE
);

CREATE TABLE tokens (
  token VARCHAR(100) NOT NULL,
  username VARCHAR(20) NOT NULL REFERENCES users(username) ON DELETE CASCADE
);

INSERT INTO folders (name)
VALUES ('root');

INSERT INTO users (username, password, main_folder_id)
VALUES ('some_user', 'password', 1);

SELECT * FROM folders;
SELECT * FROM users;