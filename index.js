import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBtn = document.getElementById("connectButton");
const fundBtn = document.getElementById("fund");
const balanceBtn = document.getElementById("balanceButton");
const withdrawBtn = document.getElementById("withdrawButton");

connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;

async function connect() {
  if (window.ethereum) {
    console.log("metamask exist");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectBtn.innerHTML = "Connected";
  } else {
    connectBtn.innerHTML = "Please install metamask";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding ${ethAmount} ETH`);
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(txResponse, provider);
      console.log("Done");
    } catch (error) {
      console.log("err", error);
    }
  }
}

async function withdraw() {
  if (window.ethereum) {
    console.log("withdrawing");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.withdraw({});
      await listenForTransactionMine(txResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

async function getBalance() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

function listenForTransactionMine(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}`);
  const txHash = txResponse.hash;

  return new Promise((resolve, reject) => {
    provider.once(txHash, txReceipt => {
      console.log(`Completed with ${txReceipt.confirmations} confirmations`);
      resolve();
    });
  });
}
