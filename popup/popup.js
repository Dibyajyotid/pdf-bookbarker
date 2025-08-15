document.addEventListener("DOMContentLoaded", async function () {
  // DOM Elements with null checks
  const addButton = document.getElementById("add-Bookmark");
  const titleInput = document.getElementById("bookmark-title");
  const notesInput = document.getElementById("bookmark-notes");
  const statusDiv = document.getElementById("status");
  const pdfInfoDiv = document.getElementById("pdf-info");
  const bookmarksList = document.getElementById("bookmarks-list");
  const loadingIndicator = document.createElement("div");
  loadingIndicator.textContent = "Loading...";
  loadingIndicator.style.padding = "10px";
  bookmarksList.appendChild(loadingIndicator);

  // Validate required elements exist
  if (
    !addButton ||
    !titleInput ||
    !notesInput ||
    !statusDiv ||
    !pdfInfoDiv ||
    !bookmarksList
  ) {
    console.error("Critical DOM elements missing");
    return;
  }

  let currentPDF = null;

  // Improved PDF detection with error handling
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab) {
      throw new Error("No active tab found");
    }

    // Try to communicate with content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "getCurrentPage",
      });
      if (response?.isPDF) {
        currentPDF = response;
        pdfInfoDiv.classList.remove("hidden");
        statusDiv.textContent = `PDF detected (Page ${response.page})`;
      } else {
        statusDiv.textContent = "This is not a PDF document.";
        pdfInfoDiv.classList.add("hidden");
      }
    } catch (contentScriptError) {
      // Fallback for when content script isn't available
      if (tab.url.toLowerCase().endsWith(".pdf")) {
        currentPDF = {
          url: tab.url,
          page: 1,
          isPDF: true,
        };
        pdfInfoDiv.classList.remove("hidden");
        statusDiv.textContent = "PDF detected (Page 1)";
      } else {
        statusDiv.textContent = "This is not a PDF document.";
        pdfInfoDiv.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("PDF detection failed:", error);
    statusDiv.textContent = "Error detecting PDF: " + error.message;
    pdfInfoDiv.classList.add("hidden");
  }

  // Bookmark button handler with enhanced validation
  addButton.addEventListener("click", async function () {
    if (!currentPDF) {
      statusDiv.textContent = "No PDF document detected";
      return;
    }

    const bookmark = {
      url: currentPDF.url,
      page: currentPDF.page,
      title: titleInput.value || `Page ${currentPDF.page}`,
      notes: notesInput.value,
    };

    // Validate required fields
    if (!bookmark.url) {
      statusDiv.textContent = "Error: No URL found for this PDF";
      return;
    }

    statusDiv.textContent = "Saving bookmark...";
    statusDiv.style.color = "inherit";

    try {
      const response = await chrome.runtime.sendMessage({
        action: "addBookmark",
        data: bookmark,
      });

      if (response?.status === "success") {
        statusDiv.textContent = "Bookmark added successfully!";
        await loadBookmarks();
      } else {
        statusDiv.textContent = response?.error || "Failed to save bookmark";
        statusDiv.style.color = "red";
      }
    } catch (error) {
      console.error("Bookmark save error:", error);
      statusDiv.textContent = "Error saving bookmark: " + error.message;
      statusDiv.style.color = "red";
    }
  });

  // Improved bookmarks loading with error handling
  async function loadBookmarks() {
    bookmarksList.innerHTML = "";
    const loading = document.createElement("div");
    loading.textContent = "Loading bookmarks...";
    bookmarksList.appendChild(loading);

    try {
      const bookmarks = await chrome.runtime.sendMessage({
        action: "getBookmarks",
      });
      bookmarksList.innerHTML = "";

      if (!bookmarks || bookmarks.length === 0) {
        bookmarksList.innerHTML = `<p class="empty-message">No bookmarks yet</p>`;
        return;
      }

      const list = document.createElement("ul");
      bookmarks.forEach((bm) => {
        const item = document.createElement("li");
        item.innerHTML = `
          <div class="bookmark-item">
            <strong>${bm.title || `Page ${bm.page}`}</strong> (Page ${
          bm.page
        })<br>
            <small>${bm.notes || "No notes"}</small>
            <button class="goto-button" data-url="${bm.url}" data-page="${
          bm.page
        }">
              Go to
            </button>
          </div>
        `;
        list.appendChild(item);
      });
      bookmarksList.appendChild(list);

      // Add event listeners to go-to buttons
      document.querySelectorAll(".goto-button").forEach((btn) => {
        btn.addEventListener("click", function () {
          const url = this.getAttribute("data-url");
          const page = this.getAttribute("data-page");
          if (url) {
            chrome.tabs
              .create({ url: `${url}#page=${page}` })
              .catch((err) => console.error("Error opening tab:", err));
          }
        });
      });
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      bookmarksList.innerHTML = `
        <p class="error-message">
          Error loading bookmarks: ${error.message}
        </p>
      `;
    }
  }

  // Initial load
  await loadBookmarks();
});
