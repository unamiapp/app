import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Simple fallback image handler for when Firebase Storage is not available
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const filename = params.filename;
    
    // Return a placeholder image
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="#666">
          Image Placeholder
        </text>
        <text x="50%" y="65%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="#999">
          ${filename}
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400'
        }
      }
    );
  } catch (error) {
    console.error('Error serving fallback image:', error);
    return new Response('Error serving image', { status: 500 });
  }
}