import { XummPkce } from 'xumm-oauth2-pkce';
import { XAMAN_API_KEY } from '../config';

const xumm = new XummPkce(XAMAN_API_KEY);
window.xumm = xumm; // For debugging

export const connectWallet = async () => {
    try {
        const account = await xumm.authorize();
        return account; // Returns { created: ..., me: { ... }, ... }
    } catch (error) {
        console.error("Xaman Connection Error:", error);
        return null;
    }
};

export const getXummInstance = () => xumm;

export const logoutWallet = async () => {
    await xumm.logout();
};
