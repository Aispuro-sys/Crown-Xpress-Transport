# === PROXY SQL SERVER + TUNEL CLOUDFLARE PERMANENTE ===
# Tunel ID fijo: fce250d2-bc27-4172-9583-79f48af58493
# URL permanente: https://fce250d2-bc27-4172-9583-79f48af58493.cfargotunnel.com
# NO necesitas actualizar Vercel cada vez - la URL nunca cambia

$env:SQLSERVER_PASSWORD = "Roncen810#"
$env:PATH += ";C:\Program Files (x86)\cloudflared"

Write-Host "Iniciando proxy SQL Server en puerto 3099..." -ForegroundColor Cyan
Start-Process -FilePath "node" `
  -ArgumentList "server.js" `
  -WorkingDirectory "$PSScriptRoot" `
  -WindowStyle Hidden

Start-Sleep -Seconds 3

# Verificar que el proxy este corriendo
try {
  $test = Invoke-RestMethod -Uri "http://localhost:3099/tpr?type=pending" -TimeoutSec 20
  Write-Host "Proxy OK - $($test.count) registros disponibles del SQL Server" -ForegroundColor Green
} catch {
  Write-Host "ADVERTENCIA: Proxy no responde aun, espera unos segundos..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Iniciando tunel Cloudflare PERMANENTE..." -ForegroundColor Cyan
Write-Host "URL fija: https://fce250d2-bc27-4172-9583-79f48af58493.cfargotunnel.com" -ForegroundColor Green
Write-Host ""

cloudflared tunnel --config "$env:USERPROFILE\.cloudflared\config.yml" run
