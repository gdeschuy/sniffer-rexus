import { FileItem, FileType, getFileItem } from './fileitem';
import * as vscode from 'vscode';
import * as glob from 'glob';

export type FileSearchResult = [folderItems: FileItem[], fileItems: FileItem[]];

export async function getFiles(searchPath: string|undefined): Promise<FileSearchResult> {
    let searchDir: string = getWorkspaceRoot();
    if (searchPath) {
        searchDir = searchDir.concat('/',searchPath);
    }
    let searchTerm: string = searchDir.replace(/\\/g, "/");

    return new Promise((resolve,reject) => {
        glob(`${searchTerm}/*`, { nodir: false}, async (error, files) => {
            if (error) {
                reject(error);
                return;
            }

            let folderItems: FileItem[] = [];
            let fileItems: FileItem[] = [];
            for (const file of files) {
                const uri = vscode.Uri.file(file);
                const item: FileItem = await getFileItem(uri);
                if (item.type === FileType.directory) {
                    folderItems.push(new FileItem(uri));
                } else {
                    fileItems.push(new FileItem(uri));
                }
            };
            resolve([folderItems, fileItems]);
        });
    });
}

export async function openFile(fileName: string, filePath: string|undefined) {
    try {
        if (!filePath) {
            throw new Error('Open File: File path empty');
        }
        const document = await vscode.workspace.openTextDocument(filePath);
        vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders');
        await vscode.window.showTextDocument(document);
		vscode.window.showInformationMessage(`File Browser: opened ${fileName}`);
    } catch(error) {
        vscode.window.showErrorMessage(`File Browser: failed to open ${fileName}`);
        console.error(error);
    }
}

export function getWorkspaceRoot(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders 
        ? vscode.workspace.workspaceFolders.map(f => f.uri.fsPath) 
        : [process.cwd()];

    if (workspaceFolders.length > 1) {
        console.info('More than 1 folder found');
    }
    return workspaceFolders[0];
}