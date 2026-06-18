"use client";

import { createFile } from "mp4box";
import type { ISOFile } from "mp4box";

export type VideoChunk = {
  index: number;
  blob: Blob;
  startSec: number;
  endSec: number;
};

export type ChunkProgress = {
  parsed: number;   // 0–100 file read progress
  chunked: number;  // chunks produced so far
  total: number;    // estimated total chunks
};

type Options = {
  chunkDurationSec?: number;
  onProgress?: (p: ChunkProgress) => void;
};

function mergeBuffers(bufs: ArrayBuffer[]): ArrayBuffer {
  const total = bufs.reduce((n, b) => n + b.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of bufs) {
    out.set(new Uint8Array(b), offset);
    offset += b.byteLength;
  }
  return out.buffer;
}

export function chunkMP4File(file: File, opts: Options = {}): Promise<VideoChunk[]> {
  const CHUNK_SEC = opts.chunkDurationSec ?? 10;

  return new Promise((resolve, reject) => {
    const mp4: ISOFile = createFile();
    const chunks: VideoChunk[] = [];
    let initBuf: ArrayBuffer | null = null;
    let movieDurationSec = 0;
    let segCount = 0;

    mp4.onReady = (info) => {
      movieDurationSec = info.duration / info.timescale;
      const estimatedTotal = Math.ceil(movieDurationSec / CHUNK_SEC);

      // Set segmentation options per track
      for (const track of info.tracks) {
        const samplesPerSeg = Math.round(
          (CHUNK_SEC / (info.duration / info.timescale)) * track.nb_samples,
        );
        mp4.setSegmentOptions(track.id, null, { nbSamples: samplesPerSeg });
      }

      // Collect init segment (single buffer covering all tracks)
      const segResult = mp4.initializeSegmentation();
      initBuf = segResult.buffer as unknown as ArrayBuffer;

      opts.onProgress?.({ parsed: 100, chunked: 0, total: estimatedTotal });
      mp4.start();
    };

    mp4.onSegment = (
      _id: number,
      _user: unknown,
      buffer: ArrayBuffer,
      _sampleNum: number,
      last: boolean,
    ) => {
      const index = segCount++;
      const startSec = index * CHUNK_SEC;
      const endSec = Math.min(startSec + CHUNK_SEC, movieDurationSec);

      // Prepend init so each chunk is independently decodable
      const chunkBuf = mergeBuffers([initBuf!, buffer]);
      chunks.push({
        index,
        blob: new Blob([chunkBuf], { type: "video/mp4" }),
        startSec,
        endSec,
      });

      const estimatedTotal = Math.ceil(movieDurationSec / CHUNK_SEC);
      opts.onProgress?.({ parsed: 100, chunked: segCount, total: estimatedTotal });

      if (last) resolve(chunks);
    };

    mp4.onError = (e: string) => reject(new Error(e));

    // Stream the file into mp4box in 4 MB slices
    const SLICE = 4 * 1024 * 1024;
    let offset = 0;

    function readNext() {
      const slice = file.slice(offset, offset + SLICE);
      slice.arrayBuffer().then((buf) => {
        (buf as ArrayBuffer & { fileStart: number }).fileStart = offset;
        mp4.appendBuffer(buf as ArrayBuffer & { fileStart: number });
        offset += buf.byteLength;
        opts.onProgress?.({
          parsed: Math.round((offset / file.size) * 100),
          chunked: segCount,
          total: 0,
        });
        if (offset < file.size) {
          readNext();
        } else {
          mp4.flush();
        }
      });
    }

    readNext();
  });
}
