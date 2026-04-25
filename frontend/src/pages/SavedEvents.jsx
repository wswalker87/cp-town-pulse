import { useState } from 'react'
import { Box, Typography, Card, CardContent, CardActions, Button, TextField, Link as MuiLink } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'

function toYmd(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return ''
  return dateStr.slice(0, 10)
}

function formatDateMDY(value) {
  const ymd = toYmd(value)
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-')
  if (!y || !m || !d) return ''
  return `${m}/${d}/${y}`
}

export default function SavedEvents({ savedEvents, setSavedEvents }) {
  const [editingEventKey, setEditingEventKey] = useState(null)
  const [editingNote, setEditingNote] = useState('')

  function getEventKey(event) {
    return event.external_id || event.title
  }

  function deleteEvent(eventKey) {
    const updated = savedEvents.filter((item) => getEventKey(item) !== eventKey)
    setSavedEvents(updated)
    if (editingEventKey === eventKey) {
      setEditingEventKey(null)
      setEditingNote('')
    }
  }

  function startEditing(event) {
    setEditingEventKey(getEventKey(event))
    setEditingNote(event.notes || '')
  }

  function cancelEditing() {
    setEditingEventKey(null)
    setEditingNote('')
  }

  function saveNote(eventKey) {
    const updated = savedEvents.map((item) =>
      getEventKey(item) === eventKey ? { ...item, notes: editingNote } : item
    )
    setSavedEvents(updated)
    setEditingEventKey(null)
    setEditingNote('')
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Saved Events</Typography>
        <Typography variant="body1" color="text.secondary">These are the events you saved.</Typography>
      </Box>

      {savedEvents.length === 0 ? (
        <Typography>No saved events yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {savedEvents.map((event, index) => {
            const eventKey = getEventKey(event)
            const isEditing = editingEventKey === eventKey

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${eventKey}-${index}`}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" noWrap gutterBottom>
                      {event.url ? <MuiLink href={event.url} target="_blank" rel="noopener">{event.title}</MuiLink> : event.title || 'Untitled event'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{formatDateMDY(event.date) || 'No date'}</Typography>
                    {event.location_address && <Typography variant="body2" noWrap>{event.location_address}</Typography>}
                    {event.description && <Typography variant="body2" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</Typography>}

                    {!isEditing && event.notes && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="subtitle2">Notes:</Typography>
                        <Typography variant="body2">{event.notes}</Typography>
                      </Box>
                    )}
                    {isEditing && <TextField fullWidth multiline rows={3} value={editingNote} onChange={(e) => setEditingNote(e.target.value)} placeholder="Add your notes here..." sx={{ mt: 2 }} />}
                  </CardContent>
                  <CardActions sx={{ gap: 1 }}>
                    {isEditing ? <><Button size="small" variant="contained" onClick={() => saveNote(eventKey)}>Save Note</Button><Button size="small" onClick={cancelEditing}>Cancel</Button></> : <><Button size="small" variant="outlined" onClick={() => startEditing(event)}>{event.notes ? 'Edit Notes' : 'Add Notes'}</Button><Button size="small" variant="contained" color="error" onClick={() => deleteEvent(eventKey)}>Delete</Button></>}
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}