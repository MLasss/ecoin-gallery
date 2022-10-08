export const useIPFS = () => {
    const resolveLink = (url) => {
      if (!url || !url.includes("ipfs://")) return url;
      if (url.startsWith("ipfs://ipfs/")){
        return url.replace("ipfs://ipfs/", "https://gateway.ipfs.io/ipfs/");
      }else{
        return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
      }
      
    };
  
    return { resolveLink };
  };