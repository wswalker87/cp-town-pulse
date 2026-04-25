import { useEffect, useState } from "react"
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Stack, Chip } from '@mui/material'
import { Brightness4, Brightness7 } from "@mui/icons-material"
import { api } from '../api/client'
import { useNavigate, Link } from 'react-router-dom'

export default function Navbar({ mode, toggleColorMode }) {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const isLoggedIn = !!localStorage.getItem("token")

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token")
            // no token, stop. do not pass go
            if (!token) return

            try {
                const response = await api.get('/auth/users/me/')
                // client.js interceptor already unwraps response.data, so we just pass response
                setUser(response)
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("token")
                    setUser(null)
                }
            }
        }
        fetchUser()
}, [])

  function handleLogout() {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

      return (
        <AppBar position="static" sx={{ mb: 3 }} color="primary">
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ flexGrow: 1 }}
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                >
                        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                            Town Pulse
                        </Link>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        color="inherit"
                        component={Link} to="/saved"
                    >
                        Saved Events
                    </Button>
                
                    {user ? (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body1" sx={{ color: 'white' }}>
                                {/* Use account first name if available, use username instead */}
                                Hello, {user.first_name || user.username}!
                            </Typography>

                            <Button
                                color="inherit"
                                variant="outlined"
                                onClick={handleLogout}
                                sx={{ borderColor: 'rgba(255,255,255,0.5' }}
                            >
                                Logout
                            </Button>
                        </Stack>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <Button color="inherit" onClick={() => navigate('/login')}>
                                Login
                            </Button>
                            <Button
                                color="secondary"
                                variant="contained"
                                onClick={() => navigate('/signup')}
                            >
                                Sign Up
                            </Button>
                        </Stack>
                    )}
                    <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    )
}