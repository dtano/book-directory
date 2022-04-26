const BookDetails = {
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


function BookCard(props) {
    const book = props.book;
    
    return(
        <div className='book-card' key={book.id} style={BookCardStyle}>
            {/* <img src={sample} alt="Test" style={BookImage}/> */}
            <h3 style={{marginBottom: 0}}>{book.title}</h3>
            <ul style={BookDetails}> 
                <li>{book.genre}</li>
                <li>{book.author}</li>
            </ul>
        </div>
    );
}

export default BookCard;