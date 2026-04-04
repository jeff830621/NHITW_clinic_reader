import React, { useState, useEffect } from 'react';
import {
  Box, Typography, FormControlLabel,
  Switch, TextField, Button, Alert, Divider, Chip
} from '@mui/material';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function SharedFolderSettings() {
  const [settings, setSettings] = useState({
    enabled: false,
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
      // Test native host by sending a simple message
      const port = chrome.runtime.connectNative('com.nhitw.host');
      let responded = false;
      port.onMessage.addListener(() => {
        responded = true;
        port.disconnect();
        setHostStatus('ok');
      });
      port.onDisconnect.addListener(() => {
        if (!responded) setHostStatus('error');
      });
      port.postMessage({ action: 'read_manifest' });
    } catch {
      setHostStatus('error');
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FolderSharedIcon sx={{ mr: 1 }} />
        <Typography variant="h6">自動匯出 HTML 報告</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        查詢健保雲端時，自動生成病患 HTML 報告到共享資料夾，診間可直接開啟檢視。
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={settings.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
          />
        }
        label="啟用自動匯出"
      />

      {settings.enabled && (
        <>
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
        </>
      )}

      {saved && (
        <Alert severity="success" sx={{ mt: 2 }}>設定已儲存</Alert>
      )}
    </Box>
  );
}
