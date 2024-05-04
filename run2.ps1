

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






# Define an array of microservices with their respective start commands
$services = @(
    @{Name="user-service"; Command="npm start"},
    @{Name="vehicle-service"; Command="npm start"},
    @{Name="charging-station-service"; Command="npm start"},
    @{Name="configuration-service"; Command="npm start"},
    @{Name="ev-machine-service"; Command="npm start"},
    @{Name="notification-service"; Command="npm start"}
    @{Name="ocpp-service"; Command="npm start"},
    @{Name="payment-gateway-service"; Command="npm start"}
    @{Name="review-service"; Command="npm start"},
    @{Name="rfid-service"; Command="npm start"},
    @{Name="transaction-service"; Command="npm start"}
    # Add more services as needed
)

# Loop through each service and open a new Windows Terminal tab
foreach ($service in $services) {
    $wtProfile = "PowerShell" # or "Command Prompt", depending on your preference
    $startDir = (Get-Location).Path + "\" + $service.Name
    $tabTitle = $service.Name
    $command = $service.Command

    # Construct the Windows Terminal command
    $wtCommand = "wt -w 0 new-tab --title `"$tabTitle`" --profile `"$wtProfile`" --startingDirectory `"$startDir`" powershell -NoExit -Command `"$command`";"    
    # Execute the command
    Invoke-Expression $wtCommand
}