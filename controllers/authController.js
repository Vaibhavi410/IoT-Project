const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getFirebaseAuth, isFirebaseConfigured } = require('../config/firebase');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const normalizeEmail = (email) => {
  const normalized = email?.trim().toLowerCase();
  return normalized || undefined;
};

const normalizePhone = (phone) => {
  const normalized = phone?.replace(/\s+/g, '');
  return normalized || undefined;
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  farmLocation: user.farmLocation,
  farmArea: user.farmArea,
  authProviders: user.authProviders,
  emailVerified: user.emailVerified,
  phoneVerified: user.phoneVerified,
});

// @desc Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      authProviders: ['password'],
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check user exists and get password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc Update user profile
// @route PUT /api/auth/update
const updateProfile = async (req, res) => {
  try {
    const { name, farmLocation, farmArea, phoneNumber } = req.body;
    const updates = {};
    const unset = {};

    if (name !== undefined) updates.name = name;
    if (farmLocation !== undefined) updates.farmLocation = farmLocation;
    if (farmArea !== undefined) updates.farmArea = farmArea;
    if (phoneNumber !== undefined) {
      const normalizedPhone = normalizePhone(phoneNumber);

      if (normalizedPhone) {
        updates.phoneNumber = normalizedPhone;
      } else {
        unset.phoneNumber = 1;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      Object.keys(unset).length ? { $set: updates, $unset: unset } : updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: buildUserResponse(user),
    });
  } catch (error) {
    const statusCode = error.code === 11000 ? 409 : 500;

    res.status(statusCode).json({
      success: false,
      message:
        error.code === 11000
          ? 'That email or phone number is already in use'
          : 'Server error during update',
      error: error.message,
    });
  }
};

// @desc Sign in/up with Firebase and receive backend JWT
// @route POST /api/auth/firebase
const firebaseLogin = async (req, res) => {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Admin is not configured on the server',
      });
    }

    const { idToken, name } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required',
      });
    }

    const decodedToken = await getFirebaseAuth().verifyIdToken(idToken);
    const firebaseUser = await getFirebaseAuth().getUser(decodedToken.uid);

    const normalizedEmail = normalizeEmail(firebaseUser.email || decodedToken.email);
    const normalizedPhone = normalizePhone(
      firebaseUser.phoneNumber || decodedToken.phone_number
    );
    const authProviders = [
      ...(firebaseUser.providerData || []).map((provider) => provider.providerId),
      decodedToken.firebase?.sign_in_provider,
    ].filter(Boolean);
    const displayName =
      firebaseUser.displayName ||
      decodedToken.name ||
      name ||
      (normalizedEmail ? normalizedEmail.split('@')[0] : '') ||
      normalizedPhone ||
      'Pestify User';

    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user && normalizedPhone) {
      user = await User.findOne({ phoneNumber: normalizedPhone });
    }

    if (!user) {
      user = new User({
        firebaseUid: decodedToken.uid,
        name: displayName,
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        authProviders,
        emailVerified: Boolean(firebaseUser.emailVerified || decodedToken.email_verified),
        phoneVerified: Boolean(normalizedPhone),
      });
    } else {
      user.firebaseUid = user.firebaseUid || decodedToken.uid;
      user.name = user.name || displayName;
      user.email = user.email || normalizedEmail;
      user.phoneNumber = user.phoneNumber || normalizedPhone;
      user.emailVerified =
        user.emailVerified ||
        Boolean(firebaseUser.emailVerified || decodedToken.email_verified);
      user.phoneVerified = user.phoneVerified || Boolean(normalizedPhone);
      user.authProviders = Array.from(
        new Set([...(user.authProviders || []), ...authProviders])
      );
    }

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Firebase sign-in successful',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    const statusCode = error.code === 11000 ? 409 : 401;

    res.status(statusCode).json({
      success: false,
      message:
        error.code === 11000
          ? 'That email or phone number is already linked to another account'
          : 'Invalid or expired Firebase token',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  firebaseLogin,
  getMe,
  updateProfile,
};
