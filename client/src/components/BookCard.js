const BookDetailsStyle = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: 12
}

// const BookImage = {
//     width: '150px',
//     height: 'auto',
//     objectFit: 'scale-down',
//     //resizeMode: 'contain',
// }

const BookCardStyle = {
    width: '25%',
    height: '25%',
    flex: '1 0 25%',
    border: '1px solid black',
    textAlign: 'center',
    paddingBottom: '1em',
}


const BookCard = (props) => {
    const book = props.book;
    
    return(
        <div className='book-card' key={book.id} style={BookCardStyle}>
            {/* <img src={sample} alt="Test" style={BookImage}/> */}
            <h3 style={{marginBottom: 0}}>{book.title}</h3>
            <ul style={BookDetailsStyle}> 
                {/* <li>{book.genre}</li> */}
                <li>{getBookAuthorNames(book.Authors)}</li>
            </ul>
        </div>
    );
}

// Need a more thorough way of doing this
const getBookAuthorNames = (authors) => {
    var allAuthorNames = [];

    for(const author of authors){
        allAuthorNames.push(`${author.given_names} ${author.surname}`);
    }

    return allAuthorNames.join(', ');
}

export default BookCard;