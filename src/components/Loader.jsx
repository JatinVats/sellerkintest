import React from "react";
import "../styles/loader.css";

const Loader = () => {
  return (
    <div className="loader-wrapper flex gap-4 w-fit absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
      {/* animation-delay added in global.css */}
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Loader;
