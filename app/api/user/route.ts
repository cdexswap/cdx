import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

export async function POST(req: Request) {
  try {
    console.log('API route called');
    
    // Validate request body
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { walletAddress } = body;
    
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Valid wallet address is required' }, { status: 400 });
    }

    try {
      console.log('Connecting to MongoDB...');
      await connectDB();
      console.log('Connected to MongoDB');
    } catch (dbError: any) {
      console.error('MongoDB connection error details:', {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      return NextResponse.json({ 
        error: `Database connection failed: ${dbError.message}` 
      }, { status: 500 });
    }

    try {
      // Check if user exists
      console.log('Checking for existing user:', walletAddress);
      let user = await User.findOne({ walletAddress });
      
      if (!user) {
        try {
          // Create new user with atomic operation
          console.log('Creating new user');
          user = await User.findOneAndUpdate(
            { walletAddress }, // find criteria
            { // update/insert data
              walletAddress
            },
            {
              upsert: true, // create if doesn't exist
              new: true, // return updated doc
              runValidators: true // run schema validations
            }
          );
          console.log('Created new user:', user);
        } catch (createError: any) {
          if (createError.code === 11000) { // Duplicate key error
            console.log('Race condition occurred, fetching existing user');
            user = await User.findOne({ walletAddress });
          } else {
            throw createError;
          }
        }
      } else {
        console.log('User already exists:', user);
      }

      return NextResponse.json(user);
    } catch (dbOpError: any) {
      console.error('Database operation error:', {
        message: dbOpError.message,
        code: dbOpError.code,
        stack: dbOpError.stack
      });
      
      // Handle specific database errors
      if (dbOpError.code === 11000) {
        return NextResponse.json({ 
          error: 'This wallet address is already registered' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: `Database operation failed: ${dbOpError.message}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in user API:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}