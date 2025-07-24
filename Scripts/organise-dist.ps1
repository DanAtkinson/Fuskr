# PowerShell script to organise the dist folder structure
param(
	[string]$DistPath = "dist/chromium"
)

Write-Host "Organizing dist folder structure at: $DistPath" -ForegroundColor Green

# Ensure we're in the project root
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Create subdirectories if they don't exist
$jsDir = Join-Path $DistPath "js"
$cssDir = Join-Path $DistPath "css"
$fontsDir = Join-Path $DistPath "assets/fonts"

Write-Host "Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $jsDir | Out-Null
New-Item -ItemType Directory -Force -Path $cssDir | Out-Null
New-Item -ItemType Directory -Force -Path $fontsDir | Out-Null

# Move JavaScript files
Write-Host "Moving JavaScript files..." -ForegroundColor Yellow
Get-ChildItem -Path $DistPath -Name "*.js" | ForEach-Object {
	$sourceFile = Join-Path $DistPath $_
	$targetFile = Join-Path $jsDir $_
	Move-Item $sourceFile $targetFile -Force
}

# Move JavaScript license files
Get-ChildItem -Path $DistPath -Name "*.js.LICENSE.txt" | ForEach-Object {
	$sourceFile = Join-Path $DistPath $_
	$targetFile = Join-Path $jsDir $_
	Move-Item $sourceFile $targetFile -Force
}

# Move CSS files
Write-Host "Moving CSS files..." -ForegroundColor Yellow
Get-ChildItem -Path $DistPath -Name "*.css" | ForEach-Object {
	$sourceFile = Join-Path $DistPath $_
	$targetFile = Join-Path $cssDir $_
	Move-Item $sourceFile $targetFile -Force
}

# Move font files (FontAwesome)
Write-Host "Moving font files..." -ForegroundColor Yellow
Get-ChildItem -Path $DistPath -Name "fa-*.*" | ForEach-Object {
	$sourceFile = Join-Path $DistPath $_
	$targetFile = Join-Path $fontsDir $_
	Move-Item $sourceFile $targetFile -Force
}

# Move other license files to assets
Write-Host "Moving license files..." -ForegroundColor Yellow
Get-ChildItem -Path $DistPath -Name "*licenses*.txt" | ForEach-Object {
	$sourceFile = Join-Path $DistPath $_
	$targetFile = Join-Path (Join-Path $DistPath "assets") $_
	Move-Item $sourceFile $targetFile -Force
}

# Update index.html to reference new paths
Write-Host "Updating index.html paths..." -ForegroundColor Yellow
$indexFile = Join-Path $DistPath "index.html"
if (Test-Path $indexFile) {
	$content = Get-Content $indexFile -Raw
	
	# Update CSS references
	$content = $content -replace 'href="(styles\.[^"]+\.css)"', 'href="css/$1"'
	
	# Update JavaScript references
	$content = $content -replace 'src="(runtime\.[^"]+\.js)"', 'src="js/$1"'
	$content = $content -replace 'src="(polyfills\.[^"]+\.js)"', 'src="js/$1"'
	$content = $content -replace 'src="(main\.[^"]+\.js)"', 'src="js/$1"'
	$content = $content -replace 'src="(background\.js)"', 'src="js/$1"'
	$content = $content -replace 'src="(fuskr-core\.js)"', 'src="js/$1"'
	
	Set-Content $indexFile $content
}

# Update manifest.json to reference new paths
Write-Host "Updating manifest.json paths..." -ForegroundColor Yellow
$manifestFile = Join-Path $DistPath "manifest.json"
if (Test-Path $manifestFile) {
	$content = Get-Content $manifestFile -Raw
	
	# Update background service worker path
	$content = $content -replace '"service_worker":\s*"background\.js"', '"service_worker": "js/background.js"'
	
	Set-Content $manifestFile $content
}

# Update CSS files to reference new font paths
Write-Host "Updating CSS font paths..." -ForegroundColor Yellow
Get-ChildItem -Path (Join-Path $DistPath "css") -Name "*.css" | ForEach-Object {
	$cssFile = Join-Path (Join-Path $DistPath "css") $_
	if (Test-Path $cssFile) {
		$content = Get-Content $cssFile -Raw
		
		# Update font paths to point to assets/fonts/
		$content = $content -replace 'url\(([^)]*fa-[^)]+\.(woff2|ttf))\)', 'url(../assets/fonts/$1)'
		
		Set-Content $cssFile $content
	}
}

Write-Host "Dist folder organization complete!" -ForegroundColor Green

# Show the new structure
Write-Host "`nNew structure:" -ForegroundColor Cyan
Write-Host "Root files:" -ForegroundColor White
Get-ChildItem -Path $DistPath -File | Select-Object Name | Format-Table -HideTableHeaders

Write-Host "Subdirectories:" -ForegroundColor White
Get-ChildItem -Path $DistPath -Directory | ForEach-Object {
	Write-Host "  $($_.Name)/" -ForegroundColor Gray
	Get-ChildItem -Path $_.FullName -Recurse | ForEach-Object {
		$relativePath = $_.FullName.Substring((Join-Path $DistPath "").Length)
		Write-Host "    $relativePath" -ForegroundColor DarkGray
	}
}
