import { Typography, Grid, Card, CardContent, CardActions, Button, Box, Alert } from '@mui/material'
import { DeleteOutlined } from '@mui/icons-material';

export default function SavedEvents({ savedEvents, setSavedEvents }) {
  
  const removeEvent = (eventKey) => {
    const updated = savedEvents.filter(event => 
      (event.external_id || event.title) !== eventKey
    )
    setSavedEvents(updated)
  }

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>Saved Events</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your personal list of tracked civic meetings and community gatherings.
      </Typography>

      {savedEvents.length === 0 ? (
        <Alert severity="info" variant="outlined">
          You haven't saved any events yet. Head back to the dashboard to find some!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {savedEvents.map((event, index) => (
            <Grid item xs={12} sm={6} md={4} key={event.external_id || index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>{event.title}</Typography>
                  <Typography variant="subtitle2" color="primary">
                    {event.date}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {event.location_address}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button 
                    startIcon={<DeleteOutline />} 
                    color="error" 
                    size="small"
                    onClick={() => removeEvent(event.external_id || event.title)}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}