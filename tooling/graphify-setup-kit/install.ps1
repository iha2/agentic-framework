# Deploy Graphify local config from graphify-setup-kit into a target repo (Windows).
# Does NOT copy graphify-out/ — run `graphify update .` on the target after install.
#Requires -Version 5.1

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string] $TargetDir,

    [Alias('o')]
    [switch] $Optional,

    [Alias('d')]
    [switch] $Docs,

    [Alias('b')]
    [switch] $Build,

    [Alias('v')]
    [switch] $Verify,

    [Alias('f')]
    [switch] $Force,

    [Alias('n')]
    [switch] $DryRun,

    [Alias('t')]
    [string] $Target
)

$ErrorActionPreference = 'Stop'

$KitDir = $PSScriptRoot
$Failed = $false

function Show-Usage {
    @'
Usage: install.ps1 [OPTIONS] [TARGET_DIR]
       install.cmd [OPTIONS] [TARGET_DIR]

Copy Graphify setup files from this kit into a project (default: ..\global-services).

Options:
  -Target, -t <DIR>   Target repo root (monorepo root)
  -Optional, -o       Also copy optional files (savings report script)
  -Docs, -d           Also copy reference docs to TARGET\private\graphify-docs\
  -Build, -b          Run `graphify update .` after copy (requires graphify CLI)
  -Verify, -v         Run verification queries + benchmark after copy/build
  -Force, -f          Overwrite existing files without prompting
  -DryRun, -n         Show what would be copied; do not write
  -Help               Show this help

Examples:
  .\install.ps1 ..\global-services
  .\install.ps1 -Optional -Build -Verify C:\Users\you\Documents\Projects\global-services
  .\install.cmd -Optional -DryRun ..\global-services

Required files (always copied):
  .graphifyignore
  .cursor\rules\graphify.mdc

Optional files (-Optional):
  scripts\graphify-savings-report.cjs

Never copied (build on target machine):
  graphify-out\
  reports\graphify\

'@ | Write-Host
}

if ($args -contains '-Help' -or $args -contains '--help' -or $args -contains '-h') {
    Show-Usage
    exit 0
}

# -Target parameter alias takes precedence over positional TargetDir
if ($Target) {
    $TargetDir = $Target
}

if (-not $TargetDir) {
    $TargetDir = Join-Path (Split-Path $KitDir -Parent) 'global-services'
}

try {
    $TargetResolved = (Resolve-Path -LiteralPath $TargetDir).Path
}
catch {
    Write-Error "Target directory does not exist: $TargetDir"
    exit 1
}

function Write-Log([string] $Message) {
    Write-Host $Message
}

function Write-Warn([string] $Message) {
    Write-Warning $Message
}

function Test-FilesEqual([string] $PathA, [string] $PathB) {
    if (-not (Test-Path -LiteralPath $PathA) -or -not (Test-Path -LiteralPath $PathB)) {
        return $false
    }
    $hashA = Get-FileHash -LiteralPath $PathA -Algorithm SHA256
    $hashB = Get-FileHash -LiteralPath $PathB -Algorithm SHA256
    return $hashA.Hash -eq $hashB.Hash
}

function Copy-KitFile {
    param(
        [string] $Source,
        [string] $Destination,
        [string] $Label
    )

    if (-not (Test-Path -LiteralPath $Source)) {
        throw "Missing kit file: $Source"
    }

    if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
        if (Test-FilesEqual -PathA $Source -PathB $Destination) {
            Write-Log "  = $Label (unchanged)"
            return
        }
        Write-Warn "$Label already exists and differs — use -Force to overwrite"
        $script:Failed = $true
        return
    }

    if ($DryRun) {
        Write-Log "  [dry-run] $Label -> $Destination"
        return
    }

    $destParent = Split-Path -Parent $Destination
    if ($destParent -and -not (Test-Path -LiteralPath $destParent)) {
        New-Item -ItemType Directory -Path $destParent -Force | Out-Null
    }

    Copy-Item -LiteralPath $Source -Destination $Destination -Force
    Write-Log "  OK $Label"
}

Write-Log "Graphify setup kit: $KitDir"
Write-Log "Target project:     $TargetResolved"
Write-Log ''

if (-not (Test-Path (Join-Path $TargetResolved 'services')) -or -not (Test-Path (Join-Path $TargetResolved 'web'))) {
    Write-Warn 'Target does not look like global-services (missing services\ or web\). Continuing anyway.'
}

Write-Log 'Copying required files...'
Copy-KitFile `
    -Source (Join-Path $KitDir 'required\.graphifyignore') `
    -Destination (Join-Path $TargetResolved '.graphifyignore') `
    -Label '.graphifyignore'

Copy-KitFile `
    -Source (Join-Path $KitDir 'required\.cursor\rules\graphify.mdc') `
    -Destination (Join-Path $TargetResolved '.cursor\rules\graphify.mdc') `
    -Label '.cursor\rules\graphify.mdc'

if ($Optional) {
    Write-Log ''
    Write-Log 'Copying optional files...'
    Copy-KitFile `
        -Source (Join-Path $KitDir 'optional\scripts\graphify-savings-report.cjs') `
        -Destination (Join-Path $TargetResolved 'scripts\graphify-savings-report.cjs') `
        -Label 'scripts\graphify-savings-report.cjs'
}

if ($Docs) {
    Write-Log ''
    Write-Log 'Copying reference docs...'
    $docsDest = Join-Path $TargetResolved 'private\graphify-docs'
    foreach ($doc in @('graphify-guide.md', 'graphify-new-computer-setup.md', 'graphify-agent-setup-prompt.md')) {
        Copy-KitFile `
            -Source (Join-Path $KitDir "docs\$doc") `
            -Destination (Join-Path $docsDest $doc) `
            -Label "private\graphify-docs\$doc"
    }
}

if ($Failed -and -not $Force) {
    Write-Error 'Some files were not copied. Re-run with -Force to overwrite.'
    exit 1
}

if ($DryRun) {
    Write-Log ''
    Write-Log 'Dry run complete. No files written.'
    exit 0
}

function Test-GraphifyCli {
    if (-not (Get-Command graphify -ErrorAction SilentlyContinue)) {
        Write-Error 'graphify CLI not found. Install: pip install graphifyy  (or pipx install graphifyy)'
        exit 1
    }
}

if ($Build) {
    Write-Log ''
    Write-Log 'Building graph (graphify update .)...'
    Test-GraphifyCli
    Push-Location $TargetResolved
    try {
        & graphify update .
        Write-Log '  OK graphify update .'
    }
    finally {
        Pop-Location
    }
}

if ($Verify) {
    Write-Log ''
    Write-Log 'Verifying setup...'
    Test-GraphifyCli

    $graphJson = Join-Path $TargetResolved 'graphify-out\graph.json'
    if (-not (Test-Path -LiteralPath $graphJson)) {
        Write-Warn "graphify-out\graph.json missing — run with -Build or: cd `"$TargetResolved`" ; graphify update ."
    }
    else {
        Push-Location $TargetResolved
        try {
            $queryOut = & graphify query 'places proxy Google Places' --budget 800 2>&1
            $queryOut | Select-Object -First 15 | ForEach-Object { Write-Host $_ }
            Write-Log ''
            $benchOut = & graphify benchmark graphify-out\graph.json 2>&1
            $benchOut | Select-Object -First 12 | ForEach-Object { Write-Host $_ }
        }
        finally {
            Pop-Location
        }
    }

    Write-Log ''
    Write-Log 'Git status (Graphify files should NOT be committed):'
    Push-Location $TargetResolved
    try {
        git status --short .graphifyignore .cursor/rules/graphify.mdc graphify-out/ scripts/graphify-savings-report.cjs 2>$null
    }
    catch {
        # git may be unavailable
    }
    finally {
        Pop-Location
    }
}

Write-Log ''
Write-Log 'Done.'
Write-Log ''
Write-Log 'Next steps:'
Write-Log '  1. Install CLI (if needed): pip install graphifyy  (add Python Scripts to PATH)'
Write-Log "  2. Build graph:             cd `"$TargetResolved`" ; graphify update ."
Write-Log '  3. Open project in Cursor — agent rule is at .cursor\rules\graphify.mdc'
Write-Log '  4. After code changes:      graphify update .'
if (-not $Optional) {
    Write-Log '  5. Optional savings:        re-run with -Optional'
}
