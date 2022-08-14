import BookCard from "./BookCard";

function BookGrid(props) {
    const bookList = props.books;
    const maxAmount = props.maxAmount == 0 ? bookList.length : props.maxAmount;
    
    return (
        <div className="book-list">
            {bookList?.slice(0, maxAmount).map((bookInformation) => <BookCard book={bookInformation} key={bookInformation.id}/>)}
        </div>
    )
}

export default BookGrid;