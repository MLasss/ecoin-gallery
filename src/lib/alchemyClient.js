import { Network, Alchemy } from "alchemy-sdk";

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.MATIC_MAINNET,
};

const alchemy = new Alchemy(settings);
  
export default alchemy;