# PowerShell скрипт для чистого тестирования бэкенда VoteChain (без кракозябр)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "=== Тестирование бэкенда VoteChain ===" -ForegroundColor Cyan

Write-Host "`n1. GET /api/elections/0/ (info about initial election)" -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/" -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n2. POST /api/elections/0/whitelist/ (add voter address)" -ForegroundColor Yellow
$body = @{userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/whitelist/" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n3. GET /api/elections/0/voters/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/status/ (check voter status)" -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/voters/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/status/" -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n4. GET /api/elections/0/results/ (results before any vote)" -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/results/" -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n5. POST /api/elections/ (create new election with English names)" -ForegroundColor Yellow
$body = @{title = "New Election 2026"; candidates = @("Anna", "Boris", "Victor")} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n6. GET /api/elections/1/ (info about newly created election)" -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/1/" -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n7. POST /api/elections/0/close/ (close initial election)" -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/0/close/" -Method Post -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n8. GET /api/elections/1/results/ (results of new election - should be 0 votes)" -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/elections/1/results/" -ErrorAction Stop
$r | ConvertTo-Json

Write-Host "`n=== Testing completed ===" -ForegroundColor Green