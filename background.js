//Handle communication between content acript and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getBookmarks") {
        // Fetch bookmarks from the backend server
        fetch("http://localhost:8080/get-bookmarks")
            .then(response => response.json())
            .then(data => sendResponse({ bookmarks: data }))
            .catch(error => console.error("Error fetching bookmarks:", error));
        return true; // Indicates that the response will be sent asynchronously
    }

    if (request.action === "addBookmark") {
        // Send a request to the backend server to add a bookmark
        fetch("http://localhost:8080/add-bookmark", {   
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request.bookmark)
        })
            .then(response => response.json())
            .then(data => sendResponse(data))
            .catch(error => console.error("Error adding bookmark:", error));
        return true; // Indicates that the response will be sent asynchronously
    }
})