import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingImage from "../assets/images/loading.gif";
import "../assets/css/Item.css";

function Item( {token} ) {
  const [ metadata, setMetdata ] = useState(null);
  const navigate = useNavigate();

  useEffect(()=> {
    setMetdata(null);
    if (token?.rawMetadata){
      let meta = token.rawMetadata;
      if (meta?.image){
        meta.image = meta.image.replace("ipfs://", process.env.REACT_APP_IPFS_GATEWAY);
      }
      setTimeout(function() { setMetdata(meta) }, 200);
    }
  },[token])

  function navigateToItem(){
    navigate(`/items/${token.tokenId}`);
  }

  return (
    <div className="card my-3 item-card" onClick={navigateToItem}>
    <div className="card-header" style={{backgroundColor: "#" + metadata?.background_color}}>
      <img 
        className="card-img-top" 
        onError={({ currentTarget }) => {
          currentTarget.src=LoadingImage;
          setTimeout(function() { currentTarget.src = metadata?.image; }, 200);
        }}
        src={metadata != null ? metadata?.image : LoadingImage} 
        alt="..."
      />
    </div>
    <div className="card-body">
      <h5 className="card-title">{metadata != null ? metadata?.name : "Loading..."}</h5>
    </div>
  </div>
  );
}

export default Item;
