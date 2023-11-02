// language=html
export const content = `<div id="signInInfoContainer" class="signed-in-info-container">
    <img id="signedInUserProfileImage" class="signed-in-user-profile-image"/>

    <p id="signedInAsLabel">Signed in as User</p>

    <button id="logoutButton" class="vscode-button">Log out</button>
</div>

<button id="signInButton" class="sign-in-button vscode-button">Sign in to a Github account</button>

<div id="signInPanel" class="sign-in-panel">
    <div class="input-grid">
        <p>Username:</p>

        <input id="userNameInput" class="vscode-text-field"/>

        <p>Browser to open login prompt in:</p>

        <select class="vscode-combo-box">
            <option>Microsoft Edge</option>

            <option>Google Chrome</option>

            <option>Mozilla Firefox</option>
        </select>

        <p>Open in private/incognito window</p>

        <input type="checkbox"/>
    </div>

    <button id="oAuthLoginBtn" class="vscode-button">Log in using OAuth</button>

    <table width="100%">
        <tr>
            <td>
                <hr/>
            </td>

            <td class="or-divider-text-cell">or</td>

            <td>
                <hr/>
            </td>
        </tr>
    </table>

    <div class="input-grid">
        <p>Personal access token:</p>

        <input id="personalAccessTokenInput" class="vscode-text-field personal-access-token-text-field"/>
    </div>

    <div id="accountSelectionContainer">
        <table width="100%">
            <tr>
                <td>
                    <hr/>
                </td>

                <td class="or-divider-text-cell">or</td>

                <td>
                    <hr/>
                </td>
            </tr>
        </table>

        <div class="input-grid">
            <p>Github account to sign in with:</p>

            <select id="githubAccountSelectInput" class="vscode-combo-box">
                <option>Please select a Github account...</option>
            </select>
        </div>
    </div>

    <div class="input-grid">
        <p>Keep me logged in</p>

        <input type="checkbox" class="vscode-combo-box keep-me-logged-in-checkbox"/>
    </div>

    <div class="sign-in-panel-buttons-container">
        <button id="loginButton" class="login-button vscode-button">Log in</button>

        <button id="closeSignInPanelButton" class="vscode-button">Close</button>
    </div>
</div>`;