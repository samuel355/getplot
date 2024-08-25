import { MarkerF, OverlayView } from "@react-google-maps/api";
import React, { useState } from "react";
import MarkerListingItem from "./MarkerListingItem";

const MarkerItem = ({ item, closeHandler, images }) => {
  const [selectedListing, setSelectedListing] = useState();
  return (
    <div className="w-full">
      <MarkerF
        onClick={() => setSelectedListing(item)}
        position={item?.coordinates}
        icon={{
          url: "/location-house-pin.png",
          scaledSize: {
            width: 40,
            height: 55,
          },
        }}
      >
        {selectedListing && (
          <OverlayView
            position={selectedListing.coordinates}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <MarkerListingItem closeHandler={() => setSelectedListing(null)}  item={item} images ={images} />
          </OverlayView>
        )}
      </MarkerF>
    </div>
  );
};

export default MarkerItem;
