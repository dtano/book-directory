import client from './client';

const bookRoute = 'api/book/';


const getAllBooks = () => { return client.get(`${bookRoute}`); }

const getBookById = (bookId) => { return client.get(`${bookRoute}${bookId}`);}

const createBook = (formData) => {
    return client.post(`${bookRoute}`, JSON.stringify(formData));
}

const updateBook = (bookId, updatedData) => {
    return client.put(`${bookRoute}${bookId}`, JSON.stringify(updatedData));
}

const deleteBook = (bookId) => {
    return client.delete(`${bookRoute}${bookId}`);
}

const bookApi = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
}

export default bookApi;