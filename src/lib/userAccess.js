import { ethers } from "ethers";
import abi from "../contracts/userAccess.json";
import alchemyClient from "./alchemyClient";

const polygonProvider = new ethers.providers.Web3Provider(window.ethereum);
const signer = polygonProvider.getSigner();
const contract = new ethers.Contract(process.env.REACT_APP_USERACCESS_ADDRESS, abi, signer)

export async function setName(tokenId, newName){
    try {
        const data = await contract.setName(tokenId, newName);
        await polygonProvider.waitForTransaction(data.hash);
        await alchemyClient.nft.refreshNftMetadata(process.env.REACT_APP_ERC721_TOKEN_ADDRESS, tokenId);
        return '1';
    } catch (error) {
        console.error(error);
        return error;
    }
}

export async function setDescription(tokenId, newDescription){
    try {
        const data = await contract.setDescription(tokenId, newDescription);
        await polygonProvider.waitForTransaction(data.hash);
        await alchemyClient.nft.refreshNftMetadata(process.env.REACT_APP_ERC721_TOKEN_ADDRESS, tokenId);
        return '1';
    } catch (error) {
        console.error(error);
        return error;
    }
}

export async function burnCoin(tokenId){
    try {
        const data = await contract.burnCoin(tokenId);
        await polygonProvider.waitForTransaction(data.hash);
        await alchemyClient.nft.refreshNftMetadata(process.env.REACT_APP_ERC721_TOKEN_ADDRESS, tokenId);
        return '1';
    } catch (error) {
        console.error(error);
        return error;
    }
}

export async function getClonePrice(id){
    const data = await contract.getClonePrice(id);
    return data;
}

export async function cloneCoin(tokenId){
    try {
        const data = await contract.cloneCoin(tokenId);
        await polygonProvider.waitForTransaction(data.hash);
        //await alchemyClient.nft.refreshNftMetadata(process.env.REACT_APP_ERC721_TOKEN_ADDRESS, tokenId);
        return '1';
    } catch (error) {
        console.error(error);
        return error;
    }
}