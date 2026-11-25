import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
  Avatar,
  Grid,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';

// 從 manifest 獲取版本資訊
const manifestData = chrome.runtime.getManifest();

// 貢獻者資料
// 原始專案的著作權致謝。Apache 2.0 要求保留著作權標示,但不涉及肖像與個人
// 社群帳號 —— 本衍生版以自己的名義發佈,不散布他人的照片、私人部落格或
// Facebook 個人頁。保留姓名、角色與 GitHub(程式著作的專業識別)。
const contributors = [
  { name: "李坤峰醫師", englishName: "Kun-Feng Lee", role: ["項目主持人", "主要開發者"], github: "https://github.com/leescot" },
  { name: "曾建霖醫師", englishName: "Chien-Lin Tseng", role: "主要開發者", github: "https://github.com/aszk1415" },
  { name: "林協霆醫師", englishName: "Hsieh-Ting Lin", role: "技術顧問", github: "https://github.com/htlin222" }
];

const AboutTab = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">原始專案「更好的健保雲端 2.0」開發團隊（致謝）</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {contributors.map((contributor, index) => (
            <ListItem key={index} sx={{ py: 1.5 }}>
              <Grid container alignItems="center">
                <Grid item>
                  <Avatar sx={{ width: 44, height: 44, fontSize: '1.1rem', bgcolor: 'grey.400', mr: 2 }}>
                    {contributor.name.charAt(0)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 0.2 }}>
                          {contributor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          {contributor.englishName}
                        </Typography>
                        {Array.isArray(contributor.role) ? (
                          contributor.role.map((role, roleIndex) => (
                            <Typography
                              key={roleIndex}
                              variant="body2"
                              color="primary"
                              sx={{ fontWeight: 500, lineHeight: 1.2, mb: roleIndex < contributor.role.length - 1 ? 0.5 : 0 }}
                            >
                              {role}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                            {contributor.role}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="column" spacing={0.5} sx={{ ml: 1 }}>
                        {contributor.github && (
                          <Tooltip title="GitHub">
                            <IconButton
                              size="small"
                              color="primary"
                              component="a"
                              href={contributor.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: '#24292e', p: 0.5 }}
                            >
                              <GitHubIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">聯絡方式</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1" paragraph>
          本衍生版（NHITW 診間報告產生器）的問題、建議或錯誤回報，請透過本版 GitHub 回報；原始專案事務請聯絡原作者團隊。
        </Typography>

        <List disablePadding>
          <ListItem>
            <ListItemText
              primary="本版問題回報（GitHub Issues）"
              secondary={<Link href="https://github.com/jeff830621/NHITW_clinic_reader/issues" target="_blank" rel="noopener noreferrer">jeff830621/NHITW_clinic_reader</Link>}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="本版 GitHub"
              secondary={
                <Box sx={{ wordBreak: 'break-word' }}>
                  <Link
                    href="https://github.com/jeff830621/NHITW_clinic_reader"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <GitHubIcon sx={{ mr: 0.5, fontSize: '1rem', flexShrink: 0 }} />
                    <Typography variant="body2" component="span" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>
                      NHITW_clinic_reader
                    </Typography>
                  </Link>
                </Box>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="原始專案 GitHub（Apache 2.0）"
              secondary={
                <Box sx={{ wordBreak: 'break-word' }}>
                  <Link
                    href="https://github.com/leescot/NHITW_cloud_analyzer_react_MUI"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <GitHubIcon sx={{ mr: 0.5, fontSize: '1rem', flexShrink: 0 }} />
                    <Typography variant="body2" component="span" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>
                      NHITW_cloud_analyzer_react_MUI
                    </Typography>
                  </Link>
                </Box>
              }
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">關於擴充功能</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="text.secondary">名稱</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">{manifestData.name}</Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="subtitle2" color="text.secondary">版本</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">{manifestData.version}</Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="subtitle2" color="text.secondary">描述</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">{manifestData.description}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AboutTab;
