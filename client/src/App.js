import React from 'react';
import './App.css';
import axios from 'axios';
import { Routes, Route, Link }  from 'react-router-dom'
import Home from './components/Home/Home'
import Register from './components/Register/Register'
import Login from './components/Login/Login'

class App extends React.Component{
  state = {
    data:  null
  }

  componentDidMount() {
    axios.get('http://localhost:5000')
    .then((response) => {
      this.setState({
        data: response.data
      })
    })
      .catch((error)  => {
        console.error(`Error fetching data: ${error}`)
      })
  }


  render() {
  return (
    <div className='App'>
      <header className= 'App-header'>
      <h1>GoodThings </h1>
      <ul>
        <li><Link to= "/">Home</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />}/>
          <Route path="/login" element={<Login />}/>
        </Routes>
      </main>
    </div>
  )
}
}

export default App;
