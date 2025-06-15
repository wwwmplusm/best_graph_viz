import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Editor from './pages/Editor'
import Visualise from './pages/Visualise'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/visualize" element={<Visualise />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App 