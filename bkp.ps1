# Base directory of your project
$BaseDir = Get-Location

# Timestamp for folder & zip name
$TimeStamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Create backup directory if not exists
$BackupDir = Join-Path $BaseDir "backup"
if (!(Test-Path $BackupDir)) {
    New-Item -Path $BackupDir -ItemType Directory | Out-Null
}

# Create dated subfolder inside backup/
$BackupFolderName = $TimeStamp
$BackupTempDir = Join-Path $BackupDir $BackupFolderName
New-Item -Path $BackupTempDir -ItemType Directory | Out-Null

# Define folders to exclude
$ExcludeDirs = @("node_modules", ".next", ".git", "backup")

# Copy content while preserving structure & excluding unwanted folders
Get-ChildItem -Path $BaseDir -Force |
    Where-Object {
        $_.Name -ne "backup" -and $ExcludeDirs -notcontains $_.Name
    } | ForEach-Object {
        $Destination = Join-Path $BackupTempDir $_.Name
        Copy-Item -Path $_.FullName -Destination $Destination -Recurse -Force
    }

# Set the zip file path
$ZipFileName = "project-backup_$TimeStamp.zip"
$ZipFilePath = Join-Path $BackupDir $ZipFileName

# Create zip archive of the backup folder
Compress-Archive -Path $BackupTempDir -DestinationPath $ZipFilePath

# Delete the backup folder after creating the zip
if (Test-Path $BackupTempDir) {
    Remove-Item -Path $BackupTempDir -Recurse -Force
}

Write-Host "Backup complete!"
Write-Host "ZIP saved to: $ZipFilePath"
