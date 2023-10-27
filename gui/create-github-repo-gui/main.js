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

async function onLoginButtonClick()
{
    setOctokit(
        new Octokit(
            {
                auth: personalAccessTokenInput.value
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
            personalAccessToken: personalAccessTokenInput.value
        }
    );

    signedInAsLabel.innerText = "Signed in as " + userPublicInfo.data.login;

    signedInUserProfileImage.src = userPublicInfo.data.avatar_url;

    signInPanel.style["display"] = "none";

    signInInfoContainer.style["display"] = "flex";
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

function main()
{
    window.addEventListener("message", (event) =>
    {
        let message = event.data;

        switch (message.command)
        {
            case "SignInSectionLoaded":


                break;
            default:
                break;
        }
    });

    createRepoButton.addEventListener("click", onCreateRepoButtonClick);

    signInButton.addEventListener("click", onSignInButtonClick);

    loginButton.addEventListener("click", onLoginButtonClick);

    logoutButton.addEventListener("click", onLogoutButtonClick);

    closeSignInPanelButton.addEventListener("click", onCloseSignInPanelButtonClick);

    setOctokit(null);

    vsCodeApi.postMessage(
        {
            command: "SignInSectionLoaded"
        }
    );
}

const vsCodeApi = acquireVsCodeApi();

let octokit = null;

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

main();

