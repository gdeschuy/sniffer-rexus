import { getFiles, FileSearchResult, openFile } from './provider';
import * as vscode from 'vscode';

let selectedFolders: string[] = [];

export function activate(context: vscode.ExtensionContext) {
	console.log('File hoarder extension activated');

	context.subscriptions.push(vscode.commands.registerCommand('rexus.openFile', async () => {
		const quickPick = vscode.window.createQuickPick();
		quickPick.placeholder = 'Search files by name or directory';
		quickPick.buttons = [
			{ iconPath: new vscode.ThemeIcon("triangle-left"), tooltip: "back"},
			{ iconPath: new vscode.ThemeIcon("triangle-right"), tooltip: "next"},
		];
		quickPick.items = await getQuickPickItems(quickPick);
		
		quickPick.onDidChangeSelection(async selection => {
			try {
				if (selection[0]) {
					const selectedIcon = selection[0].iconPath;
					if (selectedIcon instanceof vscode.ThemeIcon && selectedIcon.id === 'file-directory') {
						selectedFolders.push(selection[0].label);
						quickPick.items = await getQuickPickItems(quickPick);
						quickPick.value = '';
					} else {
						await openFile(selection[0].label, selection[0].detail);
						quickPick.hide();
					}
				}
			} catch(error) {
				console.error('Selection Change:',error);
			}
		});
		
		quickPick.onDidTriggerButton(async button => {
			if (button.tooltip === 'back' && selectedFolders.length > 0) {
				selectedFolders = selectedFolders.slice(0, selectedFolders.length-1);
				quickPick.items = await getQuickPickItems(quickPick);
			}
			if (button.tooltip === 'next' && quickPick.items.length > 2) {
				for (let i=0; i < quickPick.items.length; i += 1) {
					if (quickPick.items[i].kind !== vscode.QuickPickItemKind.Separator) {
						const selectedIcon = quickPick.items[i].iconPath;
						if (selectedIcon instanceof vscode.ThemeIcon && selectedIcon.id === 'file-directory') {
							selectedFolders.push(quickPick.items[i].label);
							quickPick.items = await getQuickPickItems(quickPick);
							quickPick.value = '';
						} else {
							await openFile(quickPick.items[i].label, quickPick.items[i].detail);
							quickPick.hide();
						}
						break;
					}
				}
			}
		});
		
		quickPick.onDidHide(() => {
			selectedFolders = [];
			quickPick.dispose();
		});
		quickPick.show();
	}));
}

async function getQuickPickItems(quickPick: vscode.QuickPick<vscode.QuickPickItem>): Promise<vscode.QuickPickItem[]> {
	quickPick.busy = true;

	let relativePath: string|undefined = selectedFolders.join("\\") || undefined;
	quickPick.title = relativePath || '[root]';

	const[folders, files]: FileSearchResult = await getFiles(relativePath);
	let items: vscode.QuickPickItem[] = [
		{
			label: 'folders',
			kind: vscode.QuickPickItemKind.Separator
		},
		...folders.map(folder => ({
			iconPath: new vscode.ThemeIcon('file-directory'),
			label: folder.name,
			detail: folder.path
		})),
		{
			label: 'files',
			kind: vscode.QuickPickItemKind.Separator
		},
		...files.map(file => ({
			iconPath: new vscode.ThemeIcon('file'),
			label: file.name,
			detail: file.path
		}))
	];
	quickPick.busy = false;
	return items;
}