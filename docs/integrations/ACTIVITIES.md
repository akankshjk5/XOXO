# Amadeus Activities Provider API

## Provider

| | |
|---|---|
| **Live** | `AmadeusActivityProvider` |
| **Mock** | `MockActivityProvider` |
| **Credentials** | Same as Amadeus Flights |
| **API** | `GET /api/inventory/activities` |

## Environment variables

```env
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
AMADEUS_ENV=test
```

## Amadeus endpoint

```
GET /v1/shopping/activities
```

## Query parameters

| Param | Required | Example |
|---|---|---|
| `latitude` | Yes | `13.75` |
| `longitude` | Yes | `100.52` |
| `radius` | No | `5` (km) |

### Example

```http
GET /api/inventory/activities?latitude=13.75&longitude=100.52&radius=5
```

Bangkok coordinates: `13.75, 100.52`  
Dubai: `25.20, 55.27`  
Bali (Denpasar): `-8.67, 115.26`

## Response shape

```json
{
  "success": true,
  "data": [
    {
      "id": "activity-id",
      "name": "Temple Tour",
      "shortDescription": "Guided cultural tour",
      "price": 2500,
      "currency": "INR",
      "rating": 4.5,
      "pictures": ["https://..."],
      "provider": "amadeus"
    }
  ],
  "meta": { "provider": "amadeus", "count": 12 }
}
```

## Mock mode

Returns 4 generic sample activities (city tours, food walk, etc.) when keys are absent.

## Setup

1. Enable **Tours and Activities** in Amadeus developer portal
2. Use coordinates near major tourist areas for sandbox results

## Retry & fallback

- 3× retry on transient errors
- Mock fallback with `meta.fallback: true` on persistent failure
- Results capped at 20 activities

## Limitations

- Search only — no activity booking
- Sandbox activity inventory varies by region
