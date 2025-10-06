import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Construct the file path
    const filePath = join(process.cwd(), 'public', 'examples', `${id}.json`);

    try {
      // Read the file content
      const fileContent = readFileSync(filePath, 'utf-8');

      // Return the file content with proper headers
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (fileError) {
      console.error(`File not found: ${filePath}`, fileError);
      return NextResponse.json(
        { error: `Resource not found for ${id}` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving example resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
