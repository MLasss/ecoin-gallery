import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ConnectWallet from "./components/ConnectWallet";
import Footer from "./components/Footer";

import Home from "./views/Home";
import ItemDetails from "./views/ItemDetails";

function App() {
  const [ accountConnected, setAccountConnected] = useState(null);

  function handleOnAccountConnect(val){
    setAccountConnected(val);
  }

  return (
    <>
      <Navbar connectWallet={<ConnectWallet onAccountConnect={handleOnAccountConnect}/>}/>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home accountConnected={accountConnected}/>} />
          <Route path="items/:id" element={<ItemDetails accountConnected={accountConnected}/>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
