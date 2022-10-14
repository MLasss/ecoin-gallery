import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Item.css";
import LoadingImage from "../assets/images/loading.gif";

function Item( {token} ) {
  const [ metadata, setMetdata ] = useState(null);
  const navigate = useNavigate();

  useEffect(()=> {
    if (token?.rawMetadata){
      let meta = token.rawMetadata;
      if (meta?.image){
        meta.image = meta.image.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
      }
      setMetdata(meta)
    }
  },[token])

  function navigateToItem(){
    navigate(`/items/${token.tokenId}`);
  }
  return (
    <div className="card my-3 item-card" onClick={navigateToItem}>
    <div className="card-header" style={{backgroundColor: "#"+metadata?.background_color}}>
      <img 
        className="card-img-top" 
        onError={({ currentTarget }) => {
          currentTarget.src=LoadingImage;
          setTimeout(function() { currentTarget.src=metadata?.image; }, 200);
        }}
        src={metadata?.name + '# error'} 
        alt="..."
      />
    </div>
    
    <div className="card-body">
      <h5 className="card-title">{metadata?.name}</h5>
    </div>
  </div>
  );
}

export default Item;
