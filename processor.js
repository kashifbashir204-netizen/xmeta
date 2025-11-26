import { Client, Wallet } from 'xrpl';
import * as dotenv from 'dotenv';
dotenv.config();

// We need to import config. But config.js uses 'export const', which is ESM.
// If we run this as a module, it should work.
// But we might need to duplicate config or read it.
// For simplicity, I'll hardcode the non-secret values or read them from env if possible.
// Or just copy them here.

const TOKEN_HEX = '584D455441000000000000000000000000000000';
const ISSUER_ADDRESS = 'r3XwJ1hr1PtbRvbhuUkybV6tmYzzA11WcB';
const CLAIM_WALLET = 'r4rPSvV5RVgUDw5mRaZ44iHuHSjomF3x6R';

const ISSUER_SECRET = process.env.ISSUER_SECRET;

const client = new Client('wss://xrplcluster.com');

const main = async () => {
    if (!ISSUER_SECRET) {
        console.warn("WARNING: ISSUER_SECRET not found in .env. Processor will only LOG claims, not send rewards.");
    }

    console.log("Starting Payment Processor...");
    await client.connect();
    console.log("Connected to XRPL");

    // Subscribe to the Claim Wallet
    await client.request({
        command: 'subscribe',
        accounts: [CLAIM_WALLET]
    });
    console.log(`Listening for claims on ${CLAIM_WALLET}`);

    client.on('transaction', async (tx) => {
        const transaction = tx.tx || tx.transaction || tx.tx_json;
        if (!transaction) return;

        if (transaction.TransactionType !== 'Payment') return;
        if (transaction.Destination !== CLAIM_WALLET) return;

        // Check Amount (1 drop)
        const amount = transaction.Amount || transaction.DeliverMax;
        if (amount !== '1') return;

        console.log(`Received Claim from ${transaction.Account}`);

        // Parse Memo
        if (transaction.Memos && transaction.Memos.length > 0) {
            try {
                const memoData = transaction.Memos[0].Memo.MemoData;
                const decoded = Buffer.from(memoData, 'hex').toString('utf8');
                console.log("Memo:", decoded);

                if (decoded.startsWith('CLAIM:')) {
                    const claimAmount = decoded.split(':')[1];
                    console.log(`Processing claim for ${claimAmount} XMETA`);

                    if (ISSUER_SECRET) {
                        await sendReward(transaction.Account, claimAmount);
                    } else {
                        console.log("Skipping payment (No Secret)");
                    }
                }
            } catch (e) {
                console.error("Error parsing memo:", e);
            }
        }
    });
};

const sendReward = async (destination, amount) => {
    try {
        const wallet = Wallet.fromSeed(ISSUER_SECRET);
        const rewardTx = {
            TransactionType: 'Payment',
            Account: wallet.address,
            Destination: destination,
            Amount: {
                currency: TOKEN_HEX,
                issuer: ISSUER_ADDRESS,
                value: amount.toString()
            }
        };

        const prepared = await client.autofill(rewardTx);
        const signed = wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === 'tesSUCCESS') {
            console.log(`Sent ${amount} XMETA to ${destination}`);
        } else {
            console.error(`Payment failed: ${result.result.meta.TransactionResult}`);
        }
    } catch (e) {
        console.error("Send Reward Error:", e);
    }
};

main();
