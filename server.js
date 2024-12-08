import express from "express";
import multer from "multer";
import cors from "cors";
import fetch from "node-fetch"; // Import using ES module syntax

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

// Endpoint to handle image processing
app.post("/process-image", upload.single("image"), (req, res) => {
  const mockPercentage = Math.floor(Math.random() * 100);
  res.json({ percentage: mockPercentage });
});

// Proxy endpoint to fetch images from external URLs
app.get("/proxy-image", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send("URL parameter is required");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image from URL");

    const contentType = response.headers.get("content-type");
    res.set("Content-Type", contentType);
    response.body.pipe(res);
  } catch (error) {
    console.error("Error fetching image from URL:", error);
    res.status(500).send("Could not fetch image from the specified URL");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
