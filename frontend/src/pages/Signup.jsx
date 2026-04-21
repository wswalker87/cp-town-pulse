import { useState } from 'react'
import { Container, Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    re_password: '' // Common for Djoser/Django user creation
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. HandleSubmit Fired"); // Should see this in Console
    
    try {
        console.log("2. Attempting API Call with:", formData);
        const res = await api.post('/auth/users/', formData);
        console.log("3. Success!", res.data);
    } catch (err) {
        console.log("4. ERROR DETECTED:");
        console.error("Status:", err.response?.status);
        console.error("Data from Django:", err.response?.data); // THIS IS THE PRIZE
        setError("Failed to create account. Check console.");
    }
};

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Create Account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="re_password"
            label="Confirm Password"
            type="password"
            value={formData.re_password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} to="/login" variant="body2">
              {"Already have an account? Sign In"}
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}