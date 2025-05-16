import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DragAndDropComponent from "../../components/DragAndDrop/DragAndDrop";
import { Image } from "react-bootstrap";
import "./BOSWidget.css";
import Loader from "../../components/Loader/Loader";
import ReusableTable from "../../components/Table/Table";
import CardWithDragAndDrop from "../../components/Card/cardwithdraganddrop";
import {
  setDroppedObjectData,
  setIsDropped,
  setPlantObjectData,
} from "../../store/droppedObjectSlice";
import { getCardData, getTableData, tableColumns } from "./DocdataHelpers";
import useToast from "../../hooks/useToast";
import { MSG_CREATE_FAILURE, MSG_CREATE_SUCCESS } from "../../utils/toastMessages";
import useBOSDropableArea from "../../hooks/useBOSDropableArea";
import BOSWidgetToolbarNativeCta from "./DocWidgetToolbarNativeCta";
import { fetchData } from "../../utils/helpers";

const BOSWidget = () => {
  const { initializeDroppableArea, loading } = useBOSDropableArea();
  const [tableKey, setTableKey] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [screenLoader, setScreenLoader] = useState(false);
  const [isCardDataAvailable, setIsCardDataAvailable] = useState(false);
  const [specData, setSpecData] = useState([]);
  const [selectableRows, setSelectableRows] = useState([]);
  const dispatch = useDispatch();
  const { showSuccessToast, showErrorToast } = useToast();

  // Update table data when specData changes
  useEffect(() => {
    if (specData.length) {
      setTableData(specData.map((item) => ({ ...item, changedCells: {} })));
    }
  }, [specData]);

  // Handle document creation process
  const handleCreateDocument = async () => {
    console.log("Creating document with table data:", tableData);
    setScreenLoader(true);

    let parentData = [];
    let ChildNameKey, ChildRevKey, ChildStateKey, ChildIdKey;

    // Decide parent and child data keys based on the document type
    if (type === "Document") {
      parentData = {
        SpecName: droppedObjectData.cardData.Name,
        SpecRevision: droppedObjectData.cardData["Dropped Revision"],
        SpecState: droppedObjectData.cardData["Maturity State"],
        SpecID: droppedObjectData.cardData["ID"],
      };
      ChildNameKey = "ItemName";
      ChildRevKey = "ItemRevision";
      ChildStateKey = "ItemState";
      ChildIdKey = "ItemID";
    } else {
      parentData = {
        ItemName: droppedObjectData.cardData.Name,
        ItemRevision: droppedObjectData.cardData["Dropped Revision"],
        ItemState: droppedObjectData.cardData["Maturity State"],
        ItemID: droppedObjectData.cardData["ID"],
      };
      ChildNameKey = "SpecName";
      ChildRevKey = "SpecRevision";
      ChildStateKey = "SpecState";
      ChildIdKey = "SpecID";
    }

    // Format data for API
    const formattedData = tableData.map((item) => {
      const matchingData = bosSpecDocument.find(
        (data) => data.childTitle === item.Title && data.childRevision === item.Revision
      );

      return {
        [ChildNameKey]: matchingData ? matchingData.childName : null,
        [ChildRevKey]: item.Revision,
        [ChildStateKey]: matchingData ? matchingData.childState : null,
        [ChildIdKey]: matchingData ? matchingData.ID : null,
        ...parentData, 
        PrintOnPurchaseOrderRequired: item["Print On Purchase Order Required"],
        PrintOnWorkOrderRequired: item["Print On Work Order Required"],
        WorkOrderDocumentRequired: item["Work Order Document Required"],
        PrintOnReportOrderRequired: item["Print On report Order Required"],
        "SAP/JDE": item["SAP/JDE"],
      };
    });

    formattedData.sort((a, b) => {
      if (a.SpecName !== b.SpecName) {
        return a.SpecName.localeCompare(b.SpecName);
      }
      return Number(a.SpecRevision) - Number(b.SpecRevision);
    });

    // API URL for document creation
    const saveURL = "https://saasimplementationserverdev.azurewebsites.net/bosAttribute/createDocument";

    try {
      const response = await fetchData("POST", saveURL, formattedData);
      console.log("Response from document creation:", response);

      if (response.status === 200) {
        showSuccessToast(MSG_CREATE_SUCCESS);
        setSpecData(tableData);
      } else {
        showErrorToast(MSG_CREATE_FAILURE);
      }
    } catch (error) {
      showErrorToast(MSG_CREATE_FAILURE);
      console.error("Error creating document:", error);
    } finally {
      setScreenLoader(false);
    }
  };

  // Handle resetting of data when returning to home
  const handleHomeClick = () => {
    initializeDroppableArea(); // Reset the droppable area
    dispatch(setIsDropped(false));
    dispatch(setDroppedObjectData({ cardData: {}, parentDetails: [], versions: [], initialDraggedData: [] }));
    dispatch(setPlantObjectData({ allPlants: [], initialAssignedPlants: [], uniquePlants: [], productChildren: [], CAName: false, headers: {} }));
    setTableData([]); // Clear local table data
    setIsCardDataAvailable(false);
  };

  return (
    <>
      {screenLoader && (
        <div className="loading-overlay">
          <Loader />
          <p>Creating document...</p>
        </div>
      )}
      {!isDropped && !loading && !isTableLoading && <DragAndDropComponent />}
      {loading && <Loader />}
      {isDropped && (
        <>
          <div className="content-wrapper py-3 border-bottom">
            <div className="d-flex">
              <div className="p-0 pt-4">
                <Image
                  src="https://thewhitechamaleon.github.io/testrapp/images/home.png"
                  alt="home-icon"
                  className="home-icon"
                  onClick={handleHomeClick}
                />
              </div>
              {cardData && <CardWithDragAndDrop data={cardData} widgetType="bosWidget" />}
            </div>
          </div>

          {isTableLoading ? (
            <div className="loading-indicator mt-5">
              <Loader />
            </div>
          ) : (
            <div className="wrapper-cta">
              <BOSWidgetToolbarNativeCta
                onCreateDocument={handleCreateDocument}
                type={type}
                latestRevision={droppedObjectData?.cardData["Latest Revision"]}
                droppedRevision={droppedObjectData?.cardData["Dropped Revision"]}
                selectedRows={selectedTableRows}
                state={state}
                tableData={selectableRows}
              />
              <ReusableTable
                key={tableKey}
                data={tableData}
                columns={tableColumns}
                meta={{ updateTableData }}
                type={type}
                latestRevision={droppedObjectData?.cardData["Latest Revision"]}
                droppedRevision={droppedObjectData?.cardData["Dropped Revision"]}
                widgetType="Bos_Attribute_Widget"
                onSelectableRowsChange={setSelectableRows}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default BOSWidget;
