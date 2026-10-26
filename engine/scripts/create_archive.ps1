$destination = "C:\Users\Nexus\Documents\AETHERIA\aetheria-engine-core.zip"
if (Test-Path $destination) {
    Remove-Item $destination -Force
}

$itemsToZip = Get-ChildItem -Path "C:\Users\Nexus\Documents\AETHERIA\engine" | Where-Object { 
    $_.Name -notin @('node_modules', 'dist', '.turbo', '.temp')
}

Write-Host "Compressing items into $destination ..."
Compress-Archive -Path $itemsToZip.FullName -DestinationPath $destination -CompressionLevel Optimal

if (Test-Path $destination) {
    $item = Get-Item $destination
    Write-Host "Successfully generated zip archive: $($item.FullName)"
    Write-Host "Archive size: $([math]::Round($item.Length / 1MB, 2)) MB ($($item.Length) bytes)"
} else {
    Write-Error "Failed to create archive"
}
