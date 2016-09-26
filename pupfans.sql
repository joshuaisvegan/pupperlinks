
CREATE TABLE pupfans (
    id SERIAL primary key,
    name VARCHAR(255) not null,
    email VARCHAR(255) UNIQUE not null,
    password VARCHAR(225) not null
);
