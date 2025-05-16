export const getCardData = (droppedObjectData) => {
  if (!droppedObjectData || !droppedObjectData.cardData) {
    console.warn("No cardData found in droppedObjectData.");  // You could log a warning if data is missing
    return null;
  }

  const item = droppedObjectData.cardData;

  return {
    name: item.Name || "N/A",  // Changed Title to name
    title: item.Title || "N/A", // title remains
    policy: item.Policy || "N/A", // Added policy
    state: item.State || "IN_WORK", // Default state as "IN_WORK"
    description: item.Description || "N/A", // description remains
    collabspace: item["Collaborative Space Title"] || "Micro Motion", // Default "Micro Motion"
    imageURL: item.imageURL || "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/snresources/images/icons/large/I_VPMNavProduct108x144.png", // Placeholder image URL
  };
};

export const getTableData = (bosData) => {
  if (!bosData) {
    console.warn("No bosData provided.");
    return [];
  }

  return bosData.map((data) => ({
    name: data?.childName || "N/A", // Added name instead of Title
    title: data?.childTitle || "N/A", // title remains
    policy: data?.childPolicy || "N/A", // Added policy
    state: data?.childState || "IN_WORK", // Default state as "IN_WORK"
    description: data?.childDescription || "N/A", // Added description
    collabspace: data?.childCollabSpace || "Micro Motion", // Default "Micro Motion"
  }));
};
