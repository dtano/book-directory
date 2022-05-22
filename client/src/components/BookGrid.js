import BookCard from "./BookCard";

const BookGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    border: '1px solid #c3c3c3',
    gap: '1.5em',
}


function BookGrid(props) {
    const bookList = props.books;
    
    return (
        <div className="book-list" style={BookGridStyle}>
            {bookList?.map((bookInformation) => <BookCard book={bookInformation} key={bookInformation.id}/>)}
        </div>
    )
}

export default BookGrid;