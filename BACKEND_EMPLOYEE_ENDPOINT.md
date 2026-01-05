# Backend Implementation for Employee Appointments Access

## Problem
The current `/api/appointments/admin/all` endpoint checks for admin email mismatch, preventing employees from accessing appointments.

## Solution
Create a new endpoint `/api/appointments/employee/all` that allows employees to fetch all appointments, or modify the existing admin endpoint to accept both admin and employee tokens.

---

## Option 1: Create New Employee Endpoint (Recommended)

### 1. Create Employee Middleware

```javascript
// middleware/employeeAuth.js or middleware/employeeAuth.ts

const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee'); // Adjust path as needed

const employeeAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is from employee login
    const employee = await Employee.findOne({ 
      email: decoded.email,
      isActive: true 
    });

    if (!employee) {
      return res.status(401).json({ error: 'Invalid employee token' });
    }

    req.employee = employee;
    next();
  } catch (error) {
    console.error('Employee auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = employeeAuth;
```

### 2. Create Employee Appointments Route

```javascript
// routes/appointments.js or routes/appointments.ts

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment'); // Adjust path
const employeeAuth = require('../middleware/employeeAuth'); // Adjust path

// GET /api/appointments/employee/all
router.get('/employee/all', employeeAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, paymentStatus, date, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    
    if (date) {
      query.date = date;
    }
    
    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Fetch appointments
    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Appointment.countDocuments(query);

    // Calculate summary
    const summary = {
      total: await Appointment.countDocuments({}),
      confirmed: await Appointment.countDocuments({ status: 'confirmed' }),
      pending: await Appointment.countDocuments({ status: 'pending' }),
      cancelled: await Appointment.countDocuments({ status: 'cancelled' })
    };

    res.json({
      appointments,
      summary,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching employee appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

module.exports = router;
```

---

## Option 2: Modify Existing Admin Endpoint to Accept Employees

### Modify Admin Middleware to Accept Both Admin and Employee

```javascript
// middleware/adminAuth.js (modify existing)

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Adjust path
const Employee = require('../models/Employee'); // Adjust path

const adminOrEmployeeAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try admin first
    const admin = await Admin.findOne({ email: decoded.email });
    if (admin) {
      req.user = admin;
      req.userType = 'admin';
      return next();
    }
    
    // Try employee
    const employee = await Employee.findOne({ 
      email: decoded.email,
      isActive: true 
    });
    
    if (employee) {
      req.user = employee;
      req.userType = 'employee';
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized access' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = adminOrEmployeeAuth;
```

### Update Admin Appointments Route

```javascript
// routes/appointments.js - Modify existing GET /api/appointments/admin/all

router.get('/admin/all', adminOrEmployeeAuth, async (req, res) => {
  try {
    // Now works for both admin and employee
    const { page = 1, limit = 20, status, paymentStatus, date, search } = req.query;
    
    // ... rest of the existing code stays the same
    // The query building and fetching logic remains unchanged
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});
```

---

## Option 3: Unified Auth Middleware (Best Practice)

Create a unified middleware that handles all auth types:

```javascript
// middleware/auth.js

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token type from decoded payload (you need to set this during login)
    // Or check all types
    let user = null;
    let userType = null;

    // Check admin
    if (decoded.type === 'admin' || !decoded.type) {
      user = await Admin.findOne({ email: decoded.email });
      if (user) {
        userType = 'admin';
        req.user = user;
        req.userType = 'admin';
        return next();
      }
    }

    // Check employee
    if (decoded.type === 'employee' || !decoded.type) {
      user = await Employee.findOne({ 
        email: decoded.email,
        isActive: true 
      });
      if (user) {
        userType = 'employee';
        req.user = user;
        req.userType = 'employee';
        return next();
      }
    }

    // Check regular user
    if (decoded.type === 'user' || !decoded.type) {
      user = await User.findOne({ email: decoded.email });
      if (user) {
        userType = 'user';
        req.user = user;
        req.userType = 'user';
        return next();
      }
    }

    return res.status(401).json({ error: 'Invalid token' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Specific middleware for admin/employee only
const adminOrEmployeeAuth = async (req, res, next) => {
  await authenticate(req, res, () => {
    if (req.userType === 'admin' || req.userType === 'employee') {
      return next();
    }
    return res.status(403).json({ error: 'Admin or employee access required' });
  });
};

module.exports = { authenticate, adminOrEmployeeAuth };
```

---

## Update Employee Login to Include Token Type

When creating employee login token, include type:

```javascript
// routes/auth.js - Employee login endpoint

router.post('/employee/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const employee = await Employee.findOne({ email: email.toLowerCase() });
    
    if (!employee || !employee.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare plain text password (as per requirement)
    if (employee.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token with type
    const token = jwt.sign(
      { 
        email: employee.email,
        employeeId: employee._id,
        type: 'employee' // Add type to token
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
```

---

## Complete Route File Example

```javascript
// routes/appointments.js

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { adminOrEmployeeAuth } = require('../middleware/auth');

// GET /api/appointments/employee/all
router.get('/employee/all', adminOrEmployeeAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
      query.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.date) {
      query.date = req.query.date;
    }
    if (req.query.search) {
      query.$or = [
        { userEmail: { $regex: req.query.search, $options: 'i' } },
        { userName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Appointment.countDocuments(query);

    const summary = {
      total: await Appointment.countDocuments({}),
      confirmed: await Appointment.countDocuments({ status: 'confirmed' }),
      pending: await Appointment.countDocuments({ status: 'pending' }),
      cancelled: await Appointment.countDocuments({ status: 'cancelled' })
    };

    res.json({
      appointments,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching employee appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Also update admin endpoint to use same middleware
router.get('/admin/all', adminOrEmployeeAuth, async (req, res) => {
  // Existing admin code - now works for employees too
});

module.exports = router;
```

---

## Quick Fix: Modify Existing Admin Route

If you want a quick fix, just modify your existing admin route to check for employee token:

```javascript
// In your existing /api/appointments/admin/all route

// Replace the admin email check with:
const token = req.headers.authorization?.replace('Bearer ', '');
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Check if admin OR employee
const admin = await Admin.findOne({ email: decoded.email });
const employee = await Employee.findOne({ 
  email: decoded.email,
  isActive: true 
});

if (!admin && !employee) {
  return res.status(401).json({ error: 'Unauthorized access' });
}

// Continue with existing appointment fetching logic...
```

---

## Testing

Test the endpoint:

```bash
# Get employee token from login
curl -X POST http://localhost:3001/api/auth/employee/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"password123"}'

# Use token to fetch appointments
curl http://localhost:3001/api/appointments/employee/all \
  -H "Authorization: Bearer <employee_token>"
```

---

**Choose the option that best fits your backend structure!**

