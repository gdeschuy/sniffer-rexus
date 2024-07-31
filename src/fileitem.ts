import { Uri, QuickPickItem } from "vscode";
import * as fs from 'fs/promises';
import * as path from 'path';

export enum FileType {
    directory,
    file,
    symbolicLink
}

export class FileItem implements QuickPickItem {
    description?: string;
    detail?: string;
    fileIcon?: string;
    filePath: string;
    fileType: FileType|undefined;
    label: string;
    
    constructor(uri: Uri) {
        this.label = path.basename(uri.fsPath);
        this.filePath = uri.fsPath;
        this.description = 'description';
        this.detail = this.filePath;
    }
}

export async function getFileItem(uri: Uri): Promise<FileItem> {
    let item: FileItem = new FileItem(uri);
    item.fileType = await getFileType(uri);
    return item;
}

async function getFileType(uri: Uri): Promise<FileType|undefined> {
    const fileStat = await fs.stat(uri.fsPath);
    if (fileStat.isDirectory()) {
        return FileType.directory;
    }
    if (fileStat.isFile()) {
        return FileType.file;
    }
    if (fileStat.isSymbolicLink()) {
        return FileType.symbolicLink;
    }
    return undefined;
}