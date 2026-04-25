import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Select, MenuItem, Card, CardContent, CardActions, Button, CircularProgress, Link as MuiLink } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { api } from '../api/client'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CITY_LABELS = {
  seattle: 'Seattle',
  'king-county': 'King County',
  bellevue: 'Bellevue',
  redmond: 'Redmond',
}

function pad2(n) {
  return n < 10 ? `0${n}` : String(n)
}

function buildYmd(year, monthIdx, day) {
  return `${year}-${pad2(monthIdx + 1)}-${pad2(day)}`
}

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

export default function Dashboard({ savedEvents, setSavedEvents }) {
  const today = new Date()
  const todayYmd = buildYmd(today.getFullYear(), today.getMonth(), today.getDate())

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [area, setArea] = useState('seattle')
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayYmd)

  useEffect(() => {
    loadEvents(area)
  }, [area])

  async function loadEvents(selectedArea) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '500')
      params.set('days_ahead', '60')
      params.set('area', selectedArea)

      const data = await api.get(`/seattle-events/`, { params })
      setResults(data.results || [])
    } catch (error) {
      console.log('Load events error:', error)
      setResults([])
    }
    setLoading(false)
  }

  function getEventKey(event) {
    return event.external_id || event.title
  }

  function saveEvent(event) {
    const eventKey = getEventKey(event)
    const alreadySaved = savedEvents.find((item) => getEventKey(item) === eventKey)

    if (!alreadySaved) {
      setSavedEvents((prev) => [...prev, { ...event, notes: '' }])
    }
  }

  function isEventSaved(event) {
    return savedEvents.some((item) => getEventKey(item) === getEventKey(event))
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
    setSelectedDate(null)
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
    setSelectedDate(null)
  }

  function handleDayClick(day) {
    const ymd = buildYmd(viewYear, viewMonth, day)
    setSelectedDate((prev) => (prev === ymd ? null : ymd))
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()

  const eventDates = useMemo(() => {
    const set = new Set()
    for (const ev of results) {
      const ymd = toYmd(ev.date)
      if (ymd) set.add(ymd)
    }
    return set
  }, [results])

  const filteredResults = selectedDate
    ? results.filter((ev) => toYmd(ev.date) === selectedDate)
    : []

  const selectedDateDisplay = formatDateMDY(selectedDate)

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', bgcolor: '#fce7f3' }}>
        <img src="/HomePage.png" alt="Town Pulse" style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Events in {CITY_LABELS[area] || area}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Pick an area to see current civic and community events.
        </Typography>
        <Select 
          value={area} 
          onChange={(e) => setArea(e.target.value)} 
          size="small" 
          sx={{ minWidth: 220, bgcolor: 'background.paper', mt: 1 }}
        >
          <MenuItem value="seattle">Seattle</MenuItem>
          <MenuItem value="king-county">King County</MenuItem>
          <MenuItem value="bellevue">Bellevue</MenuItem>
          <MenuItem value="redmond">Redmond</MenuItem>
        </Select>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Events */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'primary.contrastText' }}>
            {selectedDate ? `Showing events on ${selectedDateDisplay}` : 'Select a date on the calendar to see events.'}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : selectedDate && filteredResults.length === 0 ? (
            <Typography sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>No events on {selectedDateDisplay} in this area.</Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredResults.map((event, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={`${getEventKey(event)}-${index}`}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" noWrap gutterBottom>
                        {event.url ? <MuiLink href={event.url} target="_blank" rel="noopener">{event.title}</MuiLink> : event.title || 'Untitled event'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{formatDateMDY(event.date) || 'No date'}</Typography>
                      {event.location_address && <Typography variant="body2" noWrap>{event.location_address}</Typography>}
                      {event.description && (
                        <Typography variant="body2" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {event.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" variant="contained" color={isEventSaved(event) ? "inherit" : "success"} onClick={() => saveEvent(event)} disabled={isEventSaved(event)}>
                        {isEventSaved(event) ? 'Saved' : 'Save'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Right Column: Calendar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button variant="contained" size="small" onClick={prevMonth}>{'<'}</Button>
              <Typography variant="h6">{`${MONTH_NAMES[viewMonth]} ${viewYear}`}</Typography>
              <Button variant="contained" size="small" onClick={nextMonth}>{'>'}</Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <Typography key={day} variant="caption" fontWeight="bold">{day}</Typography>)}
              {Array.from({ length: firstWeekday }).map((_, i) => <Box key={`blank-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ymd = buildYmd(viewYear, viewMonth, day);
                return (
                  <Button key={ymd} onClick={() => handleDayClick(day)} sx={{ minWidth: 0, p: 1, bgcolor: selectedDate === ymd ? 'primary.main' : eventDates.has(ymd) ? 'primary.light' : 'action.hover', color: selectedDate === ymd ? 'primary.contrastText' : 'text.primary', border: (day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()) ? '1px solid green' : 'none' }}>
                    {day}
                  </Button>
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}