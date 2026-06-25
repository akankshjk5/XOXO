# Google Maps & Places API

## Provider

| | |
|---|---|
| **Live** | `GoogleMapsProvider` |
| **Mock** | Built-in sample predictions (Bangkok, Dubai, Singapore, Bali) |
| **API routes** | See below |

## Environment variables

```env
GOOGLE_MAPS_API_KEY=your_server_side_key
```

When absent, autocomplete returns filtered sample cities with `demo: true`.

## API routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/inventory/places/autocomplete?q=Bang` | City autocomplete |
| GET | `/api/inventory/places/geocode?address=Bangkok` | Address → coordinates |
| GET | `/api/inventory/places/details?placeId=ChIJ...` | Place details |

### Autocomplete example

```http
GET /api/inventory/places/autocomplete?q=Bang
```

```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "placeId": "ChIJ...",
        "description": "Bangkok, Thailand",
        "mainText": "Bangkok"
      }
    ]
  }
}
```

## Google APIs used

- Places Autocomplete (`types=(cities)`)
- Geocoding API
- Place Details (`fields=name,formatted_address,geometry,photos`)

## Setup

1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable: **Places API**, **Geocoding API**
3. Create API key restricted to:
   - Server IP (backend proxy) or HTTP referrer if needed
   - Only required APIs
4. Set `GOOGLE_MAPS_API_KEY` in backend `.env`

> The backend proxies all Places calls — the key should **not** be exposed in client bundles unless you add client-side maps later.

## Retry & errors

- 3× retry on `OVER_QUERY_LIMIT` (429) and network errors
- Non-OK statuses logged as warnings; empty predictions returned
- On failure: `{ predictions: [], fallback: true }` — no 500 to client

## Mock mode

Sample predictions for demo UX when key is missing:

- Bangkok, Dubai, Singapore, Bali

Query `q=Ban` filters mock list. `placeDetails` resolves mock place IDs.

## Rate limits & billing

- Monitor usage in Google Cloud Console
- Set daily quotas and billing alerts
- Cache frequent geocode results at application layer (future optimization)

## Frontend note

`NEXT_PUBLIC_GOOGLE_MAPS_KEY` is optional for future client maps. Current integration is **server-side only** via inventory API.
