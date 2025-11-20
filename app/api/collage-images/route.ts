import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const IMAGE_SECTION_DIR = path.join(process.cwd(), 'public', 'image section');
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export async function GET() {
  try {
    const entries = await fs.readdir(IMAGE_SECTION_DIR, { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Failed to read collage images', error);
    return NextResponse.json(
      { error: 'Unable to load collage images' },
      { status: 500 }
    );
  }
}
