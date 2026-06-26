import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";
import { ApiError } from "../utils/http.js";

const inflateRaw = promisify(zlib.inflateRaw);

type ZipEntry = {
  name: string;
  compression: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

export const filePreviewRouter = Router();

filePreviewRouter.get("/", async (req, res, next) => {
  try {
    const uploadPath = String(req.query.path ?? "");
    const filePath = resolveUploadPath(uploadPath);
    const ext = path.extname(filePath).toLowerCase();
    const buffer = await fs.readFile(filePath);

    if (ext === ".pptx") {
      const entries = readZipEntries(buffer);
      const slides = await readPptxSlides(buffer, entries);
      res.json({ data: { type: "pptx", fileName: path.basename(filePath), slides } });
      return;
    }

    if (ext === ".zip") {
      const entries = readZipEntries(buffer)
        .filter((entry) => !entry.name.endsWith("/"))
        .map((entry) => ({
          name: entry.name,
          size: entry.uncompressedSize
        }));
      res.json({ data: { type: "zip", fileName: path.basename(filePath), entries } });
      return;
    }

    res.json({ data: { type: "unsupported", fileName: path.basename(filePath) } });
  } catch (error) {
    next(error);
  }
});

function resolveUploadPath(uploadPath: string) {
  if (!uploadPath.startsWith("/uploads/")) {
    throw new ApiError(400, "Faqat yuklangan fayllarni ko'rish mumkin");
  }

  const relativePath = uploadPath.replace(/^\/uploads\//, "").split("?")[0];
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const filePath = path.resolve(uploadsRoot, relativePath);

  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new ApiError(400, "Fayl manzili noto'g'ri");
  }

  return filePath;
}

function readZipEntries(buffer: Buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const end = centralDirectoryOffset + centralDirectorySize;
  const entries: ZipEntry[] = [];

  let offset = centralDirectoryOffset;
  while (offset < end && buffer.readUInt32LE(offset) === 0x02014b50) {
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);

    entries.push({ name, compression, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer: Buffer) {
  const minOffset = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }
  throw new ApiError(400, "ZIP/PPTX fayl tuzilmasi o'qilmadi");
}

async function readPptxSlides(buffer: Buffer, entries: ZipEntry[]) {
  const slideEntries = entries
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.name))
    .sort((a, b) => getSlideNumber(a.name) - getSlideNumber(b.name));

  const slides = [];
  for (const entry of slideEntries) {
    const xml = (await readZipEntry(buffer, entry)).toString("utf8");
    const text = extractSlideText(xml);
    slides.push({
      number: getSlideNumber(entry.name),
      text: text || "Bu slaydda o'qiladigan matn topilmadi"
    });
  }

  return slides;
}

async function readZipEntry(buffer: Buffer, entry: ZipEntry) {
  const offset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(offset) !== 0x04034b50) {
    throw new ApiError(400, "ZIP fayl yozuvi o'qilmadi");
  }

  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const dataOffset = offset + 30 + nameLength + extraLength;
  const data = buffer.subarray(dataOffset, dataOffset + entry.compressedSize);

  if (entry.compression === 0) return data;
  if (entry.compression === 8) return inflateRaw(data);

  throw new ApiError(400, "Fayl siqish formati qo'llab-quvvatlanmaydi");
}

function extractSlideText(xml: string) {
  const matches = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)];
  return matches
    .map((match) => decodeXml(match[1]))
    .filter(Boolean)
    .join("\n");
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .trim();
}

function getSlideNumber(name: string) {
  return Number(name.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
}
