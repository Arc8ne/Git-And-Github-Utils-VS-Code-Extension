// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const fs = require("fs");

const childProcess = require("child_process");

const http = require("http");

const https = require("https");

const { Octokit } = require("@octokit/core");

const { createOAuthUserAuth } = require("@octokit/auth-oauth-user");

const DEFAULT_HTTP_PORT = 80;

const DEFAULT_HTTPS_PORT = 443;

const currentVersion = "0.1.0";

// Stores the "open" module which is loaded using a dynamic import instead of the standard require statement.
let open = null;

let appVars = null;

let extensionDataDirAbsolutePath = "";

let appVarsFileAbsolutePath = "";

let githubAccountsDirAbsolutePath = "";

let octokit = null;

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

function generateSSHKeyPairForGithubAccount(githubAccountName, options)
{
	let correspondingGithubAccountDirAbsolutePath = githubAccountsDirAbsolutePath + "/" + githubAccountName;

	let correspondingGithubAccountSSHPrivateKeyFileAbsolutePath = correspondingGithubAccountDirAbsolutePath + "/" + githubAccountName;

	if (options == undefined)
	{
		options = {
			type: "rsa",
			numBits: 2048,
			password: "",
			format: "PEM"
		};
	}

	childProcess.exec(
		`ssh-keygen -t ${options.type} -b ${options.numBits} -C "${githubAccountName}" -N "${options.password}" -m ${options.format} -f "${correspondingGithubAccountSSHPrivateKeyFileAbsolutePath}"`
	);
}

async function loadModules()
{
	open = await import("open");
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	await loadModules();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('The extension "git-and-github-utilities" is now active!');

	extensionDataDirAbsolutePath = context.extensionPath + "/extension-data";

	appVarsFileAbsolutePath = extensionDataDirAbsolutePath + "/app-vars.json";

	githubAccountsDirAbsolutePath = extensionDataDirAbsolutePath + "/github-accounts";

	appVars = JSON.parse(fs.readFileSync(appVarsFileAbsolutePath));

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
		let createGithubRepoWebviewPanel = vscode.window.createWebviewPanel(
			"createGithubRepo",
			"Create a Github repository",
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);

		createGithubRepoWebviewPanel.webview.html = getHTML(
			"/gui/create-github-repo-gui/main.html",
			context,
			{
				"${mainCSSFileUri}": getWebviewUri("/gui/create-github-repo-gui/main.css", createGithubRepoWebviewPanel.webview, context),
				"${mainJSFileUri}": getWebviewUri("/gui/create-github-repo-gui/main.js", createGithubRepoWebviewPanel.webview, context)
			}
		);

		createGithubRepoWebviewPanel.webview.onDidReceiveMessage((message) =>
		{
			switch (message.command)
			{
				case "ShowInfoMsg":
				{
					vscode.window.showInformationMessage(message.msgText);

					break;
				}
				case "UpdateSignInSection":
				{
					let githubAccountDirs = fs.readdirSync(
						githubAccountsDirAbsolutePath,
						{
							withFileTypes: true
						}
					);

					let namesOfGithubAccountsFound = [];

					githubAccountDirs.forEach((folderChild) =>
					{
						namesOfGithubAccountsFound.push(folderChild.name);
					});

					createGithubRepoWebviewPanel.webview.postMessage(
						{
							command: "UpdateSignInSection",
							foundGithubAccountNames: namesOfGithubAccountsFound
						}
					);

					break;
				}
				case "OnGithubAccountLoggedInTo":
				{
					let correspondingGithubAccountDirAbsolutePath = githubAccountsDirAbsolutePath + "/" + message.userName;
			
					if (fs.existsSync(correspondingGithubAccountDirAbsolutePath) == false)
					{
						fs.mkdirSync(correspondingGithubAccountDirAbsolutePath);
					}

					let correspondingGithubAccountInfoFileAbsolutePath = correspondingGithubAccountDirAbsolutePath + "/info.json";

					let githubAccountInfo = {
						userName: message.userName,
						personalAccessToken: message.personalAccessToken
					};

					fs.writeFileSync(
						correspondingGithubAccountInfoFileAbsolutePath,
						JSON.stringify(githubAccountInfo),
						{
							flag: "w"
						}
					);

					let correspondingGithubAccountSSHPrivateKeyFileAbsolutePath = correspondingGithubAccountDirAbsolutePath + "/" + message.userName;

					let correspondingGithubAccountSSHPublicKeyFileAbsolutePath = correspondingGithubAccountDirAbsolutePath + "/" + message.userName + ".pub";

					if (fs.existsSync(correspondingGithubAccountSSHPrivateKeyFileAbsolutePath) == false || fs.existsSync(correspondingGithubAccountSSHPublicKeyFileAbsolutePath) == false)
					{
						generateSSHKeyPairForGithubAccount(message.userName);
					}

					break;
				}
				case "LoginToCachedGithubAccount":
				{
					let githubAccountDirs = fs.readdirSync(githubAccountsDirAbsolutePath);
					
					githubAccountDirs.forEach((githubAccountDirName) =>
					{
						if (githubAccountDirName == message.githubAccountUserName)
						{
							let githubAccountInfo = JSON.parse(
								fs.readFileSync(
									githubAccountsDirAbsolutePath + "/" + githubAccountDirName + "/info.json"
								)
							);

							createGithubRepoWebviewPanel.webview.postMessage(
								{
									command: "LoginToCachedGithubAccountResponse",
									personalAccessToken: githubAccountInfo.personalAccessToken
								}
							);
						}
					});

					break;
				}
				case "OAuthLogin":
				{
					let hostName = "127.0.0.1";

					let port = 3000;

					let httpServer = http.createServer((request, response) =>
					{
						let receivedCode = request.url.replace("/?code=", "");

						octokit = new Octokit(
							{
								authStrategy: createOAuthUserAuth,
								auth: {
									clientId: appVars.clientID,
									clientSecret: appVars.clientSecret,
									code: receivedCode
								}
							}
						);

						response.writeHead(
							200,
							"Success",
							{
								"content-type": "text/html"
							}
						);

						response.write(
							fs.readFileSync(context.extensionPath + "/gui/github-oauth-redirect-webpage/index.html", "utf8")
						);

						response.end();

						httpServer.close();
					});

					httpServer.listen(port, hostName, () =>
					{

					});

					open.default("https://github.com/login/oauth/authorize?client_id=" + appVars.clientID);

					break;
				}
				default:
				{
					break;
				}
			}
		});
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
