import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCoinPrice } from "../lib/helpers";
import { getCoinFull, getCoin } from "../lib/datastorage";
import { setName, setDescription, burnCoin, getClonePrice, cloneCoin} from "../lib/userAccess";
import { approve } from "../lib/erc20";
import { approvenft, getTokenURI, getOwnerOf } from "../lib/erc721";
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Stepper from "react-stepper-horizontal/lib/Stepper";
import TokenAttribute from "../components/TokenAttribute";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { LazyLoadImage } from "react-lazy-load-image-component";
import LoadingImage from "../assets/images/loading.gif";
import alchemyClient from "../lib/alchemyClient";
import "../assets/css/ItemDetails.css";

function ItemDetails( { accountConnected } ) {
  const { id } = useParams();
  const [ showMessage, setShowMessage ] = useState(false);
  const [ headerMessage, setHeaderMessage ] = useState(null);
  const [ showRefreshLink, setShowRefreshLink ] = useState(true);
  const [ metadata, setMetadata ] = useState(null);
  const [ coinFullDetail, setCoinFullDetail] = useState(null);
  const [ coinDetail, setCoinDetail] = useState(null);
  const [ owner, setOwner ] = useState(null);
  const [ owned, setOwned ] = useState(false);
  const [ locked, setLocked ] = useState(false);
  const [ dataStorageCoin, setDataStorageCoin] = useState(null);
  const [ cloneable, setCloneable ] = useState(false);
  const [ loaded, setLoaded ] = useState(false);
  const [ inputErrors, setInputErrors ] = useState("");
  const [ nameChangeModalVisibiltiy, setNameChangeModalVisibiltiy] = useState(false);
  const [ tokenName, setTokenName ] = useState("");
  const [ nameChangeStep, setNameChangeStep ] = useState(0);
  const [ nameChangeApproveBtnText, setNameChangeApproveBtnText] = useState("Approve");
  const [ nameChangeApproveBtnDisabled, setNameChangeApproveBtnDisabled] = useState(false);
  const [ nameChangeActionBtnText, setNameChangeActionBtnText] = useState("Change Name");
  const [ nameChangeActionBtnDisabled, setNameChangeActionBtnDisabled] = useState(false);
  const [ descriptionChangeModalVisibiltiy, setDescriptionChangeModalVisibiltiy] = useState(false);
  const [ tokenDescription, setTokenDescription ] = useState("");
  const [ descriptionChangeStep, setDescriptionChangeStep ] = useState(0);
  const [ descriptionChangeApproveBtnText, setDescriptionChangeApproveBtnText] = useState("Approve");
  const [ descriptionChangeApproveBtnDisabled, setDescriptionChangeApproveBtnDisabled] = useState(false);
  const [ descriptionChangeActionBtnText, setDescriptionChangeActionBtnText] = useState("Change Description");
  const [ descriptionChangeActionBtnDisabled, setDescriptionChangeActionBtnDisabled] = useState(false);
  const [ cloneCoinModalVisibiltiy, setCloneCoinModalVisibiltiy] = useState(false);
  const [ cloneCoinStep, setCloneCoinStep ] = useState(0);
  const [ cloneCoinApproveBtnText, setCloneCoinApproveBtnText] = useState("Approve");
  const [ cloneCoinApproveBtnDisabled, setCloneCoinApproveBtnDisabled] = useState(false);
  const [ cloneCoinActionBtnText, setCloneCoinActionBtnText] = useState("Clone");
  const [ cloneCoinActionBtnDisabled, setCloneCoinActionBtnDisabled] = useState(false);
  const [ emojiCount, setEmojiCount ] = useState(0);
  const [ burnCoinModalVisibility, setBurnCoinModalVisibility] = useState(false);
  const [ burnActionBtnText, setBurnActionBtnText] = useState("Burn");
  const [ burnActionBtnDisabled, setBurnActionBtnDisabled] = useState(false);
  
  useEffect(() => {

    loadCoinMetadata();

    getOwnerOf(id).then(data => {
      setOwner(data);
      let isOwned = data != null && data === accountConnected;
      setOwned(isOwned);
      if (isOwned) {
        getCoin(id).then(data => setCoinDetail(data));
      }
    });
    getCoinFull(id).then(data => setCoinFullDetail(data));
  }, [id, accountConnected]);

  function loadCoinMetadata() {
    getTokenURI(id).then(data => {

      let base64ToString = Buffer.from(data.substring(29), "base64").toString();
      let meta = JSON.parse(base64ToString);

      if (meta?.image){
        meta.image = meta.image.replace("ipfs://", process.env.REACT_APP_IPFS_GATEWAY);
      }
      if (meta?.attributes){
        const isCloneable = meta?.attributes.find(attr => attr.value === "Cloneable");
        const isLocked = meta?.attributes.find(attr => attr.value === "Locked");
        setCloneable(isCloneable);
        setLocked(isLocked);
      }
      setMetadata(meta);
      setLoaded(true);      
    });
  }
  
  function setEmojiPrice(multiplier){
      getCoinPrice(coinFullDetail?.coinType).then(coinPrice => {
        setEmojiCount(multiplier * coinPrice / 1000000000000000000);
      });
  }

  // Change Name Modal -----------------------------------------------------------------

  function handleTokenNameInput(val){
    setTokenName(val.replace(/[^[ A-Za-z0-9_@/#+$!\d*]/ig, ""))
  }

  function nameChangeModalShow(){
    setNameChangeStep(0);
    setEmojiPrice(0.5);
    setNameChangeApproveBtnText("Approve Emoji Burn");
    setNameChangeActionBtnText("Change Name");
    setNameChangeApproveBtnDisabled(false);
    setNameChangeActionBtnDisabled(true);
    setNameChangeModalVisibiltiy(true);
    setInputErrors("");
  }

  function nameChangeApprove(){
    resetNameChangeModalFields();
    if (tokenName !== ""){
      setNameChangeApproveBtnText("Approving...");
      setNameChangeApproveBtnDisabled(true);
      getCoinFull(id).then(data => {
        const coinPrice = getCoinPrice(data.coinType);
        approve(process.env.REACT_APP_USERACCESS_ADDRESS, coinPrice).then(val => {
          if (val === "1"){
            setNameChangeStep(1);
            setNameChangeActionBtnDisabled(false);
            setNameChangeApproveBtnText("Approved");
          }else{
            setInputErrors(extractMessage(val?.message));
            setNameChangeApproveBtnDisabled(false)
            setNameChangeApproveBtnText("Approve Emoji Burn");
          }
        })
      })
    } else {
      setInputErrors("Coin name must be provided");
    }
  }

  async function changeName(){
    setInputErrors("");
    if (tokenName !== ""){
      setNameChangeActionBtnDisabled(true);
      setNameChangeActionBtnText("Changing...");
      setName(id, tokenName).then(val => {
        if (val === "1"){
          displayMessageRefresh("Coin name was changed successfully! Click 'Refresh Metadata' if changes are  not reflected on 'My Gallery'. Refresh Metadata on Opensea gallery to see changes on Opensea.");
          setNameChangeModalVisibiltiy(false);
          loadCoinMetadata();
        }else{
          setInputErrors(extractMessage(val?.message));
        }
        setNameChangeActionBtnText("Change Name");
        setNameChangeActionBtnDisabled(false);
      })
    }else{
      setInputErrors("Coin name must be provided");
    }
  }

  function resetNameChangeModalFields(){
    setInputErrors("");
    setNameChangeActionBtnDisabled(true);
  }

  // Change Description Modal -----------------------------------------------------------------

  function handleTokenDescriptionInput(val){
    setTokenDescription(val.replace(/[^[ A-Za-z0-9_@/#+$!\d*]/ig, ""))
  }

  function descriptionChangeModalShow(){
    setDescriptionChangeStep(0);
    setEmojiPrice(1);
    setDescriptionChangeApproveBtnText("Approve Emoji Burn");
    setDescriptionChangeActionBtnText("Change Description");
    setDescriptionChangeApproveBtnDisabled(false);
    setDescriptionChangeActionBtnDisabled(true);
    setDescriptionChangeModalVisibiltiy(true);
    setInputErrors("");
  }

  function descriptionChangeApprove(){
    resetDescriptionChangeModalFields();
    if (tokenDescription !== ""){
      setDescriptionChangeApproveBtnText("Approving...");
      setDescriptionChangeApproveBtnDisabled(true);
      getCoinFull(id).then(data => {
        const coinPrice = getCoinPrice(data.coinType);
        approve(process.env.REACT_APP_USERACCESS_ADDRESS, coinPrice).then(val => {
          if (val === "1"){
            setDescriptionChangeStep(1);
            setDescriptionChangeActionBtnDisabled(false);
            setDescriptionChangeApproveBtnText("Approved");
          } else {
            setInputErrors(extractMessage(val?.message));
            setDescriptionChangeApproveBtnDisabled(false);
            setDescriptionChangeApproveBtnText("Approve Emoji Burn");
          }
        })
      })
    } else {
      setInputErrors("Coin description must be provided");
    }
  }

  async function changeDescription(){
    setInputErrors("");
    if (tokenDescription !== ""){
      setDescriptionChangeActionBtnDisabled(true);
      setDescriptionChangeActionBtnText("Changing...");
      setDescription(id, tokenDescription).then(val => {
        if (val === "1"){
          displayMessageRefresh("Coin description was changed successfully! Click 'Refresh Metadata' if changes are  not reflected on 'My Gallery'. Refresh Metadata on Opensea gallery to see changes on Opensea.");
          setDescriptionChangeModalVisibiltiy(false);
          loadCoinMetadata();
        } else {
          setInputErrors(extractMessage(val?.message));
        }
        setDescriptionChangeActionBtnText("Change Description");
        setDescriptionChangeActionBtnDisabled(false);
      })
    }else{
      setInputErrors("Coin description must be provided");
    }
  }

  function resetDescriptionChangeModalFields(){
    setInputErrors("");
    setDescriptionChangeActionBtnDisabled(true);
  }

  // Clone Coin Modal -----------------------------------------------------------------

  function cloneCoinModalShow(){
    setCloneCoinStep(0);
    setCloneEmojiCount();
    setCloneCoinApproveBtnText("Approve Emoji Burn");
    setCloneCoinActionBtnText("Clone");
    setCloneCoinApproveBtnDisabled(false);
    setCloneCoinActionBtnDisabled(true);
    setCloneCoinModalVisibiltiy(true);
    setInputErrors("");
  }

  function setCloneEmojiCount(){
    getClonePrice(id).then(clonePrice => {
      setEmojiCount(clonePrice / 1000000000000000000);
    });
}

  function cloneCoinApproveClick(){
    resetCloneCoinModalFields();
    setCloneCoinApproveBtnText("Approving...");
    setCloneCoinApproveBtnDisabled(true);
    getClonePrice(id).then(coinPrice => {
      approve(process.env.REACT_APP_USERACCESS_ADDRESS, coinPrice).then(val => {
        if (val === "1"){
          setCloneCoinStep(1);
          setCloneCoinActionBtnDisabled(false);
          setCloneCoinApproveBtnText("Approved");
        } else {
          setInputErrors(extractMessage(val?.message));
          setCloneCoinApproveBtnDisabled(false);
          setCloneCoinApproveBtnText("Approve Emoji Burn");
        }
      })
    })

  }

  async function cloneCoinClick(){
    setInputErrors("");
    setCloneCoinActionBtnDisabled(true);
    setCloneCoinActionBtnText("Cloning...");
    cloneCoin(id).then(val => {
      if (val === "1"){
        displayMessageRefresh("The Coin was cloned successfully and shortly will arrive in your wallet! Click 'Refresh Metadata' if changes are  not reflected on 'My Gallery'. Refresh Metadata on Opensea gallery to see changes on Opensea.");
        setCloneCoinModalVisibiltiy(false);
        loadCoinMetadata();
        getCoinFull(id).then(data => setCoinFullDetail(data));
      } else {
        setInputErrors(extractMessage(val?.message));
      }
      setCloneCoinActionBtnText("Clone");
      setCloneCoinActionBtnDisabled(false);
    })
  }

  function resetCloneCoinModalFields(){
    setInputErrors("");
    setCloneCoinActionBtnDisabled(true);
  }  

  // Burn Modal ----------------------------

  function handleShowBurnItemModalBtn(){
    getCoin(id).then(data => {
      setBurnActionBtnText("Burn Coin");
      setInputErrors("");
      setBurnActionBtnDisabled(false);
      setEmojiPrice(0.9);
      setDataStorageCoin(data);
      setBurnCoinModalVisibility(true);
    })
    
  }

  function burnItem(){
    
    setInputErrors("");
    setBurnActionBtnText("Approving...");
    setBurnActionBtnDisabled(true);

    approvenft(process.env.REACT_APP_USERACCESS_ADDRESS, id).then(val => {
      if (val === "1"){
        setBurnActionBtnText("Burning...");
        burnCoin(id).then(val => {
          if (val === "1"){
            setBurnCoinModalVisibility(false);
            displayMessageRefresh("Coin was burned Successfully! Refresh Metadata on Opensea gallery to see changes on Opensea.");
          } else {
            setInputErrors(extractMessage(val?.message));
            setBurnActionBtnText("Burn Coin");
            setBurnActionBtnDisabled(false);
          }
        });
      } else {
        setInputErrors(extractMessage(val?.message));
        setBurnActionBtnText("Burn Coin");
        setBurnActionBtnDisabled(false);
      }
    });
  }

  function refreshScreenData() {
    loadCoinMetadata();
    getCoinFull(id).then(data => setCoinFullDetail(data));
  }  

  function refreshMetadata() {
    alchemyClient.nft.getNftMetadata(process.env.REACT_APP_ERC721_TOKEN_ADDRESS, id).then(nft => {
      if (Math.floor((Date.now() - new Date(nft.timeLastUpdated))/60000) < 15 ) {
        displayMessage("Metadata can be refreshed every 15 min.");
      }
      alchemyClient.nft.refreshNftMetadata(process.env.REACT_APP_ERC721_TOKEN_ADDRESS, id);
    });
  }

  function displayMessage(message){
    setShowRefreshLink(false);
    setHeaderMessage(message);
    setShowMessage(true);  
  }

  function displayMessageRefresh(message){
    setShowRefreshLink(true);
    setHeaderMessage(message);
    setShowMessage(true);  
  }   

  function extractMessage(message) {
    if (message == null) return "Failed to execute transaction.";

    let startIndex = message.indexOf('execution reverted:');
    if (startIndex > 0)
    {
      let userMessage = message.substring(startIndex + 20);
      return userMessage.substring(0, userMessage.indexOf('"'))
    }

    if (message.length > 100) return "Failed to execute transaction.";

    return message;
  }

  return (
    <>
    { loaded ? (
      <div className="row my-3">
        <div className="col-md-12">
          <div className="card py-3  item-details-container">
            <div className="px-3">
              <Alert variant="secondary" show={showMessage} onClose={() => setShowMessage(false)} dismissible>
                <p className="mb-0">
                    {headerMessage}
                    {
                      showRefreshLink ?
                      <><br/>You may need to wait few sec. and click <button type="button" className="btn btn-link pt-0 px-0" onClick={refreshScreenData}>Refresh Screen</button> to see updated data on the screen.</>
                        : <></>
                    }                     
                </p>
              </Alert> 
            </div>
            <div className="px-3">
              <Link className="btn btn-primary py-1" to="/">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 18 18">
                  <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                </svg> 
                 My Gallery
              </Link>
              <button type="button" className="btn btn-light action-btn py-1 align-right" onClick={refreshMetadata} disabled={!owned} >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 18 18">
                  <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                </svg>                            
                Refresh Metadata
              </button>              
            </div>
            <div className="card-body py-2">
              <div className="row">
                <div className="col-md-4">

                  <Tabs
                    defaultActiveKey="coin"
                    transition={false}
                    fill
                  >
                    <Tab eventKey="coin" title="Coin">
                      <div className="mb-3 card item-card" style={{backgroundColor: "#"+metadata?.background_color}}>
                        <LazyLoadImage placeholderSrc={LoadingImage} src={metadata?.image} className="img-fluid" alt="" 
                          onError={({ currentTarget }) => {
                            displayMessage("It's taking longer to load image from IPFS, please be patient.");
                            currentTarget.src=LoadingImage;
                            setTimeout(function() { currentTarget.src=metadata?.image; }, 500);
                          }} 
                        />
                      </div>
                      {
                        !locked && owned && coinDetail != null? (
                          <a href={process.env.REACT_APP_IPFS_GATEWAY + process.env.REACT_APP_VOX_CID + '/' + coinDetail?.coinTemplate + '.vox'} target="_blank" rel="noopener noreferrer" download>
                            <button type="button" className="btn btn-primary action-btn px-4 mx-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-download" viewBox="0 0 19 19">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                              </svg>                        
                              Download VOX
                            </button> 
                          </a>                          
                        ) :  <></>
                      }
                    </Tab>
                    {
                      !locked && owned && coinDetail != null? (
                        <Tab eventKey="emoji" title="Emoji">
                        <div className="mb-3 card sharp-image item-card">
                          <LazyLoadImage placeholderSrc={LoadingImage} src={process.env.REACT_APP_IPFS_GATEWAY + process.env.REACT_APP_FACE_CID + '/' + coinDetail?.coinTemplate + '.png'} className="img-fluid" alt=""
                            onError={({ currentTarget }) => {
                              currentTarget.src=LoadingImage;
                              setTimeout(function() { currentTarget.src=process.env.REACT_APP_IPFS_GATEWAY + process.env.REACT_APP_FACE_CID + '/' + coinDetail?.coinTemplate + '.png'; }, 500);
                            }} 
                          />
                        </div>
                        <a href={process.env.REACT_APP_IPFS_GATEWAY + process.env.REACT_APP_FACE_CID + '/' + coinDetail?.coinTemplate + '.png'} target="_blank" rel="noopener noreferrer" download>
                          <button type="button" className="btn btn-primary action-btn px-4 mx-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-download" viewBox="0 0 19 19">
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>                        
                            Download PNG
                          </button>                         
                        </a>
                      </Tab>
                      ) :  <></>
                    }
                  </Tabs>
                </div>
                <div className="col-md-8 px-1">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="row px-2">
                        <div className="col-md-11"><h3>{ metadata?.name }</h3></div>
                          <div className="col-md-1">
                          {
                          !locked && owned ? ( 
                            <>
                              <img src={require('../assets/images/icons/pencil-square.svg').default} className="btn-icon" alt="Edit Name" width="24" height="24" onClick={() => nameChangeModalShow()}></img>
                            </>
                            ) : <></>
                          }
                          </div>
                      </div>
                      <div className="row px-2">
                        <div className="col-md-11"><p>{ metadata?.description}</p></div>
                        <div className="col-md-1">
                          {
                            !locked && owned ? ( 
                              <>
                                <img src={require('../assets/images/icons/pencil-square.svg').default} className="btn-icon" alt="Edit Description" width="24" height="24" onClick={() => descriptionChangeModalShow()}></img>
                              </>
                              ) : <></>
                            }                          
                        </div>
                      </div>
                      <div className="row px-2">
                          <p>  Owned by: <b>{owned ? 'You' : owner?.slice(-6).toUpperCase()}</b> </p>
                      </div>     
                      <div className="row px-2">
                          <p>  Certificate: <b><a href={metadata?.external_url}>{metadata?.external_url.slice(-46)}</a></b> </p>
                      </div>    
                      <div className="row px-2">
                          <p>  Circulating supply: <b>{coinFullDetail?.coinCount}</b> </p>
                      </div>  
                      <div className="row px-3">
                        {metadata?.attributes.map((attribute, index) => (
                          <div className="col-md-4 mb-2 px-1" key={index}>
                            <TokenAttribute attribute={attribute} />
                          </div>
                        ))}
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="btn-group" role="group">
                            {
                            !locked && owned ? (<>
                              <button type="button" className="btn btn-secondary action-btn px-4 mx-2" onClick={nameChangeModalShow}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 19 19">
                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                </svg> 
                                Change Name
                              </button>
                              <button type="button" className="btn btn-secondary action-btn px-4 mx-2" onClick={descriptionChangeModalShow}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 19 19">
                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                </svg> 
                                Change Description
                              </button>
                              </>
                            ) 
                            : <></>
                            }
                            {
                            !locked && cloneable && owned ? (
                              <button type="button" className="btn btn-secondary action-btn px-4 mx-2" onClick={cloneCoinModalShow}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 19 19">
                                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                                </svg>                                  
                                Clone
                              </button>) 
                            : <></>
                            }
                            {
                            !locked && owned ? (
                              <button type="button" className="btn btn-danger action-btn px-4 mx-2" onClick={handleShowBurnItemModalBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-fire" viewBox="0 0 19 19">
                                  <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                                </svg>                                 
                                Burn
                              </button>) 
                            : <></>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal show={nameChangeModalVisibiltiy} onHide={() => setNameChangeModalVisibiltiy(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Change Coin Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>{'You must burn ' + emojiCount + ' Emojis to change Coin name.'}</span>
            <input maxLength={31} type="text" className="form-control" value={tokenName} onChange={(e) => handleTokenNameInput(e.currentTarget.value)} placeholder="New Name"/>
            <span className="text-danger">{inputErrors}</span>
          </Modal.Body>
          <Stepper steps={ [{title: 'Approve Emoji Burn'}, {title: 'Change Name'}] } activeStep={ nameChangeStep } size={32} circleFontSize={0} titleTop={4} />
          <Modal.Footer className="text-center mx-auto input-modal-footer">
            <Button variant="secondary" onClick={nameChangeApprove} disabled={nameChangeApproveBtnDisabled}>
              { nameChangeApproveBtnText }
            </Button>
            <Button variant="primary" disabled={nameChangeActionBtnDisabled} onClick={changeName}>
              { nameChangeActionBtnText }
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={descriptionChangeModalVisibiltiy} onHide={() => setDescriptionChangeModalVisibiltiy(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Change Coin Description</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>{'You must burn ' + emojiCount + ' Emojis to change Coin description.'}</span>
            <textarea maxLength={255} cols={40} rows={3} className="form-control" value={tokenDescription} onChange={(e) => handleTokenDescriptionInput(e.currentTarget.value)} placeholder="New Description"/>
            <span className="text-danger">{inputErrors}</span>
          </Modal.Body>
          <Stepper steps={ [{title: 'Approve Emoji Burn'}, {title: 'Change Description'}] } activeStep={ descriptionChangeStep } size={32} circleFontSize={0} titleTop={4} />
          <Modal.Footer className="text-center mx-auto input-modal-footer">
            <Button variant="secondary" onClick={descriptionChangeApprove} disabled={descriptionChangeApproveBtnDisabled}>
              { descriptionChangeApproveBtnText }
            </Button>
            <Button variant="primary" disabled={descriptionChangeActionBtnDisabled} onClick={changeDescription}>
              { descriptionChangeActionBtnText }
            </Button>
          </Modal.Footer>
        </Modal> 

        <Modal show={cloneCoinModalVisibiltiy} onHide={() => setCloneCoinModalVisibiltiy(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Clone Coin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>{'You must burn ' + emojiCount + ' Emojis to clone this coin. This action will reduce Grade for both coins.'}</span><br/>
            <span className="text-danger">{inputErrors}</span>
          </Modal.Body>
          <Stepper steps={ [{title: 'Approve Emoji Burn'}, {title: 'Clone Coin'}] } activeStep={ cloneCoinStep } size={32} circleFontSize={0} titleTop={4} />
          <Modal.Footer className="text-center mx-auto input-modal-footer">
            <Button variant="secondary" onClick={cloneCoinApproveClick} disabled={cloneCoinApproveBtnDisabled}>
              { cloneCoinApproveBtnText }
            </Button>
            <Button variant="primary" disabled={cloneCoinActionBtnDisabled} onClick={cloneCoinClick}>
              { cloneCoinActionBtnText }
            </Button>
          </Modal.Footer>
        </Modal>         

        <Modal show={burnCoinModalVisibility} onHide={() => setBurnCoinModalVisibility(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Burn Coin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { dataStorageCoin?.locked && locked ? (
              <>
                <h4>The Coin can not be burned, because it’s locked</h4>
              </>
            ) : (
              <>
                <span>Burning this Coin will reward you with {emojiCount} Emojis. <br/> 
                You will be asked to approve 2 transactions. Please approve both of them.
                </span> 
              </>
            )}
            <br/><br/>
            <div className="text-center">
              { dataStorageCoin?.locked && locked ? 
              (<></>) : 
              (
                <>
                  <span>
                    { coinFullDetail?.coinCount === 1 ? 
                      (<> <b>This is the last available copy, it will be lost forever.</b><br/></>) : 
                      (<></>)
                    }
                    <b> Are you sure, you want to burn this Coin?</b>
                  </span>
                  <br/>
                  <span className="text-danger">{inputErrors}</span>
                </>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="text-center mx-auto input-modal-footer">
            { dataStorageCoin?.locked && locked ? (
              <Button variant="secondary" onClick={() => setBurnCoinModalVisibility(false)}>
                Approve
              </Button>
            ) : (
              <>
                <Button variant="danger" onClick={burnItem} disabled={burnActionBtnDisabled}>
                  { burnActionBtnText }
                </Button>
                <Button variant="secondary" onClick={() => setBurnCoinModalVisibility(false)}>
                  Cancel
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
        
      </div>
    ) : (<></>
    )}
      
    </>
  );
}

export default ItemDetails;