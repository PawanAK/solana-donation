import {
  type ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  type ActionPostRequest,
  type ActionPostResponse,
  createPostResponse,
} from "@solana/actions";
import {
  PublicKey,
  Connection,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// GET request handler
export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const payload: ActionGetResponse = {
    icon: `${baseUrl}/knaye.png`, // Updated path
    title: "Feed YE",
    description: "Support the revelution",
    label: "Donate",
    links: {
      actions: [
        {
          label: "Donate 0.1 SOL",
          href: `${baseUrl}/api/donate?amount=0.1`,
        },
      ],
    },
  };
  return new Response(JSON.stringify(payload), {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export const OPTIONS = GET; // OPTIONS request handler

// POST request handler
export async function POST(request: Request) {
  const body: ActionPostRequest = await request.json();
  const url = new URL(request.url);
  const amount = Number(url.searchParams.get("amount")) || 0.1;
  let sender;

  try {
    sender = new PublicKey(body.account);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Invalid account",
        },
      }),
      {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender, // Sender public key
      toPubkey: new PublicKey("AVShpyy6FT88xaHi9DmTQvcCJ43126mq1F8CuBSUqtLQ"), // Replace with your recipient public key
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );
  transaction.feePayer = sender;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  transaction.lastValidBlockHeight = (
    await connection.getLatestBlockhash()
  ).lastValidBlockHeight;

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: "Transaction created",
    },
  });
  return new Response(JSON.stringify(payload), {
    headers: ACTIONS_CORS_HEADERS,
  });
}