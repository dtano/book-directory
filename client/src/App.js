import './App.css';
import Home from './components/HomePage/Home';
import NavBar from './components/NavBar/NavBar';
import {
  BrowserRouter as Router,
  Route, 
  Routes,
} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className='app'>
        <NavBar/>
        <div className='container'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/books' element={<h1>My Books</h1>}/>
            <Route path='/profile' element={<h1>My Profile</h1>}/>
            <Route path='/logout' element={<h1>Logout</h1>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;