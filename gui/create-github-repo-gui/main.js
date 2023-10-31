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
    /*
    let userPublicInfo = null;

    try
    {
        userPublicInfo = await octokit.rest.users.getAuthenticated();
    }
    catch (e)
    {
        vsCodeApi.postMessage(
            {
                command: "ShowInfoMsg",
                msgText: "Failed to sign in to the Github account with the specified personal access token. Please ensure that the personal access token that you have entered in is correct and try again."
            }
        );

        return;
    }
    */
}

function onLoginButtonClick()
{   
    if (githubAccountSelectInput.options[githubAccountSelectInput.options.selectedIndex].text == DEFAULT_GITHUB_ACCOUNT_SELECT_INPUT_OPTION)
    {
        vsCodeApi.postMessage(
            {
                command: "LoginUsingPersonalAccessToken",
                personalAccessToken: personalAccessTokenInput.value
            }
        );
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
            command: "OAuthLogin",
            userName: userNameInput.value
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
            case "PersonalAccessTokenLoginSuccessful":
            {
                vsCodeApi.postMessage(
                    {
                        command: "OnGithubAccountLoggedInTo",
                        userName: userPublicInfo.data.login,
                        personalAccessToken: personalAccessTokenInput.value
                    }
                );

                signedInAsLabel.innerText = "Signed in as " + message.userName;
            
                signedInUserProfileImage.src = message.avatarImgSrc;
            
                updateAccountSelectionContainer();
            
                signInPanel.style["display"] = "none";
            
                signInInfoContainer.style["display"] = "flex";

                break;
            }
            case "OAuthOrCachedGithubAccountLoginSuccessful":
            {
                signedInAsLabel.innerText = "Signed in as " + message.userName;

                signedInUserProfileImage.src = message.avatarImgSrc;

                signInPanel.style["display"] = "none";

                signInInfoContainer.style["display"] = "flex";

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

const userNameInput = document.getElementById("userNameInput");

main();

