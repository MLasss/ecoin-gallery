import { Link } from "react-router-dom";

import "../assets/css/Home.css";


function Navbar( { connectWallet} ) {
  return (
    <>
    <nav className="navbar navbar-dark navbar-expand-lg bg-dark">
        <div className="container">
            <Link className="navbar-brand" to="/"><i>EmojiCoins Gallery</i></Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">    
                </ul>
                <div className="d-flex" role="search">
                    {connectWallet}
                </div>
            </div>
        </div>
    </nav>
    </>
  );
}

export default Navbar;