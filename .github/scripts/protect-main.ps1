$ErrorActionPreference = "Stop"

$repository = gh repo view --json nameWithOwner --jq .nameWithOwner
if ($LASTEXITCODE -ne 0 -or -not $repository) {
    throw "Unable to identify the GitHub repository. Configure its origin remote and authenticate with gh."
}

$protection = @{
    required_status_checks = @{
        strict   = $true
        contexts = @("API tests", "Web checks", "Docker build")
    }
    enforce_admins                   = $true
    required_pull_request_reviews    = @{
        dismiss_stale_reviews           = $true
        required_approving_review_count = 0
    }
    required_conversation_resolution = $true
    restrictions                     = $null
    allow_force_pushes               = $false
    allow_deletions                  = $false
} | ConvertTo-Json -Depth 8

$protection | gh api --method PUT "repos/$repository/branches/main/protection" --input -
if ($LASTEXITCODE -ne 0) {
    throw "GitHub refused to protect main. Check repository permissions and branch availability."
}

gh api --method PATCH "repos/$repository" --field allow_auto_merge=true --jq .allow_auto_merge
if ($LASTEXITCODE -ne 0) {
    throw "GitHub refused to enable repository auto-merge."
}

Write-Host "Protection enabled for ${repository}:main (PR required, CI required, auto-merge enabled, no force push or deletion)."
