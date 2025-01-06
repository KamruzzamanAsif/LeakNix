'use client';
// React Grid Logic
import React, { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

// Theme
import type {
  ColDef,
  RowSelectionOptions,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
// Core CSS
import type { CustomCellRendererProps } from "ag-grid-react";
import { AgGridReact } from "ag-grid-react";

import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  RowGroupingModule,
  SetFilterModule,
} from "ag-grid-enterprise";

ModuleRegistry.registerModules([
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  RowGroupingModule,
  SetFilterModule,
]);

ModuleRegistry.registerModules([AllCommunityModule]);

import './AGgrid.css';

const AGgrid = ({
  objectsData,
  eventListenerData,
  domNodesData,
  collectionsData,
}: {
  objectsData: any[];
  eventListenerData: any[];
  domNodesData: any[];
  collectionsData: any[];
}) => {
  // Combine data into a unified table format
  const rowData = useMemo(() => {
    const objects = objectsData.map((obj) => ({
      test: obj.test,
      category: "Objects",
      type: obj.type,
      addedCount: obj.addedCount,
      retainedSize: obj.retainedSize,
    }));

    const eventListeners = eventListenerData.map((listener) => ({
      test: listener.test,
      category: "Event Listeners",
      type: listener.type,
      addedCount: listener.addedCount,
      retainedSize: 'N/A',
      details: 'Leaking Nodes: ' + listener.nodes
    }));

    const domNodes = domNodesData.map((node) => ({
      test: node.test,
      category: "DOM Nodes",
      type: 'N/A',
      addedCount: node.addedCount,
      retainedSize: 'N/A',
      details: node.type
    }));

    const collections = collectionsData.map((collection) => ({
      test: collection.test,
      category: "Collections",
      type: collection.type,
      addedCount: collection.addedCount,
      retainedSize: 'N/A',
      details: 'Preview: ' + collection.preview + '\n' + "Size Increased At: " + collection.sizeIncreasedAt,
    }));

    return [...objects, ...eventListeners, ...domNodes, ...collections];
  }, [objectsData, eventListenerData, domNodesData, collectionsData]);

  // Define columns
  const colDefs: ColDef[] = useMemo(() => {
    return [
      { field: "test", headerName: "Test", width: 100 },
      { field: "category", headerName: "Category", width: 150 },
      { field: "type", headerName: "Type/Name", width: 250 },
      { field: "addedCount", headerName: "Delta", width: 150 },
      { field: "retainedSize", headerName: "Retained Size", width: 150 },
      { field: "details", headerName: "Details", width: 200 },
    ];
  }, []);

  // Default column definitions
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      sortable: true,
      resizable: true,
      autoHeight: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.5' }, // CSS for wrapping
    };
  }, []);

  return (
    <div className="ag-theme-my-theme" style={{ width: "100%", height: "70vh" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        rowSelection="single"
        onSelectionChanged={(event) => console.log("Row Selected:", event.api.getSelectedRows())}
        onCellValueChanged={(event) =>
          console.log(`New Cell Value: ${event.value}`)
        }
        sideBar={true}
      />
    </div>
  );
};

export default AGgrid;
