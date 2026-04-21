import { useState, useEffect } from 'react'
import { 
  Typography, Grid, Card, CardContent, CardActions, 
  Button, Box, MenuItem, Select, FormControl, InputLabel, 
  CircularProgress, Alert 
} from '@mui/material'
import { api } from '../api/client'

export default function Dashboard({ savedEvents, setSavedEvents }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [area, setArea] = useState('seattle')

  const loadEvents = async (selectedArea) => {
    setLoading(true)
    try {
      const resp = await api.get(`/seattle-events/`, {
            params: {
                limit: 25,
                area: selectedArea
            }
        })
        setEvents(resp.data)
      const data = await resp.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Load events error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents(area)
  }, [area])

  const saveEvent = (event) => {
    const eventKey = event.external_id || event.title
    const isAlreadySaved = savedEvents.some(item => (item.external_id || item.title) === eventKey)

    if (!isAlreadySaved) {
      setSavedEvents([...savedEvents, event])
    }
  }

  // complete the return with boxes, typography, forms, and cards.
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h2" gutterBottom>Local Events</Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with civic and community happenings in your area.
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="area-select-label">Area</InputLabel>
            <Select 
                labelId="area-select-label"
                value={area} 
                label="Area" 
                onChange={(e) => setArea(e.target.value)}
            >
                <MenuItem value="seattle">Seattle</MenuItem>
                <MenuItem value="king-county">King County</MenuItem>
                <MenuItem value="bellevue">Bellevue</MenuItem>
                <MenuItem value="redmond">Redmond</MenuItem>
            </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {results.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">No events found for this area.</Alert>
            </Grid>
          )}
          {results.map((event, index) => (
            <Grid item xs={12} sm={6} md={4} key={event.external_id || index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{event.title || 'Untitled Event'}</Typography>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {event.date || 'Date TBD'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                    {event.location_address}
                  </Typography>
                  <Typography variant="body2">
                    {event.description?.substring(0, 120)}...
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => saveEvent(event)}>Save Event</Button>
                  <Button size="small" color="secondary">Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}