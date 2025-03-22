import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const filename = request.nextUrl.searchParams.get('filename');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return new NextResponse('Failed to fetch the file', { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${filename || 'download.zip'}"`,
                'Content-Type': 'application/octet-stream',
                'Content-Length': arrayBuffer.byteLength.toString()
            }
        });
    } catch (error) {
        console.error('Proxy download error:', error);
        return new NextResponse('Failed to proxy download', { status: 500 });
    }
}
