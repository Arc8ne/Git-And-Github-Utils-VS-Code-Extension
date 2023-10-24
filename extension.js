// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const fs = require("fs");

const currentVersion = "0.1.0";

function getAbsoluteFilePath(relativePathToResourceFromExtensionDir, context)
{
	return context.extensionPath + relativePathToResourceFromExtensionDir;
}

function getLocalUri(relativePathToResourceFromExtensionDir, context)
{
	return vscode.Uri.file(getAbsoluteFilePath(relativePathToResourceFromExtensionDir, context));
}

function getWebviewUri(relativePathToResourceFromExtensionDir, webview, context)
{
	return webview.asWebviewUri(getLocalUri(relativePathToResourceFromExtensionDir, context));
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('The extension "git-and-github-utilities" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let versionCheckCommandDisposable = vscode.commands.registerCommand('git-and-github-utilities.versionCheck', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage("Current version: " + currentVersion);
	});

	context.subscriptions.push(versionCheckCommandDisposable);

	let createGithubRepoCommandDisposable = vscode.commands.registerCommand("git-and-github-utilities.createGithubRepo", function () {
		let webviewPanel = vscode.window.createWebviewPanel(
			"createGithubRepo",
			"Create a Github repository",
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);
		
		webviewPanel.webview.html = fs.readFileSync(
			getAbsoluteFilePath("/gui/create-github-repo-gui/main.html", context),
			"utf8"
		).replace(
			"${mainCSSFileUri}",
			// getLocalUri("/gui/create-github-repo-gui/main.css", context).toString()
			// context.extensionPath + "/gui/create-github-repo-gui/main.css"
			getWebviewUri("/gui/create-github-repo-gui/main.css", webviewPanel.webview, context).toString()
		);
	});

	context.subscriptions.push(createGithubRepoCommandDisposable);
}

// This method is called when your extension is deactivated
function deactivate()
{
	
}

module.exports = {
	activate,
	deactivate
}
