import * as vscode from "vscode";
import * as fs from 'fs/promises';
import * as path from 'path';

export enum FileType {
    directory,
    file,
    symbolicLink
}

export class FileItem {
    name: string;
    path: string;
    type?: FileType;
    
    constructor(uri: vscode.Uri) {
        this.name = path.basename(uri.fsPath);
        this.path = uri.fsPath;
    }
}

export async function getFileItem(uri: vscode.Uri): Promise<FileItem> {
    let item: FileItem = new FileItem(uri);
    item.type = await getFileType(uri);
    return item;
}

async function getFileType(uri: vscode.Uri): Promise<FileType|undefined> {
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