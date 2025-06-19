"use client";

import React, { useEffect, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const ImageViewerModal = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen) return;
      if (event.key === "ArrowLeft") {
        onNavigate(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        onNavigate(currentIndex + 1);
      } else if (event.key === "Escape") {
        onClose();
      }
    },
    [currentIndex, isOpen, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Reset loading state when current image changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[9999] flex items-center justify-center p-0 bg-transparent shadow-none border-none w-[90vw] h-[90vh] rounded-lg overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <DialogHeader className="absolute top-4 right-4 z-50">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <XMarkIcon className="h-8 w-8" />
          </button>
        </DialogHeader>

        <DialogDescription className="sr-only">
          Image viewer modal, use arrow keys to navigate images.
        </DialogDescription>

        <div className="relative w-full h-full flex items-center justify-center bg-gray-700">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-lg z-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <Image
            src={currentImage}
            alt={`Property image ${currentIndex + 1}`}
            layout="fill"
            objectFit="contain"
            className={`rounded-lg transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoadingComplete={() => setIsLoading(false)}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => onNavigate(currentIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 z-10"
                disabled={currentIndex === 0}
                aria-label="Previous image"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => onNavigate(currentIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 z-10"
                disabled={currentIndex === images.length - 1}
                aria-label="Next image"
              >
                <ArrowRightIcon className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg font-medium bg-black/50 px-3 py-1 rounded-full z-10">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerModal;
