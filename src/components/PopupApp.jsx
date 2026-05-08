import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, Chip } from "@mui/material";
import SharedFolderSettings from "./settings/SharedFolderSettings";

const DATA_TYPE_LABELS = {
  medication: "西藥",
  labData: "檢驗",
  chineseMed: "中藥",
  imaging: "影像",
  allergy: "過敏",
  surgery: "手術",
  discharge: "出院",
  medDays: "餘藥",
  patientSummary: "摘要",
};

function DataStatusRow({ status }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
      {Object.entries(DATA_TYPE_LABELS).map(([key, label]) => {
        const entry = status[key];
        const fetched = entry?.status === "fetched";
        return (
          <Chip
            key={key}
            label={fetched ? `${label} ${entry.count}` : label}
            color={fetched ? "success" : "default"}
            variant={fetched ? "filled" : "outlined"}
            size="small"
          />
        );
      })}
    </Box>
  );
}

export default function PopupApp() {
  const [status, setStatus] = useState({});

  useEffect(() => {
    const refresh = () => {
      chrome.runtime.sendMessage({ action: "getDataStatus" }, (resp) => {
        if (chrome.runtime.lastError) return;
        if (resp?.dataStatus) setStatus(resp.dataStatus);
      });
    };
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          NHITW 診所讀取器
        </Typography>
        <Typography variant="caption" color="text.secondary">
          自動匯出健保雲端病患報告 HTML
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          目前病患資料
        </Typography>
        <DataStatusRow status={status} />
      </Box>

      <Divider />

      <SharedFolderSettings />
    </Box>
  );
}
