$src = "C:\Users\KOWSHIK REDDY\OneDrive\Documents\BLOGGER"
$dest = "C:\Users\KOWSHIK REDDY\OneDrive\Desktop\DocuMindAI.zip"

if (Test-Path $dest) {
    Remove-Item $dest -Force
}

$items = Get-ChildItem -Path $src | Where-Object { $_.Name -ne 'node_modules' -and $_.Name -ne '.git' -and $_.Name -ne 'export_zip.ps1' }
Compress-Archive -Path $items.FullName -DestinationPath $dest -Force
Write-Host "ZIP_SUCCESS: File created at $dest"
