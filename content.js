// content.js

// Create the floating icon element if it doesn't already exist
if (!document.getElementById("floatingIcon")) {
    const floatingIcon = document.createElement("img");
    floatingIcon.src = chrome.runtime.getURL("icon.png");
    floatingIcon.id = "floatingIcon";
    floatingIcon.style.position = "fixed";
    floatingIcon.style.bottom = "20px";
    floatingIcon.style.right = "20px";
    floatingIcon.style.width = "50px";
    floatingIcon.style.height = "50px";
    floatingIcon.style.borderRadius = "50%"; // Makes the icon circular
    floatingIcon.style.overflow = "hidden"; // Ensures the image is clipped within the circle
    floatingIcon.style.cursor = "pointer";
    floatingIcon.style.zIndex = "1000";
    floatingIcon.style.border = "2px solid #fff"; // Optional: Adds a white border around the circle for styling
    floatingIcon.style.boxShadow = "2px 2px 15px 0px rgba(0, 0, 0, 0.25)"; // Adds drop shadow

    // Add the floating icon to the body
    document.body.appendChild(floatingIcon);

    // Handle click event to open the popup
    floatingIcon.addEventListener("click", () => {
        // Check if a popup window is already open and close it if so
        const existingPopup = document.getElementById("popupContainer");
        if (existingPopup) {
            existingPopup.remove();
        } else {
            openPopup();
        }
    });
}


function openPopup() {
    // Create the popup container
    const popupContainer = document.createElement("div");
    popupContainer.id = "popupContainer";
    popupContainer.style.position = "fixed";
    popupContainer.style.width = "400px";
    popupContainer.style.height = "600px";
    popupContainer.style.bottom = "80px";
    popupContainer.style.right = "20px";
    popupContainer.style.backgroundColor = "#ffffff";
    popupContainer.style.border = "1px solid #ddd";
    popupContainer.style.borderRadius = "8px";
    popupContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    popupContainer.style.zIndex = "1000";
    popupContainer.style.overflow = "hidden";

    // Create an iframe to load popup.html
    const popupIframe = document.createElement("iframe");
    popupIframe.src = chrome.runtime.getURL("popup.html");
    popupIframe.style.width = "100%";
    popupIframe.style.height = "100%";
    popupIframe.style.border = "none";

    // Add iframe to the popup container
    popupContainer.appendChild(popupIframe);

    // Add a close button to the popup
    const closeButton = document.createElement("button");
    closeButton.innerText = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "5px";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "18px";
    closeButton.style.color = "#888";
    closeButton.addEventListener("click", () => {
        popupContainer.remove();
    });

    // Add the close button to the popup container
    popupContainer.appendChild(closeButton);

    // Append the popup container to the body
    document.body.appendChild(popupContainer);
}

// Listen for dragstart events to detect when an image is dragged
document.addEventListener("dragstart", (event) => {
    const draggedElement = event.target;

    // Check if the dragged element is an image
    if (draggedElement.tagName === "IMG" && draggedElement.src) {
        const imageUrl = draggedElement.src;
        console.log("Image dragged with URL:", imageUrl);

        // Send the base64 data URL or the image URL to popup.js
        chrome.runtime.sendMessage({ type: "IMAGE_DROPPED", url: imageUrl });
    }
});

// Listen for drop events, but only if it occurs within the popup container
document.addEventListener("drop", (event) => {
    const popupContainer = document.getElementById("popupContainer");
    if (popupContainer && popupContainer.contains(event.target)) {
        event.preventDefault();
        const dataTransfer = event.dataTransfer;

        // Check if there's an image URL in the drop data
        const imageUrl = dataTransfer.getData("text/uri-list") || dataTransfer.getData("text/plain");

        if (imageUrl && imageUrl.startsWith("data:image")) {
            console.log("Image dropped with base64 data URL inside popup:", imageUrl);

            // Send the base64 data URL to the background script for further processing
            chrome.runtime.sendMessage({ type: "IMAGE_DROPPED", url: imageUrl });
        }
    }
}, false);
