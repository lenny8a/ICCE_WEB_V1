"use client"

import PickingPage from "./PickingPage";

// This component now simply re-exports PickingPage.
// This is often done if the original file location is important for routing or other framework conventions,
// but the actual logic has been moved to a new, potentially better-named or better-organized file.
const Picking = () => {
  return <PickingPage />;
};

export default Picking;
