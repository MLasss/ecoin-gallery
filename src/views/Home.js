import { useState, useEffect } from "react";
import alchemyClient from "../lib/alchemyClient";
import ItemList from "../components/ItemList";
import "../assets/css/Home.css";


function Home( { accountConnected} ) {

  const [ ownedTokens, setOwnedTokens ] = useState([]);
  const [ totalCount, setTotalCount ] = useState(0);
  
  useEffect(() => {
    if (accountConnected){
      async function fetchData(){
        let pageKey = "  ";
        let tokens = [];
        while (pageKey){
          let r = await alchemyClient.nft.getNftsForOwner(accountConnected, {pageKey:pageKey, contractAddresses:[process.env.REACT_APP_ERC721_TOKEN_ADDRESS]});
          pageKey = r.pageKey;
          tokens.push(...r.ownedNfts);
          setTotalCount(r.totalCount);
        }
        setOwnedTokens(tokens);
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
              <ItemList tokens={ownedTokens} totalCount={totalCount} accountConnected={accountConnected} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Home;
