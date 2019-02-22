import web3 from './web3';
import abi from './abi/RPSfactory.json'

// this is the address of the latest deployment of the contract
//change this to connect to a different deployment

const address = '0x07c47e1aa87c20a9fa67fe9ee83acf4403741676';

const instance = new web3.eth.Contract(abi,address);

export default instance;
