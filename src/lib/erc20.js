import { ethers } from "ethers";
import abi from "../contracts/erc20.json";


export async function approve(address, value){
    try {
        const polygonProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = polygonProvider.getSigner();
        const contract = new ethers.Contract(process.env.REACT_APP_ERC20_TOKEN_ADDRESS, abi, signer)
        const data = await contract.approve(address, value)
        await polygonProvider.waitForTransaction(data.hash)
        return '1';
    } catch (error) {
        console.log(error)
        return error;
    }
}

export async function getOwnedEmojis(address){
    const polygonProvider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(process.env.REACT_APP_ERC20_TOKEN_ADDRESS, abi, polygonProvider)
    const data = await contract.balanceOf(address);
    return data;
}