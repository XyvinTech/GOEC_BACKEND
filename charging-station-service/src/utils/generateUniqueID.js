const generateUniqueReceiptID=()=> {
    // Use a timestamp to ensure uniqueness
    const timestamp = Date.now();
  
    // Generate a random string (you can adjust the length as needed)
    const randomString = Math.random().toString(36).substring(2, 10);
  
    // Combine the timestamp and random string to create a unique ID
    const uniqueID = `${timestamp}-${randomString}`;
  
    return uniqueID;
  } 

  module.exports = generateUniqueReceiptID;