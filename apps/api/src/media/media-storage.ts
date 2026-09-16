import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

const configuredUploadsDirectory = process.env.UPLOADS_DIR;

export const UPLOADS_ROOT = configuredUploadsDirectory
  ? isAbsolute(configuredUploadsDirectory)
    ? configuredUploadsDirectory
    : resolve(process.cwd(), configuredUploadsDirectory)
  : join(process.cwd(), 'uploads');

const IMAGES_DIR = 'images';
const DOCUMENTS_DIR = 'documents';

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
};

export function getExtensionForMimeType(mimeType: string): string | null {
  return MIME_EXTENSION_MAP[mimeType] ?? null;
}

function getSubdirectoryForMimeType(mimeType: string): string {
  return mimeType.startsWith('image/') ? IMAGES_DIR : DOCUMENTS_DIR;
}

export interface SavedFile {
  fileName: string;
  relativePath: string;
  url: string;
}

/**
 * The stored file name is always a freshly generated UUID + a fixed, mime-derived
 * extension — the client's original file name never touches the file system path,
 * so path traversal via a crafted name is not possible.
 */
export async function saveUploadedFile(buffer: Buffer, mimeType: string): Promise<SavedFile> {
  const extension = getExtensionForMimeType(mimeType);

  if (!extension) {
    throw new Error(`Unsupported mime type: ${mimeType}`);
  }

  const subdirectory = getSubdirectoryForMimeType(mimeType);
  const fileName = `${randomUUID()}.${extension}`;
  const directory = join(UPLOADS_ROOT, subdirectory);

  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, fileName), buffer);

  const relativePath = `${subdirectory}/${fileName}`;

  return {
    fileName,
    relativePath,
    url: `/uploads/${relativePath}`,
  };
}

export async function deleteUploadedFile(relativePath: string): Promise<void> {
  const absolutePath = join(UPLOADS_ROOT, relativePath);

  if (!existsSync(absolutePath)) {
    return;
  }

  try {
    await unlink(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}
