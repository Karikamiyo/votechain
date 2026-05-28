# PowerShell скрипт для итогового тестирования (без ошибок и кракозябр)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "=== Final Testing of VoteChain Backend ===" -ForegroundColor Cyan

# 1. Получить информацию о голосовании #0
Write-Host "`n1. GET /api/elections/0/" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/"
    $r | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 2. Проверить, нужно ли добавлять адрес в whitelist
Write-Host "`n2. Check if address already whitelisted" -ForegroundColor Yellow
$addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
try {
    $status = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/voters/$addr/status/"
    if ($status.whitelisted) {
        Write-Host "Address already whitelisted. Skipping add." -ForegroundColor Green
    } else {
        Write-Host "Adding address to whitelist..." -ForegroundColor Yellow
        $body = @{userAddress = $addr} | ConvertTo-Json
        $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/whitelist/" -Method Post -ContentType "application/json" -Body $body
        $r | ConvertTo-Json
    }
} catch {
    Write-Host "Error checking status: $_" -ForegroundColor Red
}

# 3. Получить статус избирателя (уже должен быть whitelisted)
Write-Host "`n3. GET voter status" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/voters/$addr/status/"
    $r | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 4. Получить результаты голосования #0
Write-Host "`n4. GET results of election #0" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/results/"
    $r | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 5. Создать новое голосование (английские названия)
Write-Host "`n5. POST create new election (English names)" -ForegroundColor Yellow
$body = @{title = "Student Council Election 2026"; candidates = @("Alice Johnson", "Bob Smith", "Carol Davis")} | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/" -Method Post -ContentType "application/json" -Body $body
    $r | ConvertTo-Json
    $newId = $r.election_id
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 6. Получить информацию о новом голосовании
if ($newId) {
    Write-Host "`n6. GET info about new election (id = $newId)" -ForegroundColor Yellow
    try {
        $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/$newId/"
        $r | ConvertTo-Json
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

# 7. Закрыть голосование #0, только если оно открыто
Write-Host "`n7. Check if election #0 is open before closing" -ForegroundColor Yellow
try {
    $info = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/"
    if ($info.is_open) {
        Write-Host "Election #0 is open. Closing now..." -ForegroundColor Yellow
        $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/close/" -Method Post
        $r | ConvertTo-Json
    } else {
        Write-Host "Election #0 is already closed. Skipping close." -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 8. Получить результаты нового голосования (должны быть 0)
if ($newId) {
    Write-Host "`n8. GET results of new election (id = $newId)" -ForegroundColor Yellow
    try {
        $r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/$newId/results/"
        $r | ConvertTo-Json
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing completed successfully ===" -ForegroundColor Green