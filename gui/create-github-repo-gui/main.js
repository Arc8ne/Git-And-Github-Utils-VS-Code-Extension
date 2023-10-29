import { Octokit, App } from "https://esm.sh/octokit";

function setOctokit(value)
{
    octokit = value;

    if (octokit == null)
    {
        createRepoButton.disabled = true;
    }
    else
    {
        createRepoButton.disabled = false;
    }
}

function onCreateRepoButtonClick()
{
    createRepoButton.disabled = true;

    vsCodeApi.postMessage(
        {
            command: "ShowInfoMsg",
            msgText: "Creating the Github repository. Please wait..."
        }
    );

    // Create Github repository here...


    vsCodeApi.postMessage(
        {
            command: "ShowInfoMsg",
            msgText: "Github repository created successfully."
        }
    );

    createRepoButton.disabled = false;
}

function onSignInButtonClick()
{
    signInPanel.style["display"] = "flex";

    signInButton.style["display"] = "none";
}

async function login(personalAccessToken)
{
    setOctokit(
        new Octokit(
            {
                auth: personalAccessToken
            }
        )
    );

    let userPublicInfo = null;

    try
    {
        userPublicInfo = await octokit.rest.users.getAuthenticated();
    }
    catch (e)
    {
        setOctokit(null);

        vsCodeApi.postMessage(
            {
                command: "ShowInfoMsg",
                msgText: "Failed to sign in to the Github account with the specified personal access token. Please ensure that the personal access token that you have entered in is correct and try again."
            }
        );

        return;
    }

    vsCodeApi.postMessage(
        {
            command: "OnGithubAccountLoggedInTo",
            userName: userPublicInfo.data.login,
            personalAccessToken: personalAccessToken
        }
    );

    signedInAsLabel.innerText = "Signed in as " + userPublicInfo.data.login;

    signedInUserProfileImage.src = userPublicInfo.data.avatar_url;

    updateAccountSelectionContainer();

    signInPanel.style["display"] = "none";

    signInInfoContainer.style["display"] = "flex";
}

function onLoginButtonClick()
{
    let personalAccessTokenToUse = "";
    
    if (githubAccountSelectInput.options[githubAccountSelectInput.options.selectedIndex].text == DEFAULT_GITHUB_ACCOUNT_SELECT_INPUT_OPTION)
    {
        personalAccessTokenToUse = personalAccessTokenInput.value;

        login(personalAccessTokenToUse);
    }
    else
    {
        vsCodeApi.postMessage(
            {
                command: "LoginToCachedGithubAccount",
                githubAccountUserName: githubAccountSelectInput.options[githubAccountSelectInput.options.selectedIndex].text
            }
        );
    }
}

function onLogoutButtonClick()
{
    setOctokit(null);

    signInInfoContainer.style["display"] = "none";

    signInButton.style["display"] = "block";
}

function onCloseSignInPanelButtonClick()
{
    signInPanel.style["display"] = "none";

    signInButton.style["display"] = "block";
}

function updateAccountSelectionContainer()
{
    vsCodeApi.postMessage(
        {
            command: "UpdateSignInSection"
        }
    );
}

function onOAuthLoginBtnClick()
{
    vsCodeApi.postMessage(
        {
            command: "OAuthLogin"
        }
    );
}

function main()
{
    window.addEventListener("message", (event) =>
    {
        let message = event.data;

        switch (message.command)
        {
            case "UpdateSignInSection":
            {
                if (message.foundGithubAccountNames.length > 0)
                {
                    accountSelectionContainer.style["display"] = "block";
                }
                else
                {
                    accountSelectionContainer.style["display"] = "none";
                }

                for (let currentChildIndex = 0; currentChildIndex < githubAccountSelectInput.children.length; currentChildIndex++)
                {
                    if (githubAccountSelectInput.children[currentChildIndex].innerText != DEFAULT_GITHUB_ACCOUNT_SELECT_INPUT_OPTION)
                    {
                        githubAccountSelectInput.removeChild(githubAccountSelectInput.children[currentChildIndex]);
                    }
                }

                message.foundGithubAccountNames.forEach((foundGithubAccountName) =>
                {
                    let newOption = document.createElement("option");

                    newOption.innerText = foundGithubAccountName;

                    githubAccountSelectInput.appendChild(newOption);
                });

                break;
            }
            case "LoginToCachedGithubAccountResponse":
            {
                login(message.personalAccessToken);

                break;
            }
            default:
            {
                break;
            }
        }
    });

    createRepoButton.addEventListener("click", onCreateRepoButtonClick);

    signInButton.addEventListener("click", onSignInButtonClick);

    loginButton.addEventListener("click", onLoginButtonClick);

    logoutButton.addEventListener("click", onLogoutButtonClick);

    closeSignInPanelButton.addEventListener("click", onCloseSignInPanelButtonClick);

    oAuthLoginBtn.addEventListener("click", onOAuthLoginBtnClick);

    setOctokit(null);

    updateAccountSelectionContainer();
}

const DEFAULT_GITHUB_ACCOUNT_SELECT_INPUT_OPTION = "Please select a Github account...";

const vsCodeApi = acquireVsCodeApi();

const createRepoButton = document.getElementById("createRepoButton");

const signInButton = document.getElementById("signInButton");

const signInPanel = document.getElementById("signInPanel");

const loginButton = document.getElementById("loginButton");

const personalAccessTokenInput = document.getElementById("personalAccessTokenInput");

const signedInAsLabel = document.getElementById("signedInAsLabel");

const signedInUserProfileImage = document.getElementById("signedInUserProfileImage");

const signInInfoContainer = document.getElementById("signInInfoContainer");

const logoutButton = document.getElementById("logoutButton");

const closeSignInPanelButton = document.getElementById("closeSignInPanelButton");

const accountSelectionContainer = document.getElementById("accountSelectionContainer");

const githubAccountSelectInput = document.getElementById("githubAccountSelectInput");

const oAuthLoginBtn = document.getElementById("oAuthLoginBtn");

let octokit = null;

main();

