//Detect PDF viewer and current page
function getPDFPageInfo() {
  //this will vary based on the PDF viewer being used
  //For chrome built-in PDF viewer:
  if (document.querySelector('embed[type="application/pdf"]')) {
    const viewer = document.querySelector('embed[type="application/pdf"]');
    const url = viewer.getAttribute("src");
    const pageInput = document.querySelector(".pageNumber");
    // const pageNumber = pageInput ? parseInt(pageInput.value, 10) : 1;
    if (pageInput) {
      return {
        url: url,
        page: parseInt(pageInput.value, 10) || 1,
        isPDF: true,
      };
    }
  }
  return { isPDF: false };
}

//Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCurrentPage") {
        const info = getPDFPageInfo();
        sendResponse(info);
    }
});