import MetaMaskOnboarding from '@metamask/onboarding';
// Ethers.js (v6) installed locally via npm
import { ethers } from "ethers";


const player = document.querySelector(".success-anim");


const onboarding = new MetaMaskOnboarding();
const btn = document.querySelector('.onboard');
const statusText = document.querySelector('h1');
const statusDesc = document.querySelector('.desc');
const loader = document.querySelector('.loader');
const upArrow = document.querySelector('.up');
const confetti = document.querySelector('.confetti');
const readBox = document.querySelector('.read-box');
const contractAddressInput = document.querySelector('.contract-address');
const readBtn = document.querySelector('.read-btn');
const readResult = document.querySelector('.read-result');
const netHint = document.querySelector('.net-hint');


const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
}

let connected = (accounts) => {
    statusText.innerHTML = 'Connected!'
    statusDesc.classList.add('account');
    statusDesc.innerHTML = accounts[0]
    btn.style.display = 'none';
    loader.style.display = 'none';
    upArrow.style.display = 'none';
    confetti.style.display = 'block';
    player.play();
    statusDesc.classList.add('account');

    // show Part 2A read UI after successful connect
    readBox.style.display = 'block';
}

async function connectWallet() {
    return await ethereum.request({ method: 'eth_accounts' });
}

// Part 2A: read a value from a deployed smart contract
// By default we read ERC-20 name() and symbol() (you can replace ABI / calls for your own contract)
const DEFAULT_READ_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)"
];

async function readFromContract(contractAddress) {
    // Provider from MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    netHint.textContent = `Connected network: chainId=${network.chainId.toString()}`;

    const contract = new ethers.Contract(contractAddress, DEFAULT_READ_ABI, provider);
    const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
    return { name, symbol, chainId: network.chainId.toString() };
}

const onClickInstallMetaMask = () => {
    onboarding.startOnboarding();
    loader.style.display = 'block';
}

btn.addEventListener('click', async () => {
    btn.style.backgroundColor = '#cccccc';
    loader.style.display = 'block';

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        connected(accounts)
    } catch (error) {
        console.error(error);
    }
})

readBtn.addEventListener('click', async () => {
    readResult.textContent = '';
    const addr = (contractAddressInput.value || '').trim();

    if (!addr) {
        readResult.textContent = 'Enter a contract address first.';
        return;
    }
    if (!ethers.isAddress(addr)) {
        readResult.textContent = 'Invalid contract address (must start with 0x...).';
        return;
    }

    readBtn.disabled = true;
    readBtn.textContent = 'Reading...';
    try {
        const res = await readFromContract(addr);
        readResult.innerHTML = `✅ Read success<br/>Name: <b>${res.name}</b><br/>Symbol: <b>${res.symbol}</b>`;
    } catch (err) {
        console.error(err);
        // common MetaMask errors
        if (err?.code === 4001) {
            readResult.textContent = 'Request rejected in MetaMask.';
        } else {
            readResult.textContent = 'Read failed. Check the address + network (and that the contract has name()/symbol()).';
        }
    } finally {
        readBtn.disabled = false;
        readBtn.textContent = 'Read';
    }
});

const MetaMaskClientCheck = () => {
    if (!isMetaMaskInstalled()) {
        statusText.innerText = 'You need to Install a Wallet';
        statusDesc.innerText = 'We recommend the MetaMask wallet.';
        btn.innerText = 'Install MetaMask'
        btn.onclick = onClickInstallMetaMask;
    } else {

        connectWallet().then((accounts) => {
            if (accounts && accounts.length > 0) {
                connected(accounts)
            } else {
                statusText.innerHTML = 'Connect your wallet'
                statusDesc.innerHTML = `To begin, please connect your MetaMask wallet.`
                btn.innerText = 'Connect MetaMask'
                upArrow.style.display = 'block';
            }
        })
    }
}

MetaMaskClientCheck()