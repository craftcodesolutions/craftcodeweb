import { NextResponse } from 'next/server';
   import { getSocketIO, initializeSocketIO } from '@/lib/socketServer';

   export async function GET() {
     try {
       let io = getSocketIO();
       if (!io) {
         console.log('🔄 Socket.IO server not initialized, initializing now...');
         io = initializeSocketIO();
       }
       console.log('✅ Socket.IO server is initialized');
       return NextResponse.json({ message: 'Socket.IO server initialized' }, { status: 200 });
     } catch (error) {
       const err = error as unknown;
       console.error('❌ Error in /api/socket:', err);
       let message = 'Unknown error';
       if (err && typeof err === 'object' && err !== null && 'message' in err) {
         message = (err as any).message;
       }
       return NextResponse.json({ error: `Internal server error: ${message}` }, { status: 500 });
     }
   }