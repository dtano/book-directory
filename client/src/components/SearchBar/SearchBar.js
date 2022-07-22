import './SearchBar.css';

const SearchBar = (props) => {
    return(
        <div className='search-bar'>
            <form action="/#">
                <input type='text' placeholder='Search books'/>
                <button type='submit'><i className="fas fa-search"></i></button>
            </form>
        </div>
    )
}

export default SearchBar;