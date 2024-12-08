let sideWindow = null;
let draggedImageUrl = null; // Store the most recently dragged image URL
const popupHeight = 1900; // Adjust to the desired height
const popupWidth = 400;

// Handle icon click to open/close the side window
chrome.action.onClicked.addListener(() => {
  if (sideWindow) {
    chrome.windows.remove(sideWindow.id);
    sideWindow = null;
  } else {
    chrome.system.display.getInfo((displays) => {
      if (displays && displays.length > 0) {
        const display = displays[0];
        const screenWidth = display.workArea.width;
        const screenHeight = display.workArea.height;

        // Dynamically set popup height based on screen height
        const popupWidth = 400;
        const popupHeight = Math.min(screenHeight, 1200); // 1200px or less

        console.log("Creating popup with dimensions:", {
          width: popupWidth,
          height: popupHeight,
        });

        chrome.windows.create(
          {
            url: "popup.html",
            type: "popup",
            width: popupWidth,
            height: popupHeight,
            left: screenWidth - popupWidth,
            top: 0,
            focused: true,
          },
          (win) => {
            sideWindow = win;
          }
        );
      } else {
        console.error("No displays found.");
      }
    });
  }
});

// Listen for the window closing to reset the sideWindow variable
chrome.windows.onRemoved.addListener((windowId) => {
  if (sideWindow && windowId === sideWindow.id) {
    sideWindow = null;
  }
});

// Listen for messages from content.js and popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "IMAGE_DROPPED") {
    // Store the dropped image URL and notify the popup window to load it
    draggedImageUrl = message.url;
    console.log("Stored dropped image URL:", draggedImageUrl);

    // Try to send the updated URL to any popup window that may be open
    chrome.runtime.sendMessage({ type: "UPDATE_IMAGE_URL", url: draggedImageUrl });
  }

  // Respond to popup.js to provide the stored dragged image URL on demand
  if (message.type === "GET_DRAGGED_IMAGE_URL") {
    sendResponse({ url: draggedImageUrl });
  }

  return true;
});
