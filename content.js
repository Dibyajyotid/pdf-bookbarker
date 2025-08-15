// Enhanced PDF detection with support for multiple viewers and error handling
function getPDFPageInfo() {
  try {
    // Check for Chrome's built-in PDF viewer
    if (
      window.location.origin ===
      "chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai"
    ) {
      const pageInput = document.querySelector("#pageNumber");
      const filename =
        new URLSearchParams(window.location.search).get("file") ||
        decodeURIComponent(window.location.pathname.split("/").pop());

      return {
        url: `file://${filename}`,
        page: pageInput ? parseInt(pageInput.value) : 1,
        isPDF: true,
        viewer: "chrome",
      };
    }

    // Check for embedded PDF element
    const embed = document.querySelector(
      'embed[type="application/pdf"], object[type="application/pdf"]'
    );
    if (embed) {
      const pageInput = document.querySelector("#pageNumber");
      const url = embed.src || embed.data || window.location.href;

      return {
        url: url,
        page: pageInput ? parseInt(pageInput.value) : 1,
        isPDF: true,
        viewer: "embedded",
      };
    }

    // Check for PDF.js viewer (used by Firefox and some websites)
    const pdfjsViewer = document.querySelector(
      ".pdfViewer, .pdfViewerContainer"
    );
    if (pdfjsViewer) {
      const pageElement = document.querySelector("#pageNumber");
      const pageLabel = document.querySelector(".pageLabel");

      let page = 1;
      if (pageElement) {
        page = parseInt(pageElement.value);
      } else if (pageLabel) {
        const match = pageLabel.textContent.match(/(\d+)/);
        page = match ? parseInt(match[1]) : 1;
      }

      return {
        url: window.location.href,
        page: page,
        isPDF: true,
        viewer: "pdfjs",
      };
    }

    // Check for Adobe Acrobat viewer in browser
    if (document.querySelector("#viewer")) {
      return {
        url: window.location.href,
        page: 1, // Adobe viewer doesn't expose page number easily
        isPDF: true,
        viewer: "adobe",
      };
    }

    // Fallback to URL check
    const url = window.location.href.toLowerCase();
    if (
      url.endsWith(".pdf") ||
      url.includes(".pdf?") ||
      url.includes(".pdf#")
    ) {
      return {
        url: window.location.href,
        page: 1,
        isPDF: true,
        viewer: "direct",
      };
    }

    // Check for blob URLs (PDFs opened from memory)
    if (url.startsWith("blob:")) {
      return {
        url: window.location.href,
        page: 1,
        isPDF: true,
        viewer: "blob",
      };
    }

    return {
      isPDF: false,
      reason: "No PDF viewer detected",
      url: window.location.href,
    };
  } catch (error) {
    console.error("PDF detection error:", error);
    return {
      isPDF: false,
      error: error.message,
      url: window.location.href,
    };
  }
}

// Enhanced message listener with async support
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentPage") {
    try {
      const info = getPDFPageInfo();

      // Additional verification for Chrome's PDF viewer
      if (info.isPDF && info.viewer === "chrome" && !info.url) {
        info.url = window.location.href;
      }

      sendResponse(info);
    } catch (error) {
      sendResponse({
        isPDF: false,
        error: error.message,
        url: window.location.href,
      });
    }
  }

  return true;
});
