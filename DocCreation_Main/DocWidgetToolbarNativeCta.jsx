import { useState } from "react";
import useToast from "../../hooks/useToast";
import { MSG_CREATE_FAILURE, MSG_CREATE_SUCCESS } from "../../utils/toastMessages";

const BOSWidgetToolbarNativeCta = ({
  onCreateDocument,
  selectedRows,
  tableData,
  type,
  latestRevision,
  droppedRevision,
}) => {
  const { showSuccessToast, showErrorToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDocumentClick = async () => {
    if (type !== "Document" && latestRevision !== droppedRevision) {
      // Show error if the type is not "Document" or revisions don't match
      showErrorToast(MSG_CREATE_FAILURE);
      return;
    }

    setIsLoading(true); // Set loading state to true while processing
    try {
      await onCreateDocument(); // Call document creation handler
      showSuccessToast(MSG_CREATE_SUCCESS); // Show success toast
    } catch (error) {
      console.error("Error while creating document:", error);
      showErrorToast(MSG_CREATE_FAILURE); // Show failure toast
    } finally {
      setIsLoading(false); // Set loading state to false after operation completes
    }
  };

  return (
    <div className="d-flex flex-column cta-absolute">
      <div className="d-flex">
        <button
          className="btn btn-outline-primary btn-lg m-2"
          onClick={handleCreateDocumentClick}
          disabled={isLoading}
          style={{
            cursor: isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: isLoading ? '#c6c6c6' : '', // Optional: Adjust button style when loading
          }}
        >
          {isLoading ? "Creating..." : "Create Document"}
        </button>
      </div>
    </div>
  );
};

export default BOSWidgetToolbarNativeCta;
