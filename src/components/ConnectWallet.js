import { useState, useEffect } from 'react';
import { providers } from "ethers";
import Web3Modal from 'web3modal'
import { useNavigate } from "react-router-dom";
import { getOwnedEmojis } from "../lib/erc20";
import { getOwnedTokens } from "../lib/erc721";
import Toast from 'react-bootstrap/Toast';

function ConnectWallet({ onAccountConnect }) {
    const [web3Modal, setWeb3Modal] = useState(null);
    const [address, setAddress] = useState("");
    const [emojis, setEmojis] = useState(0);
    const [emojiTokens, setEmojiTokens] = useState(null);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const newWeb3Modal = new Web3Modal({
        cacheProvider: true, 
        network: "mainnet",
      });
      setWeb3Modal(newWeb3Modal)
    }, [])

    useEffect(() => {
      if(web3Modal && web3Modal.cachedProvider){
        connectWallet()
      }
    }, [web3Modal])

    async function connectWallet() {
      const provider = await web3Modal.connect();
      const networkId = await provider.chainId;
      if (networkId === "0x89") { // 0x89 is the network id of polygon 
        addListeners(provider);
        const ethersProvider = new providers.Web3Provider(provider)
        ethersProvider.getSigner().getAddress().then(userAddress => {
          setAddress(userAddress)
          onAccountConnect(userAddress);
        });
      } else {
        disconnectWallet();
        console.error("Metamask wallet is not connected to Polygon blockchain.");
        navigate('/');
      }
    }

    async function disconnectWallet(){
        await web3Modal.clearCachedProvider();
        setAddress("")
    }

    async function showBalances(){
      setBalances(address);
      setShow(true);
    }    

    async function setBalances(userAddress){
      getOwnedEmojis(userAddress).then(data => {
          //setEmojis(data / 1000000000000000000);
          setEmojis(Math.round(data / 10000000000000000) / 100);
      });
      getOwnedTokens(userAddress).then(data => {
          setEmojiTokens(data.toString());
      });
    }

    async function addListeners(web3ModalProvider) {
          web3ModalProvider.on("accountsChanged", (accounts) => {
          window.location.reload()
        });
        
        // Subscribe to chainId change
        web3ModalProvider.on("chainChanged", (chainId) => {
          window.location.reload()
        });
    }

    return (
      <>
        { address ? (
          <>
              <Toast onClose={() => setShow(false)} show={show} delay={5000} autohide>
                <Toast.Body><div><div className="mx-4 toast-row">{emojis} Emojis</div><div className="mx-4 toast-row">{emojiTokens} Emoji Coins</div></div></Toast.Body>
              </Toast>
              <button className="btn btn-outline-danger mx-2" type="button" onClick={disconnectWallet}>Disconnect {address.slice(-6).toUpperCase()}</button> 
              <button className="btn btn-outline-secondary mx-2" type="button" onClick={() => showBalances()}>Show Balance</button>
          </>
              
        ): (
          <button type="button" className="btn btn-outline-success" onClick={connectWallet}>Connect Wallet</button>
        )}
      </>
    );
}

export default ConnectWallet;
