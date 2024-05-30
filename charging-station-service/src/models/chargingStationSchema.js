const mongoose = require('mongoose')

const chargingStationSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    country: String,
    state: String,
    district: String,
    owner:String,
    owner_email: String,
    owner_phone: String,
    location_support_name: String,
    location_support_email: String,
    location_support__phone: String,
    tags: [String],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
       
      },
      coordinates: {
        type: [Number],
        default: [0, 0], 
      },
    },
    latitude: Number,
    longitude: Number,
    chargers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvMachine',
    }],
    status: String,
    commissioned_on: String,
    type: String, 
    image: {
      type:String,
      default: "https://image-upload-oxium.s3.ap-south-1.amazonaws.com/charging-station/d98b7359-26ac-4020-b207-9d75cc1179f1-ador%2060.jpg"
    },
    startTime:String,
    stopTime:String,
    staff:{
      type:Boolean,
      default: false,
    },
    amenities: [String],
    vendor: String,
    category: String,
    published:Boolean,
  
    
  },
  { timestamps: true }
)

chargingStationSchema.index({ location: '2dsphere' });
const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema)

module.exports = ChargingStation
