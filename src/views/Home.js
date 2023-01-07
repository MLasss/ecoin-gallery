import { useState, useEffect } from "react";
import alchemyClient from "../lib/alchemyClient";
import ItemList from "../components/ItemList";
import Alert from 'react-bootstrap/Alert'
import RandomSentence from '../components/RandomSentence';
import "../assets/css/Home.css";


function Home( { accountConnected} ) {
  const [ ownedTokens, setOwnedTokens ] = useState([]);
  const [ showMessage, setShowMessage ] = useState(true);
  const [ totalCount, setTotalCount ] = useState(0);
  const [ loaded, setLoaded ] = useState(false);
  
  useEffect(() => {
    if (accountConnected){
      async function fetchData(){
        setLoaded(false);
        let pageKey = "  ";
        let tokens = [];
        while (pageKey){
          let r = await alchemyClient.nft.getNftsForOwner(accountConnected, {pageKey:pageKey, contractAddresses:[process.env.REACT_APP_ERC721_TOKEN_ADDRESS]});
          pageKey = r.pageKey;
          tokens.push(...r.ownedNfts);
          setTotalCount(tokens.length);
          if (tokens.length >= process.env.REACT_APP_GALLERY_MAX_ITEMS_COUNT)
          break;
        }
        setOwnedTokens(tokens);
        setLoaded(true);
      }
      fetchData();
    }
    
  }, [accountConnected])


  return (
    <>
      <div className="row my-3">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <Alert variant="secondary" show={showMessage && totalCount > 0} onClose={() => setShowMessage(false)} dismissible>
                <RandomSentence jsonFileName="tips" className="mb-0" delay={30000}/>
              </Alert> 
              <ItemList tokens={ownedTokens} totalCount={totalCount} accountConnected={accountConnected} loaded={loaded}/>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Home;
