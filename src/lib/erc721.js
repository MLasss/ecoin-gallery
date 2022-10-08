import { ethers } from "ethers";

import abi from "../contracts/erc721.json";

const polygonProvider = new ethers.providers.Web3Provider(window.ethereum);
const signer = polygonProvider.getSigner();
const contract = new ethers.Contract(process.env.REACT_APP_ERC721_TOKEN_ADDRESS, abi, signer)

export async function getOwnedTokens(address){
    const data = await contract.balanceOf(address);
    return data;
}

export async function getTokenURI(id){
    const data = await contract.tokenURI(id);
    return data;
}

export async function getOwnerOf(id){
    const data = await contract.ownerOf(id);
    return data;
}

export async function approvenft(address, value){
    try {
        const data = await contract.approve(address, value)
        await polygonProvider.waitForTransaction(data.hash)
        return '1';
    } catch (error) {
        console.log(error)
        return error;
    }
}