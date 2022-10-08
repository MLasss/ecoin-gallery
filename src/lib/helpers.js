import { ethers } from "ethers";

const coinValues = {
    1: 1, 
    2: 10,
    3: 50,
    4: 200,
    10: 100, 
    11: 500,
    12: 1000, 
    20: 4000, 
    21: 200000,
    22: 400000
}

export async function getCoinPrice(coinType){
    return coinValues[coinType] ? ethers.utils.parseEther(coinValues[coinType].toString())  : false;
}