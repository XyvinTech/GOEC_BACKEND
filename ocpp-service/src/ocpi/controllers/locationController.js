const { getChargingStationListWithEvDetails } = require("../../services/charging-station-api");








//? every response must me in the same  format , refere page 23 , example below


exports.getLocations = async (req, res) => {


    // Fetch data from the existing service
    const chargingStations = await getChargingStationListWithEvDetails()

    // Convert to OCPI location format
    //!refer page 50
    const ocpiLocations = chargingStations.map(station => {
        return {
            id: station._id.toString(),
            name: station.name,
            address: station.address,
            city: station.district,
            country_code: station.country,
            coordinates: {
                latitude: station.latitude,
                longitude: station.longitude,
            },
            evses: station.chargers.map(charger => ({
                uid: charger.CPID,
                status: charger.cpidStatus,
                connectors: charger.connectors.map(connector => ({
                    id: connector.connectorId,
                    standard: mapToOCPIConnectorStandard(connector),
                    maxPower: calculateMaxPower(connector),
                    tariffId: charger.chargingTariff,
                }))
            })),
            facilities: station.amenities,
            operator: {
                name: station.owner,
                website: null,
            },
            last_updated: station.updatedAt || station.createdAt,
        };
    });

    // Function to map internal connector type to OCPI standards
    function mapToOCPIConnectorStandard(connector) {
        // Example mapping
        return connector.type; // You need to define how your types map to OCPI types
    }

    // Function to calculate maximum power (example calculation)
    function calculateMaxPower(connector) {
        // Calculate based on voltage and amperage if available
        return connector.voltage * connector.amperage;
    }







    res.json({
        "status_code": 1000,
        "status_message": "Success",
        "timestamp": "2015-06-30T21:59:59Z", data: ocpiLocations
    });
};


//?SAmple outputdata for an location as per ocpi protocol
//? Refer ocpi 2.2 protocol for exact required only keys.


const sample = {
    "id": "LOC1",
    "name": "Downtown Charging Hub",
    "address": "123 Main St",
    "city": "Metropolis",
    "postal_code": "12345",
    "country": "US",
    "coordinates": {
        "latitude": 34.052235,
        "longitude": -118.243683
    },
    "related_locations": [],
    "parking_restrictions": [],
    "evses": [  // Electric Vehicle Supply Equipment
        {
            "uid": "EVSE1",
            "evse_id": "NL*EVC*E1234567*A",
            "status": "AVAILABLE",
            "capabilities": ["RFID_READER"],
            "connectors": [
                {
                    "id": "1",
                    "standard": "IEC_62196_T2",
                    "format": "CABLE",
                    "power_type": "AC_3_PHASE",
                    "voltage": 400,
                    "amperage": 16,
                    "tariff_id": "T1",
                    "last_updated": "2024-05-16T08:30:00Z"
                }
            ],
            "floor_level": "-1",
            "physical_reference": "12A",
            "directions": [
                {
                    "language": "en",
                    "text": "Near the entrance of the parking garage."
                }
            ],
            "last_updated": "2024-05-16T08:30:00Z"
        }
    ],
    "operator": {
        "name": "Charge Fast Inc",
        "website": "http://www.chargefast.com",
        "logo": {
            "url": "http://www.chargefast.com/logo.png",
            "category": "OPERATOR",
            "type": "JPEG",
            "width": 200,
            "height": 200
        }
    },
    "facilities": [
        "RESTAURANT",
        "COFFEE_SHOP"
    ],
    "time_zone": "America/Los_Angeles",
    "opening_times": {
        "twentyfourseven": false,
        "regular_hours": [
            {
                "weekday": 1,
                "period_begin": "08:00",
                "period_end": "20:00"
            },
            {
                "weekday": 2,
                "period_begin": "08:00",
                "period_end": "20:00"
            }
        ],
        "exceptional_openings": [],
        "exceptional_closings": []
    },
    "last_updated": "2024-05-16T08:30:00Z"
}
