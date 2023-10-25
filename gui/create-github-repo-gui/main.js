function onCreateRepoButtonClick()
{
    createRepoButton.disabled = true;

    vsCodeApi.postMessage(
        {
            command: "showCreatingRepoPrompt"
        }
    );

    // Create Github repository here...
    

    vsCodeApi.postMessage(
        {
            command: "showCreatedRepoPrompt"
        }
    );

    createRepoButton.disabled = false;
}

function main()
{
    createRepoButton.addEventListener("click", onCreateRepoButtonClick);
}

const vsCodeApi = acquireVsCodeApi();

const createRepoButton = document.getElementById("createRepoButton");

main();

