import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from './pages/Home';
import Model from './pages/model';
  
function App() {
return (
    <Router>
        <Routes>
            <Route exact path='/' element={<Home />} />
            <Route path='/Model' element={<Model/>} />
        </Routes>
    </Router>
);
}
  
export default App;