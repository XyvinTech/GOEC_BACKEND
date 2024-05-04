$microservices = @(
    ".\user-service",
    ".\rfid-service",
    ".\transaction-service",
    ".\review-service",
    ".\ocpp-service",
    ".\ev-machine-service",
    ".\configuration-service",
    ".\charging-station-service"
    ".\notification-service"
    ".\vehicle-service",
    ".\payment-gateway-service"
)

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

# Get the current (root) directory path
$rootDir = Get-Location
Write-Host "Root Directory: $rootDir"

# Start each microservice in a new PowerShell tab
foreach ($service in $microservices) {
    $fullPath = Join-Path -Path $rootDir -ChildPath $service
    Write-Host "Starting service at: $fullPath"

    # Check if the path exists
    if (Test-Path $fullPath) {
        $command = "cd `"$fullPath`";"
        
        Write-Host "Running command: $command"
        wt -w 0 nt powershell -NoExit -Command $command
    } else {
        Write-Host "Path does not exist: $fullPath"
    }
}
