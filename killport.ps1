

$portsToKill = @(5688,5685,5689,5682, 5687, 5100, 5691, 5102,5101,7535,3000,5500,6500) # List of ports your services use

# Function to kill process by port
function Stop-ProcessByPort {
    param(
        [Parameter(Mandatory=$true)]
        [int]$Port
    )
    Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq $Port } | 
    ForEach-Object { 
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
    }
}

# Kill processes on specified ports
foreach ($port in $portsToKill) {
    Write-Host "Checking and killing process on port: $port"
    Stop-ProcessByPort -Port $port
}
