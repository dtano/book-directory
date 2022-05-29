import './App.css';
import FeaturedBooks from './components/FeaturedBooks';
import NavBar from './components/NavBar/NavBar';

function App() {
  return (
    <div className='app'>
      <NavBar/>
      <FeaturedBooks/>
    </div>
  );
}

export default App;