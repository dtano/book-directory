-- Creates the book database
CREATE DATABASE book_db;
CREATE DATABASE book_db-test;

-- Books can be written by multiple authors
CREATE TABLE books(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    pages INTEGER,
    date_published DATE,
    cover VARCHAR(256)
);

-- Must be a many to many relationship
CREATE TABLE authors(
    id SERIAL PRIMARY KEY,
    given_names VARCHAR(255),
    surname VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    bio TEXT,
    profile_picture VARCHAR(256)
);

CREATE TABLE book_author(
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    constraint id PRIMARY KEY (book_id, author_id)
);

INSERT INTO books (title, pages, date_published) VALUES('The Great Gatsby', 165, '1920-05-06');
ALTER TABLE books
ALTER COLUMN author SET NOT NULL;

-- given a book id, find out its author
SELECT id FROM book_author ba JOIN authors a ON (ba.author_id = a.id) WHERE ba.book_id = 1; 

INSERT INTO book_author (author_id, book_id) VALUES();