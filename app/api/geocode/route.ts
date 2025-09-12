import { NextRequest, NextResponse } from 'next/server'

// Proxy for Nominatim API to avoid CORS issues
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  
  try {
    let url: string
    
    if (type === 'search') {
      const query = searchParams.get('query')
      if (!query) {
        return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
      }
      url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&city=${encodeURIComponent(query)}&limit=10&addressdetails=1`
    } else if (type === 'reverse') {
      const lat = searchParams.get('lat')
      const lon = searchParams.get('lon')
      if (!lat || !lon) {
        return NextResponse.json({ error: 'Lat and lon parameters required' }, { status: 400 })
      }
      url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GroFast-App/1.0 (https://grofast.com)',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} ${response.statusText}`)
      throw new Error(`Nominatim API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Add some metadata for debugging
    const responseData = {
      ...data,
      _meta: {
        timestamp: new Date().toISOString(),
        query_type: type,
        source: 'nominatim-proxy'
      }
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
      }
    })
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    )
  }
}
