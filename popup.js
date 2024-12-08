document.addEventListener("DOMContentLoaded", async function () {
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    const uploadArea = document.getElementById("uploadArea");
    const processButton = document.getElementById("processButton");
    const resultContainer = document.getElementById("resultContainer");
    let selectedFile = null;

    console.log("Popup loaded with copy-paste, drag-and-drop, and real-time background message functionality.");

    // Retrieve and display the initial dragged image URL from the background script when the popup loads
    const initialDraggedImageUrl = await getDraggedImageUrl();
    if (initialDraggedImageUrl) {
        console.log("Displaying initial dragged image URL in popup:", initialDraggedImageUrl);
        await fetchAndSetFileFromUrl(initialDraggedImageUrl);
    }

    // Listen for updates to the dragged image URL from the background script in real-time
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "UPDATE_IMAGE_URL" && message.url) {
            console.log("Received updated image URL:", message.url);
            fetchAndSetFileFromUrl(message.url); // Process URL as an image file
        }
    });

    // Function to request the dragged image URL from the background script
    async function getDraggedImageUrl() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "GET_DRAGGED_IMAGE_URL" }, (response) => {
                resolve(response?.url || null);
            });
        });
    }

    // Listen for paste events to handle images copied from the clipboard
    document.addEventListener("paste", (e) => {
        console.log("Paste event detected.");
        const items = e.clipboardData.items;

        for (let item of items) {
            if (item.type.startsWith("image/")) {
                console.log("Image detected in clipboard.");
                const blob = item.getAsFile();
                selectedFile = blob;
                displayImagePreview(blob);
                break;
            }
        }
    });


    // Event listener for the "Browse" link to open file dialog
browseLink.addEventListener("click", () => {
    fileInput.click();
});

// Handle file selection through the file input dialog
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log("File selected from file input.");
        handleFile(file);
    }
});


    // Drag-and-drop functionality specifically for the upload area
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("drag-over");
        console.log("Dragover event detected on upload area.");
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("drag-over");
        console.log("Dragleave event detected on upload area.");
    });

    uploadArea.addEventListener("drop", async (e) => {
        e.preventDefault();
        uploadArea.classList.remove("drag-over");
        console.log("Drop event detected on upload area.");

        const droppedFiles = e.dataTransfer.files;

        if (droppedFiles && droppedFiles.length > 0) {
            console.log("Local file dropped.");
            handleFile(droppedFiles[0]);
        } else {
            console.log("No local files detected. Checking for latest dragged URL from background script.");

            const imageUrl = await getDraggedImageUrl();
            if (imageUrl) {
                await fetchAndSetFileFromUrl(imageUrl);
            } else {
                console.warn("No valid image URL found in background storage.");
                alert("Please drag an image from a browser tab to this area.");
            }
        }
    });

    // Unified function to fetch image from URL, convert to blob, and set as selected file
    async function fetchAndSetFileFromUrl(url) {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error("Failed to fetch image from URL");

            const blob = await response.blob();
            selectedFile = blob; // Set blob as selected file
            displayImagePreview(blob);
        } catch (error) {
            console.error("Error fetching image from URL:", error);
            alert("Could not load image from the URL.");
        }
    }

    // Function to handle local file and display it in the preview area
    function handleFile(file) {
        if (!file || !file.type.startsWith("image/")) {
            console.warn("Invalid file type. Please upload an image.");
            alert("Please upload a valid image file.");
            return;
        }
        console.log("Valid image file detected:", file.name);
        selectedFile = file;
        displayImagePreview(file);
    }

    // Function to display the image preview from a file blob
    function displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log("Displaying image preview.");
            imagePreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
        };
        reader.readAsDataURL(file);
    }

    // Event listener for the "Upload & Process Image" button
    // Event listener for the "Upload & Process Image" button
    // Event listener for the "Upload & Process Image" button
    processButton.addEventListener("click", async () => {
        console.log("Process button clicked.");
        if (!selectedFile) {
            console.warn("No image selected for upload.");
            alert("Please select an image first.");
            return;
        }

        processButton.disabled = true;
        processButton.textContent = "Processing...";

        const apiUrl = "https://api.sightengine.com/1.0/check.json"; // API endpoint
        const apiUser = "1535511442"; // Replace with your API user
        const apiSecret = "uuKtF3qAMUSn7HxEohx3mQpWzTJMXevJ"; // Replace with your API secret

        try {
            const formData = new FormData();
            formData.append("media", selectedFile); // Add the selected file
            formData.append("models", "genai"); // Specify the model
            formData.append("api_user", apiUser); // Add API user
            formData.append("api_secret", apiSecret); // Add API secret

            console.log("Sending image to the API...");
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            // Log raw response
            console.log("Raw API Response:", response);

            if (!response.ok) {
                throw new Error("Image processing failed.");
            }

            const result = await response.json();
            
            // Log parsed JSON response
            console.log("Parsed JSON Response:", result);

            // Extract AI-generated score
            const aiGeneratedScore = result.type.ai_generated;
            const percentage = Math.round(aiGeneratedScore * 100); // Convert score to percentage

            // Call the animateGauge function to display the percentage
            animateGauge(percentage);
        } catch (error) {
            console.error("Error processing image:", error);
            alert("Error processing image: " + error.message);
        } finally {
            processButton.disabled = false;
            processButton.textContent = "Upload & Process Image";
        }
    });


    

    // Function to animate the gauge and percentage counter
    function animateGauge(percentage) {
        resultContainer.innerHTML = `
            <div style="position: relative; width: 200px; height: 200px; margin: 0 auto;">
                <canvas id="gaugeCanvas" width="200" height="200"></canvas>
                <div id="percentageDisplay" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 36px;
                    font-weight: bold;
                    color: black;
                ">0%</div>
            </div>
            <p style="margin-top: 20px; font-size: 16px; font-weight: bold; text-align: center;">
                This input is likely to be: <span id="likelihoodLabel"></span>
            </p>
            <p id="additionalInfo" style="margin-top: 10px; font-size: 14px; text-align: center; color: #555;"></p>
        `;
    
        const canvas = document.getElementById("gaugeCanvas");
        const context = canvas.getContext("2d");
        const percentageDisplay = document.getElementById("percentageDisplay");
        const likelihoodLabel = document.getElementById("likelihoodLabel");
        const additionalInfo = document.getElementById("additionalInfo");
    
        let currentPercentage = 0;
        const targetPercentage = percentage;
        const isAI = targetPercentage >= 50;
        const color = isAI ? "red" : "green";
    
        likelihoodLabel.textContent = isAI ? "AI-Generated Image" : "Not AI-Generated image";
        likelihoodLabel.style.color = color;
    
        // Set the additional information text
        additionalInfo.textContent = isAI
            ? "Please consider that this may pose a risk of being a fraudulent listing. Contact the agent for further information."
            : "Please consider that this might either be a rendered image or a real image.";
    
        function drawGauge(currentPercentage) {
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (currentPercentage / 100) * 2 * Math.PI;
    
            // Clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
    
            // Background circle
            context.beginPath();
            context.arc(100, 100, 80, 0, 2 * Math.PI);
            context.strokeStyle = "#e0e0e0";
            context.lineWidth = 20;
            context.stroke();
    
            // Foreground arc (progress)
            context.beginPath();
            context.arc(100, 100, 80, startAngle, endAngle);
            context.strokeStyle = color;
            context.lineWidth = 20;
            context.stroke();
        }
    
        function animate() {
            if (currentPercentage <= targetPercentage) {
                drawGauge(currentPercentage);
                percentageDisplay.textContent = `${currentPercentage}%`;
                currentPercentage++;
                requestAnimationFrame(animate);
            } else {
                percentageDisplay.textContent = `${targetPercentage}%`; // Final display
            }
        }
    
        animate();
    }
    
});
