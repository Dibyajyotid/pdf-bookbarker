document.addEventListener("DOMContentLoaded", function() {
    const addButton = document.getElementById("add-Bookmark");
    const titleInput = document.getElementById("bookmark-title");
    const notesInput = document.getElementById("bookmark-notes");
    const statusDiv = document.getElementById("status");
    const pdfInfoDiv = document.getElementById("pdf-info");
    const bookmarksList = document.getElementById("bookmarks-list");

    //check if current tab is a PDF or not
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getCurrentPage"}, function(response){
            if (response && response.isPDF) {
                pdfInfoDiv.classList.remove("hidden");
                currentPDF = response
            } else {
                statusDiv.textContent = "This is not a PDF document.";
                pdfInfoDiv.classList.add("hidden");
            }
        })
    })

    //add bookmark button handler
});