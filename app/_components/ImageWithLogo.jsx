import React, { useEffect, useRef } from "react";

const ImageWithLogo = ({
  imageUrl,
  logoUrl,
  logoPosition = "bottomRight",
  logoSize = 100,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const addLogoToImage = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Load the main image
      const mainImage = new Image();
      mainImage.crossOrigin = "anonymous";
      mainImage.src = imageUrl;

      // Load the logo
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = logoUrl;

      // Wait for both images to load
      await Promise.all([
        new Promise((resolve) => (mainImage.onload = resolve)),
        new Promise((resolve) => (logo.onload = resolve)),
      ]);

      // Set canvas size to match the main image
      canvas.width = mainImage.width;
      canvas.height = mainImage.height;

      // Draw the main image
      ctx.drawImage(mainImage, 0, 0);

      // Calculate logo position
      let logoX, logoY;
      const padding = 20; // Padding from edges

      switch (logoPosition) {
        case "topLeft":
          logoX = padding;
          logoY = padding;
          break;
        case "topRight":
          logoX = canvas.width - logoSize - padding;
          logoY = padding;
          break;
        case "bottomLeft":
          logoX = padding;
          logoY = canvas.height - logoSize - padding;
          break;
        case "bottomRight":
        default:
          logoX = canvas.width - logoSize - padding;
          logoY = canvas.height - logoSize - padding;
          break;
      }

      // Draw the logo
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    };

    if (imageUrl && logoUrl) {
      addLogoToImage();
    }
  }, [imageUrl, logoUrl, logoPosition, logoSize]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "image-with-logo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
        style={{ display: "none" }}
      />
      <img src={imageUrl} alt="Original" className="max-w-full h-auto" />
      <button
        onClick={handleDownload}
        className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Download with Logo
      </button>
    </div>
  );
};

export default ImageWithLogo;
