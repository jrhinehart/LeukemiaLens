# LeukemiaLens RAG Pipeline - Nightly Batch Processing
# Run this script via Windows Task Scheduler at 2 AM
# Processes all pending documents using GPU acceleration

param(
    [int]$Limit = 100,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $ScriptDir "logs"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$LogFile = Join-Path $LogDir "rag-nightly_$Timestamp.log"

# Create logs directory if needed
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

function Get-PendingCount {
    $env = Get-Content (Join-Path $ScriptDir ".env") | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    
    $AccountId = $env:CLOUDFLARE_ACCOUNT_ID
    $ApiToken = $env:CLOUDFLARE_API_TOKEN
    $DatabaseId = $env:DATABASE_ID
    
    $Headers = @{
        "Authorization" = "Bearer $ApiToken"
        "Content-Type"  = "application/json"
    }
    
    $Body = @{ sql = "SELECT COUNT(*) as count FROM documents WHERE status = 'pending'" } | ConvertTo-Json
    $Response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/d1/database/$DatabaseId/query" `
        -Method POST -Headers $Headers -Body $Body
    
    return $Response.result[0].results[0].count
}

# ============================================
# MAIN EXECUTION
# ============================================

Write-Log "=========================================="
Write-Log "LeukemiaLens RAG Nightly Batch"
Write-Log "=========================================="
Write-Log "Limit: $Limit documents"
Write-Log "DryRun: $DryRun"

try {
    # ============================================
    # PHASE 1: Fetch new documents from PMC OA
    # ============================================
    Write-Log "--- PHASE 1: Document Discovery ---"
    
    $IngestDir = Join-Path (Split-Path $ScriptDir -Parent) "workers\ingest"
    
    if (Test-Path $IngestDir) {
        Write-Log "Running PMC full-text fetch..."
        $FetchStart = Get-Date
        
        Set-Location $IngestDir
        
        # Use cmd.exe to run npx (works better on Windows)
        $FetchArgs = "/c npx tsx scripts/fetch-pmc-fulltext.ts --limit $Limit --format pdf"
        $FetchProcess = Start-Process -FilePath "cmd.exe" `
            -ArgumentList $FetchArgs `
            -NoNewWindow -Wait -PassThru `
            -RedirectStandardOutput (Join-Path $LogDir "fetch_stdout_$Timestamp.log") `
            -RedirectStandardError (Join-Path $LogDir "fetch_stderr_$Timestamp.log")
        
        $FetchDuration = (Get-Date) - $FetchStart
        
        if ($FetchProcess.ExitCode -eq 0) {
            Write-Log "Document fetch completed in $($FetchDuration.TotalMinutes.ToString('F1')) minutes"
        }
        else {
            Write-Log "Document fetch had issues (exit code: $($FetchProcess.ExitCode)) - continuing with backfill" "WARN"
        }
    }
    else {
        Write-Log "Ingest worker directory not found, skipping document fetch" "WARN"
    }
    
    # ============================================
    # PHASE 2: GPU Processing
    # ============================================
    Write-Log "--- PHASE 2: GPU Processing ---"
    
    Set-Location $ScriptDir
    $PendingCount = Get-PendingCount
    Write-Log "Pending documents: $PendingCount"
    
    if ($PendingCount -eq 0) {
        Write-Log "No pending documents to process."
    }
    elseif ($DryRun) {
        Write-Log "[DRY RUN] Would process up to $Limit documents"
    }
    else {
        Write-Log "Starting GPU backfill..."
        $BackfillStart = Get-Date
        
        $Process = Start-Process -FilePath "python" `
            -ArgumentList "backfill_gpu.py", "--limit", $Limit `
            -NoNewWindow -Wait -PassThru `
            -RedirectStandardOutput (Join-Path $LogDir "backfill_stdout_$Timestamp.log") `
            -RedirectStandardError (Join-Path $LogDir "backfill_stderr_$Timestamp.log")
        
        $BackfillDuration = (Get-Date) - $BackfillStart
        
        if ($Process.ExitCode -eq 0) {
            Write-Log "Backfill completed in $($BackfillDuration.TotalMinutes.ToString('F1')) minutes"
        }
        else {
            Write-Log "Backfill failed with exit code: $($Process.ExitCode)" "ERROR"
            exit 1
        }
        
        # Get final stats
        $FinalPending = Get-PendingCount
        $Processed = $PendingCount - $FinalPending
        Write-Log "Documents processed: $Processed"
        Write-Log "Documents remaining: $FinalPending"
    }
    
    Write-Log "=========================================="
    Write-Log "Nightly batch complete"
    Write-Log "=========================================="
    
}
catch {
    Write-Log "Error: $_" "ERROR"
    Write-Log $_.ScriptStackTrace "ERROR"
    exit 1
}
