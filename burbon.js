const Web3 = require('web3');
const bip39 = require('bip39')
const localUrl = "https://localhost:8545";
const polygonUrl = "https://polygon-rpc.com";
const HDWalletProvider = require("@truffle/hdwallet-provider");
const DAI_ABI = require('./DAI_ABI.json');
const rpcUrl = polygonUrl;
const kevinsPolygonAddress = "0xe8a59f004D2A14B3c6Fd2dF93c1B609DdbDA9813";



const  burbonToDai = {
    
    _mnemonic: undefined,
    
    web3: undefined,

    mainAccount: undefined,

    mainNetworkID: undefined,


    gasBalance: async function checkBalance() {
        const web3 = burbonToDai.web3 == undefined ? new Web3(rpcUrl) : burbonToDai.web3;
        const address = burbonToDai.mainAccount == undefined ? this.createOrImportAWallet() : burbonToDai.mainAccount;
        const theBalance = await web3.eth.getBalance(address, (err, wei) => {
            balance = web3.utils.fromWei(wei, 'ether')
          });
        return theBalance;
    },

    setMainNetworkID: function (networkId) {
        burbonToDai.mainNetworkID = networkId;
    },

    setMainAccount: function (account) {
        burbonToDai.mainAccount = account;
        console.log(`Main Account: ${account}`);
    },

    setWeb3: function (newWeb3Object) {
        burbonToDai.web3 = newWeb3Object;
    },

    createOrImportAWallet: async function (importMnemonic) {
        // This imports an existing seed phrase, or creates a new one if it doesn't exist
        const mnemonic = importMnemonic || bip39.generateMnemonic();
        
        // See HDWalletProvider documentation: https://www.npmjs.com/package/@truffle/hdwallet-provider.
        const hdwalletOptions = {
            mnemonic: {
                phrase: mnemonic,
            },
            providerOrUrl: rpcUrl,
            addressIndex: 0, // Change this to use the nth account.
        };
        
        // Initialize web3 with an existing HDWalletProvider if a mnemonic was provided. Otherwise, create a new one with the url.
        burbonToDai.setWeb3(new Web3(new HDWalletProvider(hdwalletOptions)));
        const web3 = burbonToDai.web3;
        console.log("Wallet Created with mnemonic: ", mnemonic);


        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0)
        throw "No accounts. Must provide mnemonic or node must have unlocked accounts.";
        
        burbonToDai.setMainAccount(accounts[0]);
        burbonToDai.setMainNetworkID(await web3.eth.net.getId());
        console.log("network id:", burbonToDai.mainNetworkID);
    },

    getNonce: async function() {
        const web3 = burbonToDai.web3;
        console.log(`current nonce: ${await web3.eth.getTransactionCount(burbonToDai.mainAccount)}`);
        return await web3.eth.getTransactionCount(burbonToDai.mainAccount);
    },

    sendDAI: async function(amount, recievingAddress) {

        // Setting up the Stablecoin Contract (DAI)
        if (amount == undefined)
        {
            sendAmount = 0;
        }
        const expectedBlockTime = 2000; 
        const sendAmount = 1000000000000000000 * amount;
        const web3 = burbonToDai.web3;
        const receiverAddress = recievingAddress;
        const abiFile = JSON.parse(DAI_ABI.result);
        const senderAddress = burbonToDai.mainAccount;
        const daiMainnetAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'; //DAI Polygon Address
        const DAIStablecoin = new web3.eth.Contract(abiFile, daiMainnetAddress);
        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
        }
        const oldAccountBalance = await DAIStablecoin.methods.balanceOf(senderAddress).call();
        //   the transaction

        // Okay so, to send a transaction you need both gas and tokens in wallet.  Step one: Acquire Gas, Acquire tokens, then send tokens
        const totalSupply = await DAIStablecoin.methods.totalSupply().call((err, result) => { return result });
        const coinName = await DAIStablecoin.methods.name().call((err, result) => { return result });

        try {
            
              // Transaction parameters
            const transactionOptions = {
                gas: 100000, // 10MM is very high. Set this lower if you only have < 2 ETH or so in your wallet.
                gasPrice: 90 * 1000000000, // gasprice arg * 1 GWEI
                from: senderAddress,
            };


            // Transfer some tokens
            const data = DAIStablecoin.methods.transfer(receiverAddress, sendAmount).send(transactionOptions);


        } catch (error) {
            console.log(`Execution Reverted: \n \n \n \n ${error}`);
        }
        

        // // Question, does this need an approve event?
        
        // //   Check Updated Balance of wallet address
        const newAccountBalance = await DAIStablecoin.methods.balanceOf(senderAddress).call();
    
        // // Confirm Transaction`
        const difference = newAccountBalance - oldAccountBalance
        console.log(`Old Balance ${oldAccountBalance} , New Balance ${newAccountBalance}, difference: ${difference}`);
        //   if (sendAmount == difference)
        //   {
        //       console.log("Successful DAI Transfer");
        //   }
    }

}


// Helper Functions
// function _getABI();
// function getAddress();

// Execution


// Create/setup accounts

burbonToDai.createOrImportAWallet("solid arrest rookie elder punch stereo human host possible also object cook").then(()=> {
    // console.log(`Gas Balance: ${burbonToDai.gasBalance()}`) //This returns a promise NOT the gas balance
    
    burbonToDai.getNonce();
    burbonToDai.sendDAI(1, kevinsPolygonAddress);
});

// Polygonscan Address for this wallet -- https://polygonscan.com/address/0xafb5cd3fa7283e41f12b2b36a81c9f59acb2c03f

module.exports = burbonToDai;
