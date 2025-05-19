// src/services/logViewerService.ts
import type { TreeNodeData } from "@mantine/core";
import axios from "axios";

export interface FileMetadata {
    path: string;
    size: number;
    lastModified?: string;
}

export interface LogChunk {
    lines: string[];
    nextOffset: number;
    hasMore: boolean;
}

const API_BASE = "/cem/bff/log-viewer/api";

export const getBaseDir = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/baseDir`);
    const data = await res.json();
    return data.baseDir;
};

export const fetchDirTree = async (path: string): Promise<TreeNodeData[]> => {
    const res = await fetch(
        `${API_BASE}/dir-tree?path=${encodeURIComponent(path)}&maxDepth=1`
    );
    return await res.json();
};

export const getFileMetadata = async (path: string): Promise<FileMetadata> => {
    const res = await axios.get<FileMetadata>(`${API_BASE}/file-metadata`, {
        params: { path },
    });
    return res.data;
};

export const fetchLogChunk = async (
    path: string,
    offset: number,
    limit = 100
): Promise<LogChunk> => {
    const res = await axios.get<LogChunk>(`${API_BASE}/log-chunk`, {
        params: { path, offset, limit },
    });
    return res.data;
};

export const downloadFile = async (path: string): Promise<Blob> => {
    const res = await axios.get(`${API_BASE}/download-file`, {
        params: { path },
        responseType: "blob",
    });
    return res.data;
};
