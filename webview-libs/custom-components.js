import { content as githubAccountPanelHTML } from "../webview-libs/github-account-panel-html.js"

class GithubAccountPanel extends HTMLElement
{
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        this.innerHTML = githubAccountPanelHTML;
    }
}

customElements.define("github-account-panel", GithubAccountPanel);
