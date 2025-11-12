CREATE DATABASE obsidianclone;
\c obsidianclone

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  main_folder_id INTEGER
);

CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  text VARCHAR(10000),
  folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE tokens (
  token VARCHAR(100) NOT NULL,
  username VARCHAR(20) NOT NULL REFERENCES users(username) ON DELETE CASCADE
);

ALTER TABLE users
  ADD CONSTRAINT fk_main_folder
  FOREIGN KEY (main_folder_id) REFERENCES folders(id);
