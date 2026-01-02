import { BrowserRouter, Route, Routes, Navigate  } from 'react-router-dom';
import './App.css'
import Login from './Components/Login/Login';
import Home from "./Components/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
