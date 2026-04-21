import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Container, Typography, Box, Divider, ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { useState, useMemo, useEffect } from 'react'

import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import SavedEvents from "./pages/SavedEvents"

import './App.css'

export default function App() {
  // Theme state
  const [mode, setMode] = useState('light')

  // them != theme
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // color is "Professional Blue"
      },
      secondary: {
        main: '#dc004e', // color is red
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
      }
    },
    shape: {
      borderRadius: 8, 
    }
  }), [mode])

  const toggleColorMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))

  // end Theme State

  // Town Pulse Global Logic
  const [savedEvents, setSavedEvents] = useState([])

  // grab the saved events from loaclStorage on startup/mount
  useEffect(() => {
    const stored = localStorage.getItem('tp_saved_events')
    if (stored) {
      try {
        setSavedEvents(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse saved events", e)
      }
    }
  }, [])

  // keep saved events when they change
  useEffect(() => {
    localStorage.setItem('tp_saved_events', JSON.stringify(savedEvents))
  }, [savedEvents])

  // complete the return using MUI boxes, dividers, etc
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          
          <Navbar mode={mode} toggleColorMode={toggleColorMode} />

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <Routes>
              {/* Main Feed */}
              <Route 
                path="/" 
                element={<Dashboard savedEvents={savedEvents} setSavedEvents={setSavedEvents} />} 
              />

              {/* Saved Items */}
              <Route 
                path="/saved" 
                element={<SavedEvents savedEvents={savedEvents} setSavedEvents={setSavedEvents} />} 
              />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>

          <Divider />
          <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
              Town Pulse • {new Date().getFullYear()}
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  )













}