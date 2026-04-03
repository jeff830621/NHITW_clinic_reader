import React, { useState, useEffect } from 'react';
import {
  Box, Typography, FormControl, FormControlLabel, RadioGroup, Radio,
  Switch, TextField, Button, Alert, Divider, Chip
} from '@mui/material';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function SharedFolderSettings() {
  const [settings, setSettings] = useState({
    enabled: false,
    role: 'capture',
    retentionDays: 7,
  });
  const [hostStatus, setHostStatus] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('sharedFolder', (result) => {
      if (result.sharedFolder) {
        setSettings(prev => ({ ...prev, ...result.sharedFolder }));
      }
    });
  }, []);

  function handleChange(field, value) {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    chrome.storage.sync.set({ sharedFolder: updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function checkHost() {
    setHostStatus('checking');
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'checkHostStatus' }, (resp) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(resp);
        });
      });
      setHostStatus(response.available ? 'ok' : 'error');
    } catch {
      setHostStatus('error');
    }
  }

  function openReaderPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('reader.html') });
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FolderSharedIcon sx={{ mr: 1 }} />
        <Typography variant="h6">共享資料夾設定</Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
          />
        }
        label="啟用共享資料夾功能"
      />

      {settings.enabled && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>角色設定</Typography>
          <FormControl>
            <RadioGroup
              value={settings.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <FormControlLabel
                value="capture"
                control={<Radio />}
                label="櫃檯模式 — 擷取健保雲端資料並匯出到共享資料夾"
              />
              <FormControlLabel
                value="reader"
                control={<Radio />}
                label="診間模式 — 從共享資料夾讀取病患資料"
              />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>資料保留天數</Typography>
          <TextField
            type="number"
            value={settings.retentionDays}
            onChange={(e) => handleChange('retentionDays', parseInt(e.target.value) || 7)}
            size="small"
            inputProps={{ min: 1, max: 90 }}
            sx={{ width: 100 }}
          />

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Native Host 狀態</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={checkHost}>
              {hostStatus === 'checking' ? '檢查中...' : '檢查連線'}
            </Button>
            {hostStatus === 'ok' && (
              <Chip icon={<CheckCircleIcon />} label="已連線" color="success" size="small" />
            )}
            {hostStatus === 'error' && (
              <Chip icon={<ErrorIcon />} label="未連線" color="error" size="small" />
            )}
          </Box>

          {hostStatus === 'error' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              請確認已執行 install.bat 並重啟瀏覽器。
            </Alert>
          )}

          {settings.role === 'reader' && (
            <>
              <Divider sx={{ my: 2 }} />
              <Button variant="contained" onClick={openReaderPage}>
                開啟診間閱讀器
              </Button>
            </>
          )}
        </>
      )}

      {saved && (
        <Alert severity="success" sx={{ mt: 2 }}>設定已儲存</Alert>
      )}
    </Box>
  );
}
