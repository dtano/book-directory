import client from './client';

const bookRoute = 'api/book/';

const getAllBooks = () => client.get(`${bookRoute}`);

const getBookById = (bookId) => client.get(`${bookRoute}${bookId}`);

const bookApi = {
    getAllBooks,
    getBookById
}

export default bookApi;
// module.exports = {
//     getAllBooks,
//     getBookById
// }