//Detect PDF viewer and current page
function getPDFPageInfo() {
  //this will vary based on the PDF viewer being used
  //checking for embedded Pdf:
  const embed = document.querySelector('embed[type="application/pdf"]')
  if(embed) {
    const pageInput = document.querySelector('#pageNumber')
    return {
      url: embed.src || window.location.href,
      page: pageInput ? parseInt(pageInput.value) : 1,
      isPdf: true
    }
  }

  //check for PDF.js viewer 
  const pdfViewer = document.querySelector('.pdfViewer')
  if(pdfViewer) {
    return {
      url: window.location.href,
      page: 1,
      isPDF: true
    }
  }

  //check for URL extension
  if(window.location.href.toLowerCase().endsWith('.pdf')) {
    return {
      url: window.location.href,
      page: 1,
      isPDF: true
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