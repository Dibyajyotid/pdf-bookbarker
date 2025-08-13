document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("add-Bookmark");
  const titleInput = document.getElementById("bookmark-title");
  const notesInput = document.getElementById("bookmark-notes");
  const statusDiv = document.getElementById("status");
  const pdfInfoDiv = document.getElementById("pdf-info");
  const bookmarksList = document.getElementById("bookmarks-list");

  //check if current tab is a PDF or not
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getCurrentPage" },
      function (response) {
        if (response && response.isPDF) {
          pdfInfoDiv.classList.remove("hidden");
          currentPDF = response;
        } else {
          statusDiv.textContent = "This is not a PDF document.";
          pdfInfoDiv.classList.add("hidden");
        }
      }
    );
  });

  //add bookmark button handler
  addButton.addEventListener("click", function () {
    if (!currentPDF) return;

    const bookmark = {
      url: currentPDF.url,
      page: currentPDF.page,
      titlle: titleInput.value || `Page ${currentPDF.page}`,
      notes: notesInput.value,
    };

    chrome.runtime.sendMessage(
      { action: "addBookmark", data: bookmark },
      function (response) {
        if (response.status === "success") {
          statusDiv.textContent = "Bookmark added!";
          loadBookmarks();
        } else {
          statusDiv.textContent = "Error adding bookmark";
        }
      }
    );
  });

  //load existing bookmarks
  function loadBookmarks() {
    chrome.runtime.sendMessage(
      { action: "getBookmarks" },
      function (bookmarks) {
        bookmarksList.innerHTML = "";
        if (bookmarks.length === 0) {
          bookmarksList.innerHTML = `<p>No bookmarks yet</p>`;
          return;
        }

        const list = document.createElement("ul");
        bookmarks.forEach((bm) => {
          const item = document.createElement("li");
          item.innerHTML = `
                    <strong>${bm.titlle}</strong> (Page ${bm.page}) <br>
                    <small>${bm.notes || "No notes"}</small>
                    <button data-url = "${bm.url}" data-page="${
            bm.page
          }">Go to</button>
                `;
          list.appendChild(item);
        });
        bookmarksList.appendChild(list);

        //add event listeners to go to buttons
        document.querySelectorAll("[data-url]").forEach((btn) => {
          btn.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            const page = this.getAttribute("data-page");
            chrome.tabs.crteate({ url: `${url}#page=${page}` });
          });
        });
      }
    );
  }

  loadBookmarks();
});
