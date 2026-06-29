# Push required Railway environment variables for XOXO Travels API auth.
# Prerequisites: npx @railway/cli login && railway link (in backend/)
#
# Usage:
#   cd backend
#   .\scripts\push-railway-env.ps1
#   .\scripts\push-railway-env.ps1 -Deploy

param(
  [switch]$Deploy
)

$ErrorActionPreference = "Stop"
$apiOrigin = "https://xoxo-production-2503.up.railway.app"

function New-Secret {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return ([BitConverter]::ToString($bytes) -replace "-", "").ToLower()
}

$jwt = New-Secret
$refresh = New-Secret

Write-Host "`n=== Generated secrets (save these securely) ===" -ForegroundColor Cyan
Write-Host "JWT_SECRET=$jwt"
Write-Host "REFRESH_TOKEN_SECRET=$refresh"
Write-Host ""

$vars = @{
  JWT_SECRET = $jwt
  REFRESH_TOKEN_SECRET = $refresh
}

try {
  npx --yes @railway/cli whoami | Out-Null
} catch {
  Write-Host "Not logged in to Railway. Run: npx @railway/cli login" -ForegroundColor Yellow
  Write-Host "Then set variables manually in Railway Dashboard -> API service -> Variables:"
  foreach ($k in $vars.Keys) { Write-Host "  $k=$($vars[$k])" }
  Write-Host "`nAlso verify: MONGODB_URI, CLIENT_URL, ALLOWED_ORIGINS"
  Write-Host "`nVercel frontend:"
  Write-Host "  NEXT_PUBLIC_API_URL=$apiOrigin/api"
  Write-Host "  NEXT_PUBLIC_SOCKET_URL=$apiOrigin"
  Write-Host "  API_PROXY_TARGET=$apiOrigin"
  exit 1
}

foreach ($k in $vars.Keys) {
  Write-Host "Setting $k ..."
  $output = npx --yes @railway/cli variable set "${k}=$($vars[$k])" 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host $output -ForegroundColor Red
    Write-Host "`nFailed to set Railway variables. Log in first: npx @railway/cli login" -ForegroundColor Yellow
    Write-Host "Set manually in Railway Dashboard -> API service -> Variables:"
    foreach ($key in $vars.Keys) { Write-Host "  $key=$($vars[$key])" }
    exit 1
  }
}

Write-Host "`nRailway variables set. Redeploy the API service." -ForegroundColor Green

if ($Deploy) {
  npx --yes @railway/cli up --detach
}

Write-Host "`nVerify after deploy:"
Write-Host "  npm run auth:repair"
