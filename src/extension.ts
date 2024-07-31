import { window, commands, ExtensionContext } from 'vscode';
import { getFiles, FileSearchResult } from './provider';

export function activate(context: ExtensionContext) {
	console.log('Rex Extension Activated');

	context.subscriptions.push(commands.registerCommand('rexus.browseFiles', () => {
		const quickPick = window.createQuickPick();
		quickPick.placeholder = 'Search files by name or directory';
		
		quickPick.onDidChangeValue(async (value) => {
			if (!value) {
				quickPick.items = [];
				return;
			}

			quickPick.busy = true;
			try {
				const[folders, files]: FileSearchResult = await getFiles(value, undefined);
				quickPick.items = [
					...folders.map(folder => ({
						label: `$(file-directory) ${folder.label}`,
						description: folder.description,
						detail: folder.detail
					})),
					...files.map(file => ({
						label: `$(file) ${file.label}`,
						description: file.description,
						detail: file.detail
					}))
				];
				quickPick.busy = false;
            } catch(error) {
                console.error('OnDidChangeValue error:',error);
            }
		});
		
		quickPick.onDidChangeSelection(selection => {
			try {
				if (selection[0]) {
					const selectedItem = selection[0];
					console.log(`Detail: ${selectedItem.detail}`);
					let fileName = selectedItem.label.slice(selectedItem.label.indexOf(" ")+1);
					window.showInformationMessage(`File Browser: Opened ${fileName} file`);
					quickPick.hide();
				}
			} catch(error) {
				console.error(error);
			}
		});
		
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}