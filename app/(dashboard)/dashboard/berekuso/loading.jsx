import { Loader } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <Loader className="animate-spin" />
    </div>
  );
};

export default Loading;
