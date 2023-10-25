// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const fs = require("fs");

const currentVersion = "0.1.0";

let extensionDataDirAbsolutePath = "";

let githubAccountsDirAbsolutePath = "";

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

function getHTML(relativePathToHTMLFileFromExtensionDir, context, stringReplacements = null)
{
	let html = fs.readFileSync(getAbsoluteFilePath(relativePathToHTMLFileFromExtensionDir, context), "utf8");

	if (stringReplacements != null)
	{
		for (const stringToReplace in stringReplacements)
		{
			html = html.replace(stringToReplace, stringReplacements[stringToReplace]);
		}
	}

	return html;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	extensionDataDirAbsolutePath = context.extensionPath + "/extension-data";

	githubAccountsDirAbsolutePath = extensionDataDirAbsolutePath + "/github-accounts";

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('The extension "git-and-github-utilities" is now active!');

	if (fs.existsSync(extensionDataDirAbsolutePath) == false)
	{
		fs.mkdirSync(extensionDataDirAbsolutePath);
	}

	if (fs.existsSync(githubAccountsDirAbsolutePath) == false)
	{
		fs.mkdirSync(githubAccountsDirAbsolutePath);
	}

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

		webviewPanel.webview.html = getHTML(
			"/gui/create-github-repo-gui/main.html",
			context,
			{
				"${mainCSSFileUri}": getWebviewUri("/gui/create-github-repo-gui/main.css", webviewPanel.webview, context),
				"${mainJSFileUri}": getWebviewUri("/gui/create-github-repo-gui/main.js", webviewPanel.webview, context)
			}
		);

		webviewPanel.webview.onDidReceiveMessage((message) =>
		{
			switch (message.command)
			{
				case "ShowInfoMsg":
					vscode.window.showInformationMessage(message.msgText);

					break;
				case "OnGithubAccountLoggedInTo":
					let correspondingGithubAccountDirAbsolutePath = githubAccountsDirAbsolutePath + "/" + message.userName;
			
					if (fs.existsSync(correspondingGithubAccountDirAbsolutePath) == false)
					{
						fs.mkdirSync(correspondingGithubAccountDirAbsolutePath);
					}

					break;
				default:
					break;
			}
		});
		
		// console.log(webviewPanel.webview.html);
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
