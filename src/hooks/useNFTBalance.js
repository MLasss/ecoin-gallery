/*import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";

export const useNFTBalance = (options) => {
    const Web3API = useMoralisWeb3Api();
    const chainId = process.env.REACT_APP_CHAIN_ID;

    const {data} = useMoralisWeb3ApiCall(Web3API.account.getNFTs, { chain: chainId, ...options }, { autoFetch: true });
    return data;
};
*/


import { Alchemy, Network } from "alchemy-sdk";

const config = {
  apiKey: "XkCON1_0N3YnlppncPUjzjl8k8NuDwyx",
  network: Network.MATIC_MUMBAI,
};
const alchemy = new Alchemy(config);

export const useNFTBalance = (options)  => {
    if (options.owner == null) 
    {
        return null;
    }
    //console.log(options.contract);
    //console.log(options.owner);
  const nfts = alchemy.nft.getNftsForOwner(options.owner, {'contractAddresses[]': options.contract});
  // Print NFTs
  //console.log(nfts);
  //console.log(nfts["ownedNfts"]);
  return nfts;
};
