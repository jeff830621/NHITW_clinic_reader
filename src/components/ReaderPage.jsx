import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import MedicationIcon from "@mui/icons-material/Medication";
import GrassIcon from "@mui/icons-material/Grass";
import ScienceIcon from "@mui/icons-material/Science";
import ImageIcon from "@mui/icons-material/Image";
import InventoryIcon from "@mui/icons-material/Inventory";
import TableChartIcon from "@mui/icons-material/TableChart";
import TableViewIcon from "@mui/icons-material/TableView";

import TabPanel from "./tabs/TabPanel";
import Overview from "./tabs/Overview";
import MedicationList from "./tabs/MedicationList";
import MedicationTable from "./tabs/MedicationTable";
import ChineseMedicine from "./tabs/ChineseMedicine";
import LabData from "./tabs/LabData";
import LabTableView from "./tabs/LabTableView";
import ImagingData from "./tabs/ImagingData";
import MedDaysData from "./tabs/MedDaysData";

import { collectDataSources, handleAllData } from "../utils/dataManager";
import { loadAllSettings } from "../utils/settingsManager";
import { DEFAULT_SETTINGS } from "../config/defaultSettings";
import { getTabColor, getTabSelectedColor } from "../utils/tabColorUtils";
import { CONTENT_TEXT_SIZES } from "../utils/textSizeUtils";

// Helper to communicate with background.js
function sendMessage(action, params = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, ...params }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ReaderPage = () => {
  const today = formatDate(new Date());

  // Host / loading state
  const [hostAvailable, setHostAvailable] = useState(null); // null = checking
  const [hostError, setHostError] = useState("");

  // Manifest / patient list
  const [selectedDate, setSelectedDate] = useState(today);
  const [patientList, setPatientList] = useState([]);
  const [manifestLoading, setManifestLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searchLoading, setSearchLoading] = useState(false);

  // Selected patient
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Data state (mirrors FloatingIcon exactly)
  const [groupedMedications, setGroupedMedications] = useState([]);
  const [groupedLabs, setGroupedLabs] = useState([]);
  const [groupedChineseMeds, setGroupedChineseMeds] = useState([]);
  const [imagingData, setImagingData] = useState({ withReport: [], withoutReport: [] });
  const [allergyData, setAllergyData] = useState([]);
  const [surgeryData, setSurgeryData] = useState([]);
  const [dischargeData, setDischargeData] = useState([]);
  const [medDaysData, setMedDaysData] = useState([]);
  const [patientSummaryData, setPatientSummaryData] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    visitCount: 0,
    diagnoses: [],
    recentMedications: { western: [], chinese: [] },
    labSummary: {},
  });
  const [adultHealthCheckData, setAdultHealthCheckData] = useState(null);
  const [cancerScreeningData, setCancerScreeningData] = useState(null);
  const [hbcvData, setHbcvData] = useState(null);
  const [generalDisplaySettings, setGeneralDisplaySettings] = useState(DEFAULT_SETTINGS.general);
  const [appSettings, setAppSettings] = useState({
    western: DEFAULT_SETTINGS.western,
    atc5: DEFAULT_SETTINGS.atc5,
    chinese: DEFAULT_SETTINGS.chinese,
    lab: DEFAULT_SETTINGS.lab,
    overview: DEFAULT_SETTINGS.overview,
    display: DEFAULT_SETTINGS.display,
  });

  // Load settings on mount
  useEffect(() => {
    const initSettings = async () => {
      try {
        const allSettings = await loadAllSettings();
        setAppSettings({
          western: allSettings.western,
          atc5: allSettings.atc5,
          chinese: allSettings.chinese,
          lab: allSettings.lab,
          overview: allSettings.overview,
          display: allSettings.display,
          cloud: allSettings.cloud,
        });
        setGeneralDisplaySettings(allSettings.general);
      } catch (e) {
        // Fall back to defaults silently
      }
    };
    initSettings();
  }, []);

  // Check host status on mount
  useEffect(() => {
    const checkHost = async () => {
      try {
        const response = await sendMessage("checkHostStatus");
        if (response && response.success) {
          setHostAvailable(true);
        } else {
          setHostAvailable(false);
          setHostError(response?.error || "無法連線至本機代理程式");
        }
      } catch (e) {
        setHostAvailable(false);
        setHostError(e.message || "無法連線至本機代理程式");
      }
    };
    checkHost();
  }, []);

  // Load manifest when host is available or date changes
  const loadManifest = useCallback(async () => {
    if (!hostAvailable) return;
    setManifestLoading(true);
    setPatientList([]);
    try {
      const response = await sendMessage("readManifest", { date: selectedDate });
      if (response && response.success && Array.isArray(response.data)) {
        setPatientList(response.data);
      } else {
        setPatientList([]);
      }
    } catch (e) {
      setPatientList([]);
    } finally {
      setManifestLoading(false);
    }
  }, [hostAvailable, selectedDate]);

  useEffect(() => {
    if (hostAvailable) {
      loadManifest();
    }
  }, [hostAvailable, loadManifest]);

  // Reset patient data state
  const resetPatientData = () => {
    setGroupedMedications([]);
    setGroupedLabs([]);
    setGroupedChineseMeds([]);
    setImagingData({ withReport: [], withoutReport: [] });
    setAllergyData([]);
    setSurgeryData([]);
    setDischargeData([]);
    setMedDaysData([]);
    setPatientSummaryData([]);
    setDashboardData({
      visitCount: 0,
      diagnoses: [],
      recentMedications: { western: [], chinese: [] },
      labSummary: {},
    });
    setAdultHealthCheckData(null);
    setCancerScreeningData(null);
    setHbcvData(null);
  };

  // Load patient data
  const loadPatient = async (patient) => {
    setSelectedPatient(patient);
    setTabValue(0);
    setPatientLoading(true);
    resetPatientData();

    try {
      const response = await sendMessage("readPatient", {
        filename: patient.filename,
        date: selectedDate,
      });

      if (response && response.success && response.data) {
        const data = response.data;

        // Set window variables for collectDataSources
        window.lastInterceptedMedicationData = data.medicationData || null;
        window.lastInterceptedLabData = data.labData || null;
        window.lastInterceptedChineseMedData = data.chinesemedData || null;
        window.lastInterceptedImagingData = data.imagingData || null;
        window.lastInterceptedAllergyData = data.allergyData || null;
        window.lastInterceptedSurgeryData = data.surgeryData || null;
        window.lastInterceptedDischargeData = data.dischargeData || null;
        window.lastInterceptedMedDaysData = data.medDaysData || null;
        window.lastInterceptedPatientSummaryData = data.patientSummaryData || null;

        const dataSources = collectDataSources();
        const setters = {
          setGroupedMedications,
          setGroupedLabs,
          setGroupedChineseMeds,
          setImagingData,
          setAllergyData,
          setSurgeryData,
          setDischargeData,
          setMedDaysData,
          setPatientSummaryData,
          setDashboardData,
          setAdultHealthCheckData,
          setCancerScreeningData,
          setHbcvData,
        };
        await handleAllData(dataSources, appSettings, setters);
      }
    } catch (e) {
      // Patient data failed to load — keep empty state
    } finally {
      setPatientLoading(false);
    }
  };

  // Search handler
  const handleSearch = async (query) => {
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    setSearchResults(null);
    try {
      const response = await sendMessage("searchPatient", { query: q });
      if (response && response.success && Array.isArray(response.data)) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  // Display list: search results when searching, otherwise today's manifest
  const displayList = searchResults !== null ? searchResults : patientList;

  const tabContentFontSize =
    (generalDisplaySettings?.contentTextSize &&
      CONTENT_TEXT_SIZES[generalDisplaySettings.contentTextSize]) ||
    CONTENT_TEXT_SIZES["medium"];

  // ── Host not available ──────────────────────────────────────────────────────
  if (hostAvailable === false) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          無法連線至本機代理程式
        </Alert>
        <Typography variant="h6" gutterBottom>
          安裝步驟
        </Typography>
        <Typography component="ol" variant="body2" sx={{ pl: 2 }}>
          <li>請確認已安裝 nhitw-clinic-reader 本機代理程式（Native Host）</li>
          <li>於終端機執行安裝腳本以註冊 Native Messaging Host</li>
          <li>重新啟動 Chrome 瀏覽器後再試</li>
          <li>
            若問題持續，請確認 <code>com.nhitw.clinic_reader</code> manifest 已正確安裝至系統路徑
          </li>
        </Typography>
        {hostError && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            錯誤訊息：{hostError}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Checking host ───────────────────────────────────────────────────────────
  if (hostAvailable === null) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>連線中...</Typography>
      </Box>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* AppBar */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mr: 1, whiteSpace: "nowrap" }}>
            診間閱讀器
          </Typography>

          {/* Date picker */}
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "white", fontSize: "0.85rem", py: "4px" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
            }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Search box */}
          <TextField
            size="small"
            placeholder="搜尋病患姓名/ID"
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleSearchKeyDown}
            sx={{
              flex: 1,
              maxWidth: 280,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "white", fontSize: "0.85rem", py: "4px" },
              "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.7)" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
            }}
          />

          {/* Reload button */}
          <IconButton
            color="inherit"
            onClick={loadManifest}
            disabled={manifestLoading}
            size="small"
            title="重新載入"
          >
            <RefreshIcon />
          </IconButton>

          {/* Patient count */}
          <Typography variant="body2" sx={{ whiteSpace: "nowrap", opacity: 0.85 }}>
            {searchResults !== null
              ? `${displayList.length} 筆結果`
              : `${patientList.length} 位病患`}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main content: left panel + right panel */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left panel — patient list */}
        <Box
          sx={{
            width: 280,
            minWidth: 280,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {manifestLoading || searchLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : displayList.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {searchResults !== null ? "找不到符合的病患" : "今日無病患資料"}
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding sx={{ overflowY: "auto", flex: 1 }}>
              {displayList.map((patient, idx) => {
                const isSelected = selectedPatient && selectedPatient.filename === patient.filename;
                return (
                  <React.Fragment key={patient.filename || idx}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => loadPatient(patient)}
                        sx={{
                          py: 1,
                          "&.Mui-selected": {
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            "& .MuiListItemText-secondary": { color: "inherit", opacity: 0.8 },
                          },
                        }}
                      >
                        <ListItemText
                          primary={patient.name || patient.patientName || "未知姓名"}
                          secondary={patient.id || patient.patientId || ""}
                          primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: isSelected ? "bold" : "normal" }}
                          secondaryTypographyProps={{ fontSize: "0.75rem" }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>

        {/* Right panel — patient data */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {patientLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>載入病患資料中...</Typography>
            </Box>
          ) : !selectedPatient ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">請從左側選擇病患</Typography>
            </Box>
          ) : (
            <>
              {/* Patient header */}
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: "bold", mr: 1 }}>
                  {selectedPatient.name || selectedPatient.patientName || "未知姓名"}
                </Typography>
                <Typography variant="body2" component="span" color="text.secondary">
                  {selectedPatient.id || selectedPatient.patientId || ""}
                </Typography>
              </Box>

              {/* Tabs */}
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: "40px",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    minHeight: "36px",
                    padding: "6px 12px",
                    fontSize: tabContentFontSize,
                    fontWeight: "medium",
                    "&.Mui-selected": { fontWeight: "bold" },
                  },
                }}
              >
                <Tab
                  label="總覽"
                  icon={<HomeIcon sx={{ fontSize: "1rem" }} />}
                  iconPosition="start"
                  sx={{
                    padding: "6px 10px",
                    color: getTabColor(generalDisplaySettings, "overview"),
                    "&.Mui-selected": { color: getTabSelectedColor(generalDisplaySettings, "overview") },
                  }}
                />
                <Tab
                  label={`西藥 (${groupedMedications.length})`}
                  icon={<MedicationIcon sx={{ fontSize: "1rem" }} />}
                  iconPosition="start"
                  sx={{
                    padding: "6px 10px",
                    color: groupedMedications.length > 0 ? getTabColor(generalDisplaySettings, "medication") : "#9e9e9e",
                    "&.Mui-selected": {
                      color: groupedMedications.length > 0 ? getTabSelectedColor(generalDisplaySettings, "medication") : "#616161",
                    },
                  }}
                />
                <Tab
                  icon={<TableChartIcon sx={{ fontSize: "1.125rem" }} />}
                  aria-label="西藥表格檢視"
                  sx={{
                    minWidth: "60px",
                    padding: "6px 6px",
                    color: groupedMedications.length > 0 ? getTabColor(generalDisplaySettings, "medication") : "#9e9e9e",
                    "&.Mui-selected": {
                      color: groupedMedications.length > 0 ? getTabSelectedColor(generalDisplaySettings, "medication") : "#616161",
                    },
                  }}
                />
                <Tab
                  label={`中藥 (${groupedChineseMeds.length})`}
                  icon={<GrassIcon sx={{ fontSize: "1rem" }} />}
                  iconPosition="start"
                  sx={{
                    padding: "6px 10px",
                    color: groupedChineseMeds.length > 0 ? getTabColor(generalDisplaySettings, "chineseMed") : "#9e9e9e",
                    "&.Mui-selected": {
                      color: groupedChineseMeds.length > 0 ? getTabSelectedColor(generalDisplaySettings, "chineseMed") : "#616161",
                    },
                  }}
                />
                <Tab
                  label={`檢驗 (${groupedLabs.length})`}
                  icon={<ScienceIcon sx={{ fontSize: "1rem" }} />}
                  iconPosition="start"
                  sx={{
                    padding: "6px 10px",
                    color: groupedLabs.length > 0 ? getTabColor(generalDisplaySettings, "lab") : "#9e9e9e",
                    "&.Mui-selected": {
                      color: groupedLabs.length > 0 ? getTabSelectedColor(generalDisplaySettings, "lab") : "#616161",
                    },
                  }}
                />
                <Tab
                  icon={<TableViewIcon sx={{ fontSize: "1.125rem" }} />}
                  aria-label="檢驗表格檢視"
                  sx={{
                    minWidth: "60px",
                    padding: "6px 6px",
                    color: groupedLabs.length > 0 ? getTabColor(generalDisplaySettings, "lab") : "#9e9e9e",
                    "&.Mui-selected": {
                      color: groupedLabs.length > 0 ? getTabSelectedColor(generalDisplaySettings, "lab") : "#616161",
                    },
                  }}
                />
                <Tab
                  label={`影像 (${imagingData.withReport.length + imagingData.withoutReport.length})`}
                  icon={<ImageIcon sx={{ fontSize: "1rem" }} />}
                  iconPosition="start"
                  sx={{
                    padding: "6px 10px",
                    color:
                      imagingData.withReport.length + imagingData.withoutReport.length > 0
                        ? getTabColor(generalDisplaySettings, "imaging")
                        : "#9e9e9e",
                    "&.Mui-selected": {
                      color:
                        imagingData.withReport.length + imagingData.withoutReport.length > 0
                          ? getTabSelectedColor(generalDisplaySettings, "imaging")
                          : "#616161",
                    },
                  }}
                />
                <Tab
                  label={`餘藥 (${medDaysData.length})`}
                  icon={<InventoryIcon sx={{ fontSize: "1rem" }} />}
                  iconPosition="start"
                  sx={{
                    padding: "6px 10px",
                    color: medDaysData.length > 0 ? getTabColor(generalDisplaySettings, "medDays") : "#9e9e9e",
                    "&.Mui-selected": {
                      color: medDaysData.length > 0 ? getTabSelectedColor(generalDisplaySettings, "medDays") : "#616161",
                    },
                  }}
                />
              </Tabs>

              {/* Tab content area */}
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                <TabPanel value={tabValue} index={0}>
                  <Overview
                    dashboardData={dashboardData}
                    allergyData={allergyData}
                    surgeryData={surgeryData}
                    dischargeData={dischargeData}
                    patientSummaryData={patientSummaryData}
                    groupedMedications={groupedMedications}
                    groupedChineseMeds={groupedChineseMeds}
                    groupedLabs={groupedLabs}
                    labData={groupedLabs}
                    imagingData={imagingData}
                    settings={{
                      ...appSettings.western,
                      enableATC5Colors: appSettings.atc5.enableColors,
                      atc5Groups: appSettings.atc5.groups,
                      atc5ColorGroups: appSettings.atc5.colorGroups,
                    }}
                    overviewSettings={appSettings.overview}
                    generalDisplaySettings={generalDisplaySettings}
                    labSettings={appSettings.lab}
                    cloudSettings={appSettings.cloud}
                    adultHealthCheckData={adultHealthCheckData}
                    cancerScreeningData={cancerScreeningData}
                    hbcvData={hbcvData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <MedicationList
                    groupedMedications={groupedMedications}
                    settings={{
                      ...appSettings.western,
                      enableATC5Colors: appSettings.atc5.enableColors,
                      atc5Groups: appSettings.atc5.groups,
                      atc5ColorGroups: appSettings.atc5.colorGroups,
                    }}
                    copyFormat={appSettings.western.medicationCopyFormat}
                    generalDisplaySettings={generalDisplaySettings}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <MedicationTable
                    groupedMedications={groupedMedications}
                    settings={{
                      ...appSettings.western,
                      enableATC5Colors: appSettings.atc5.enableColors,
                      atc5Groups: appSettings.atc5.groups,
                      atc5ColorGroups: appSettings.atc5.colorGroups,
                    }}
                    generalDisplaySettings={generalDisplaySettings}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <ChineseMedicine
                    groupedChineseMeds={groupedChineseMeds}
                    chineseMedSettings={appSettings.chinese}
                    generalDisplaySettings={generalDisplaySettings}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <LabData
                    groupedLabs={groupedLabs}
                    settings={appSettings.western}
                    labSettings={appSettings.lab}
                    generalDisplaySettings={generalDisplaySettings}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={5}>
                  <LabTableView
                    groupedLabs={groupedLabs}
                    labSettings={appSettings.lab}
                    generalDisplaySettings={generalDisplaySettings}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={6}>
                  <ImagingData
                    imagingData={imagingData}
                    generalDisplaySettings={generalDisplaySettings}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={7}>
                  <MedDaysData
                    medDaysData={medDaysData}
                    generalDisplaySettings={generalDisplaySettings}
                  />
                </TabPanel>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ReaderPage;
