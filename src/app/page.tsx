"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    LAMPORTS_PER_SOL,
    GetProgramAccountsFilter,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import {
    TOKEN_PROGRAM_ID,
    createBurnCheckedInstruction, createCloseAccountInstruction
} from "@solana/spl-token";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

const url = process.env.NEXT_PUBLIC_RPC || ''

export default function Page() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [tokens, setTokens] = useState<any[]>([]);
    const [burnAmount, setBurnAmount] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);
    const [metadata, setMetadata] = useState<any[]>([]);

    useEffect(() => {
        if (publicKey) {
            const interval = setInterval(async () => {
                const newBalance = await connection.getBalance(publicKey);
                setBalance(newBalance / LAMPORTS_PER_SOL);
            }, 10000);

            // Initial balance fetch
            connection.getBalance(publicKey).then(newBalance => {
                setBalance(newBalance / LAMPORTS_PER_SOL);
            });

            getAllTokens();
            return () => clearInterval(interval);
        }
    }, [publicKey, connection]);

    const getAllTokens = async () => {
        if (!publicKey) return;

        const filters: GetProgramAccountsFilter[] = [
            {
                dataSize: 165,
            },
            {
                memcmp: {
                    offset: 32,
                    bytes: publicKey.toBase58(),
                },
            },
        ];
        const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, { filters });
        setTokens(accounts);

        const mintAddresses = tokens.map((account) => account.account.data.parsed.info.mint)
        const getAssetBatch = async () => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'my-id',
                    method: 'getAssetBatch',
                    params: {
                        ids: mintAddresses
                    },
                }),
            });
            const { result } = await response.json();
            return result
        };
        const result = await getAssetBatch()
        console.log(result)
        setMetadata(result)
    };

    const letsBurnToken = async (token: any) => {
        if (!publicKey) return;

        const mintAddress = token.account.data.parsed.info.mint;
        const decimals = token.account.data.parsed.info.tokenAmount.decimals;
        const ataAddress = token.pubkey;

        const burnIx = createBurnCheckedInstruction(
            new PublicKey(ataAddress),
            new PublicKey(mintAddress),
            new PublicKey(publicKey.toBase58()),
            burnAmount * 10 ** decimals,
            decimals
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");

        const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: [burnIx],
        }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        const txId = await sendTransaction(transaction, connection);
        const confirmation = await connection.confirmTransaction({
            signature: txId,
            blockhash,
            lastValidBlockHeight,
        });

        if (confirmation.value.err) {
            toast.error("X - Transaction not confirmed.");
            throw new Error("❌ - Transaction not confirmed.");
        }
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Transaction ID
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                <Link target="_blank" href={`https://explorer.solana.com/tx/${txId}`}>Open Explorer</Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        ));
        toast.success("🔥 SUCCESSFUL BURN!🔥");
        getAllTokens(); // Refresh the tokens list
    };

    // this helper reduces the length of the address and when clicked copy the address to the clipboard
    const addressHelper = (address: string) => {
        return (
            <div className="flex gap-2">
                <button className="cursor-pointer text-sm"
                    onClick={() => {
                        navigator.clipboard.writeText(address);
                        toast.success("Address copied to clipboard");
                    }}
                >
                    {address.slice(0, 4)}...{address.slice(26, 30)}
                    📋
                </button>
            </div>
        );
    }

    const closeAccount = async (token: any) => {

        if (!publicKey) return;

        const ataAddress = token.pubkey;

        const closeIx = createCloseAccountInstruction(
            new PublicKey(ataAddress),
            new PublicKey(publicKey.toBase58()),
            new PublicKey(publicKey.toBase58())
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");

        const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: [closeIx],
        }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        const txId = await sendTransaction(transaction, connection);
        const confirmation = await connection.confirmTransaction({
            signature: txId,
            blockhash,
            lastValidBlockHeight,
        });

        if (confirmation.value.err) {
            toast.error("X - Transaction not confirmed.");
            throw new Error("❌ - Transaction not confirmed.");
        }
        console.log("❎ CLOSE SUCCESSFUL! ❎", "\n", `https://explorer.solana.com/tx/${txId}`);
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Transaction ID
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                <Link target="_blank" href={`https://explorer.solana.com/tx/${txId}?cluster=devnet`}>Open Explorer</Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        ));
        toast.success("❎ CLOSE SUCCESSFUL! ❎");
        getAllTokens(); // Refresh the tokens list
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-evenly p-24">
            <div><Toaster /></div>
            <div className="text-4xl md:text-5xl lg:text-7xl 2xl:text-9xl font-extrabold">S🔥LBURN</div>
            <div className="italic text-sm md:text-md text-center p-2">The fastest, easiest, safest, cheapest way to burn Solana tokens you do not need!</div>
            <WalletMultiButton style={{}} />

            {publicKey ? (
                <div className="flex flex-col gap-4 text-center">
                    <div>Balance : {balance} SOL</div>
                    <div key={0}>
                        <div>{tokens.length} tokens found</div>
                        {tokens.length > 0 && (
                            <table className="table-fixed border-collapse border border-gray-300 w-full text-left text-xs md:text-md lg:text-lg overflow-clip">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2">Token</th>
                                        <th className="border border-gray-300 px-4 py-2">Amount</th>
                                        <th className="border border-gray-300 px-4 py-2">Burn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map((token, index) => (
                                        <tr key={index} className="border border-gray-300">
                                            <td className="border border-gray-300 px-4 py-2">
                                                {/* find the name of the mint by the mint aaddress in metadata */}
                                                {metadata.find((m) => m.id === token.account.data.parsed.info.mint)?.content.metadata.symbol} <br />
                                                {metadata.find((m) => m.id === token.account.data.parsed.info.mint)?.content.metadata.name} <br />
                                                {addressHelper(token.account.data.parsed.info.mint)}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">{token.account.data.parsed.info.tokenAmount.uiAmount}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    onChange={(e) => setBurnAmount(Number(e.target.value))}
                                                    min={0}
                                                    max={token.account.data.parsed.info.tokenAmount.uiAmount}
                                                    type="number"
                                                    placeholder="0"
                                                    className="text-orange-600"
                                                    disabled={token.account.data.parsed.info.tokenAmount.uiAmount === 0}
                                                />
                                                <button
                                                    onClick={() => letsBurnToken(token)}
                                                    className={`${token.account.data.parsed.info.tokenAmount.uiAmount === 0
                                                        ? "cursor-not-allowed"
                                                        : "cursor-pointer"
                                                        } text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-1 py-1 me-1 mb-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700`}
                                                    hidden={token.account.data.parsed.info.tokenAmount.uiAmount === 0}
                                                >
                                                    🔥
                                                </button>
                                                <button
                                                    onClick={() => closeAccount(token)}
                                                    className={`${token.account.data.parsed.info.tokenAmount.uiAmount !== 0
                                                        ? "cursor-not-allowed"
                                                        : "cursor-pointer"
                                                        } text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-1 py-1 me-1 mb-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700`}
                                                    hidden={token.account.data.parsed.info.tokenAmount.uiAmount !== 0}
                                                >
                                                    ❌
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                <h1>Wallet is not connected</h1>
            )}
            <footer className="text-xs p-5">Made by <Link className="text-red-500" target="_blank" href={"https://www.metasal.xyz"}>@metasal</Link></footer>
        </main>
    );
}
