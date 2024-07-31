import { Uri, workspace } from 'vscode';
import { FileItem, FileType, getFileItem } from './fileitem';
import * as glob from 'glob';

export type FileSearchResult = [folderItems: FileItem[], fileItems: FileItem[]];

export async function getFiles(searchText: string, searchPath: string|undefined): Promise<FileSearchResult> {
    if (!searchPath) {
        searchPath = await getWorkspaceRoot();
    }
    let searchTerm: string = searchPath.replace(/\\/g, "/");

    return new Promise((resolve,reject) => {
        glob(`${searchTerm}/*`, { nodir: false}, async (error, files) => {
            if (error) {
                reject(error);
                return;
            }

            let folderItems: FileItem[] = [];
            let fileItems: FileItem[] = [];
            for (const file of files) {
                const uri = Uri.file(file);
                const item: FileItem = await getFileItem(uri);
                if (item.fileType === FileType.directory) {
                    folderItems.push(new FileItem(uri));
                } else {
                    fileItems.push(new FileItem(uri));
                }
            };
            resolve([folderItems, fileItems]);
        });
    });
}

export function getWorkspaceRoot(): string {
    const workspaceFolders = workspace.workspaceFolders ? workspace.workspaceFolders.map(f => f.uri.fsPath) : [process.cwd()];
    if (workspaceFolders.length > 1) {
        console.info('More than 1 folder found');
    }
    return workspaceFolders[0];
}