import './App.css'
import { Outlet } from 'react-router-dom'
import Header from "./components/Headers/Header.jsx";
import Footer from './components/Headers/Footer.jsx';    


function App() {

  return (
    <div className='max-w-screen-2xl mx-auto'>
      <Header/>
      
     <div className='min-h-[calc(100vh-136px)]'>
      <Outlet/>
      </div>
     
     <Footer/>
    </div>
  )
}

export default App
