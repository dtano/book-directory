-- Creates the book database
CREATE DATABASE book_db;
CREATE DATABASE book_db-test;

-- Books can be written by multiple authors
CREATE TABLE books(
    book_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author VARCHAR(255) NOT NULL, -- Possibly make author a foreign key
    pages INTEGER,
    date_published DATE
);

CREATE TABLE authors{
    author_id SERIAL PRIMARY KEY,
    given_names VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    bio TEXT
};

ALTER TABLE books
ALTER COLUMN author SET NOT NULL;