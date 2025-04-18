import { NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, Keypair, SystemProgram, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

// Fixed price for CDX token in USDT
const CDX_PRICE_IN_USDT = 0.01;

// Wrapper to ensure JSON response
const handleError = (error: any) => {
  console.error('Transfer API error:', error);
  let errorMessage = 'Unknown error occurred';
  let errorDetails = '';

  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || '';
  }

  // Log detailed error information
  console.error('Detailed error information:');
  console.error('Message:', errorMessage);
  console.error('Details:', errorDetails);

  return NextResponse.json(
    { 
      error: 'Failed to transfer CDX tokens',
      details: errorMessage,
      stack: errorDetails
    },
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};

export async function POST(req: Request) {
  // Ensure we always return JSON, even for unexpected errors
  try {
    console.log('Starting token transfer process...');
    const { buyerPublicKey, solAmount, solPrice } = await req.json();
    console.log('Received transfer request for buyer:', buyerPublicKey);

    if (!process.env.PRIVATE_KEY) {
      console.error('PRIVATE_KEY environment variable is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // RPC endpoints with fallbacks
    const rpcEndpoints = [
      process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
      'https://solana-rpc.publicnode.com',
      'https://solana-mainnet.g.alchemy.com/v2/demo',
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ];

    // Try to establish connection with fallback
    console.log('Establishing Solana connection...');
    let connection: Connection | null = null;
    let currentEndpoint = '';

    for (const endpoint of rpcEndpoints) {
      try {
        const tempConnection = new Connection(endpoint, 'confirmed');
        // Test the connection
        await tempConnection.getLatestBlockhash();
        connection = tempConnection;
        currentEndpoint = endpoint;
        console.log('Connected to RPC:', endpoint);
        break;
      } catch (error) {
        console.log(`Failed to connect to ${endpoint}, trying next endpoint...`);
        continue;
      }
    }

    if (!connection) {
      throw new Error('Failed to connect to any Solana RPC endpoint');
    }

    // Create sender keypair from private key
    console.log('Creating sender keypair...');
    const privateKeyArray = JSON.parse(process.env.PRIVATE_KEY);
    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

    // Get token accounts
    const cdxMint = new PublicKey(process.env.NEXT_PUBLIC_CDX_TOKEN_ADDRESS!);
    const buyerPubkey = new PublicKey(buyerPublicKey);

    // Calculate CDX amount based on fixed price
    const solValueInUSD = solAmount * solPrice;
    const cdxAmount = Math.floor(solValueInUSD / CDX_PRICE_IN_USDT);
    console.log('Calculated CDX amount:', cdxAmount);

    // Get token accounts
    console.log('Getting token accounts...');
    const buyerTokenAccount = await getAssociatedTokenAddress(cdxMint, buyerPubkey);
    const senderTokenAccount = await getAssociatedTokenAddress(cdxMint, senderKeypair.publicKey);
    console.log('Buyer token account:', buyerTokenAccount.toString());
    console.log('Sender token account:', senderTokenAccount.toString());

    // Create transaction
    const transaction = new Transaction();

    // Check if buyer's token account exists
    const buyerAccountInfo = await connection.getAccountInfo(buyerTokenAccount);
    if (!buyerAccountInfo) {
      console.log('Creating Associated Token Account for buyer...');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderKeypair.publicKey, // payer
          buyerTokenAccount, // ata
          buyerPubkey, // owner
          cdxMint // mint
        )
      );
    }

    // Add CDX transfer instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        buyerTokenAccount,
        senderKeypair.publicKey,
        BigInt(cdxAmount)
      )
    );

    // Function to send transaction with compute units configuration and RPC fallback
    const sendTransactionWithRetry = async (baseInstructions: Transaction['instructions'], computeUnits: number, priorityFee: number) => {
      // Create new transaction for each attempt
      const newTransaction = new Transaction();
      
      // Add compute unit configuration first
      newTransaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })
      );
      
      // Add the base instructions
      baseInstructions.forEach(instruction => newTransaction.add(instruction));
      
      // Get fresh blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      newTransaction.recentBlockhash = blockhash;
      newTransaction.feePayer = senderKeypair.publicKey;
      
      // Sign with fresh blockhash
      newTransaction.sign(senderKeypair);
      
      const rawTransaction = newTransaction.serialize();
      
      // Try each RPC endpoint for sending transaction
      for (const endpoint of rpcEndpoints) {
        if (endpoint !== currentEndpoint) {
          try {
            const fallbackConnection = new Connection(endpoint, 'confirmed');
            console.log('Trying RPC endpoint:', endpoint);
            return await fallbackConnection.sendRawTransaction(rawTransaction, {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 5
            });
          } catch (error) {
            console.log(`Failed with RPC ${endpoint}, trying next...`);
            continue;
          }
        }
      }
      
      // If all fallbacks fail, try the current connection one last time
      return await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 5
      });
    };

    // Save base instructions
    const baseInstructions = transaction.instructions;
    
    // Try sending with increasing compute units and priority fees
    console.log('Sending transaction...');
    let signature;
    const retryConfigs = [
      { computeUnits: 500000, priorityFee: 10 },
      { computeUnits: 800000, priorityFee: 25 },
      { computeUnits: 1000000, priorityFee: 50 },
      { computeUnits: 1200000, priorityFee: 100 },
      { computeUnits: 1400000, priorityFee: 200 }
    ];

    for (const config of retryConfigs) {
      try {
        signature = await sendTransactionWithRetry(baseInstructions, config.computeUnits, config.priorityFee);
        console.log(`Transaction sent with signature: ${signature}`);
        console.log(`Used compute units: ${config.computeUnits}, priority fee: ${config.priorityFee}`);
        break;
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        console.log(`Failed with compute units ${config.computeUnits}. Error: ${errorMessage}`);
        
        if (config === retryConfigs[retryConfigs.length - 1]) {
          throw new Error(`Transaction failed: ${errorMessage}. Please try again in a few minutes.`);
        }
        
        // Add delay before next retry
        console.log('Waiting before next retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!signature) {
      throw new Error('Transaction failed: Unable to send after multiple attempts. Network may be congested.');
    }
    
    // Custom confirmation with extended timeout and retries
    console.log('Waiting for confirmation...');
    let confirmed = false;
    let retryCount = 0;
    const maxRetries = 10; // Allow up to 10 retries
    const confirmationTimeout = 60000; // 60 seconds per attempt
    
    while (!confirmed && retryCount < maxRetries) {
      try {
        const confirmation = await Promise.race([
          connection.confirmTransaction(signature, 'confirmed'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), confirmationTimeout)
          )
        ]) as { value: { err: any } };
        
        if (confirmation.value.err) {
          throw new Error('Transaction failed');
        }
        
        confirmed = true;
        console.log('Transaction confirmed successfully');
        
        // Just add the wallet to the database
        try {
          await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: buyerPublicKey
            }),
          });
        } catch (error) {
          // Non-critical error, just log it
          console.error('Failed to register user:', error);
        }
        
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Confirmation attempt ${retryCount} failed, retrying...`);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log('Max retries reached, checking transaction status...');
          // Final check of transaction status
          const status = await connection.getSignatureStatus(signature);
          if (status.value?.confirmationStatus === 'confirmed' || 
              status.value?.confirmationStatus === 'finalized') {
            confirmed = true;
            console.log('Transaction found to be successful after final check');
          } else {
            throw new Error('Transaction confirmation failed after all retries');
          }
        }
      }
    }

    return NextResponse.json({ success: true, signature });

  } catch (error) {
    return handleError(error);
  }
}