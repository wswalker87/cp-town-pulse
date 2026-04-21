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
                const response = await api.get('/auth/users/me/', {
            headers: {
                Authorization: `Token ${token}` 
            }
        })
        // Axios wraps the response in a 'data' object
        setUser(response.data)
            } catch (err) {
                if (err.status === 401) {
                    localStorage.removeItem("token")
                    setUser(null)
                }
            }
        }
        fetchUser()
}, [])

  function handleLogin() {
    setIsLoggedIn(true)
    setPage('dashboard')
    localStorage.setItem('tp_logged_in', 'true')
  }

  function handleLogout() {
    setIsLoggedIn(false)
    setPage('signin')
    localStorage.removeItem('tp_logged_in')
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
                            Invertikeeper
                        </Link>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        color="inherit"
                        // onClick={() => navigate('/collection')}
                        component={Link} to="/collection"
                    >
                        My Collection
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