const User = require('../models/user');

// Update a user's location and set geofence center/radius if not set
// exports.updateLocation = async (req, res) => {
//     console.log("api called");
//   const { userId, latitude, longitude } = req.body;
//   if (!userId || latitude === undefined || longitude === undefined) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }
//   try {
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // Set geofence center/radius on first location update if not set
//     if (
//       !user.geofence ||
//       !user.geofence.center ||
//       user.geofence.center.latitude === undefined ||
//       user.geofence.center.longitude === undefined
//     ) {
//       user.geofence = {
//         center: { latitude, longitude },
//         radius: 1000, // 1 km default
//         updatedAt: new Date()
//       };
//     }

//     // Always update current location
//     user.location = { latitude, longitude, updatedAt: new Date() };
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Location updated successfully',
//       location: user.location,
//       geofence: user.geofence
//     });
//   } catch (error) {
//     console.error('Error updating location:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };




exports.updateLocation = async (req, res) => {
  console.log("📍 API called: updateLocation");

  const { userId, latitude, longitude } = req.body;

  // Step 1: Validate request body
  if (!userId || latitude === undefined || longitude === undefined) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log(`🔍 Looking for user with ID: ${userId}`);
    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("✅ User found:", user.email);

    // Step 2: Log current location and geofence
    console.log("📌 Current user.location:", user.location);
    console.log("📌 Current user.geofence:", user.geofence);

    // Step 3: Update geofence if not set
    if (
      !user.geofence ||
      !user.geofence.center ||
      user.geofence.center.latitude === undefined ||
      user.geofence.center.longitude === undefined
    ) {
      console.log("⚠️ Geofence not set. Setting default geofence...");
      user.geofence = {
        center: { latitude, longitude },
        radius: 1000,
        updatedAt: new Date()
      };
      user.markModified('geofence');
    }

    // Step 4: Update location
    console.log("📝 Updating location to:", { latitude, longitude });
    user.location = { latitude, longitude, updatedAt: new Date() };
    user.markModified('location');

    // Step 5: Save and log result
    const savedUser = await user.save();
    console.log("✅ User saved successfully");
    console.log("📦 Saved location:", savedUser.location);
    console.log("📦 Saved geofence:", savedUser.geofence);

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      location: savedUser.location,
      geofence: savedUser.geofence
    });

  } catch (error) {
    console.error('❌ Error updating location:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




// Fetch location and geofence by userId
exports.getLocationByUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'name location role geofence');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.location) return res.status(404).json({ error: 'Location not found' });

    return res.status(200).json({
      userId: user._id,
      name: user.name,
      role: user.role,
      location: user.location,
      geofence: user.geofence
    });
  } catch (error) {
    console.error('Error fetching location by user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch all elderly users' locations and geofences in a group
exports.getElderlyLocationsByGroup = async (req, res) => {
  try {
    const users = await User.find({
      groups: req.params.groupId,
      role: 'elderly',
      location: { $exists: true }
    }, 'name location role geofence');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching elderly locations by group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
