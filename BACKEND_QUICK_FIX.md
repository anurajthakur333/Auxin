# Quick Backend Fix for Employee Appointments Access

## The Problem
```
❌ Admin access denied - email mismatch: something@gmail.com vs admin@gmail.com
```

The admin endpoint is checking for admin email specifically, blocking employees.

## Quick Fix (5 minutes)

### Step 1: Find Your Admin Appointments Route

Look for a file like:
- `routes/appointments.js`
- `routes/admin.js`
- `server/routes/appointments.ts`
- Or wherever you have `/api/appointments/admin/all`

### Step 2: Modify the Auth Check

**BEFORE (Current Code):**
```javascript
// This is probably what you have:
const admin = await Admin.findOne({ email: decoded.email });
if (!admin || admin.email !== 'admin@gmail.com') {
  return res.status(401).json({ error: 'Admin access denied - email mismatch' });
}
```

**AFTER (Fixed Code):**
```javascript
// Check for admin OR employee
const admin = await Admin.findOne({ email: decoded.email });
const employee = await Employee.findOne({ 
  email: decoded.email,
  isActive: true 
});

if (!admin && !employee) {
  return res.status(401).json({ error: 'Unauthorized access' });
}

// Set user type for later use
req.user = admin || employee;
req.userType = admin ? 'admin' : 'employee';
```

### Step 3: Complete Route Example

```javascript
// GET /api/appointments/admin/all
router.get('/admin/all', async (req, res) => {
  try {
    // Auth check - accepts both admin and employee
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check admin OR employee
    const admin = await Admin.findOne({ email: decoded.email });
    const employee = await Employee.findOne({ 
      email: decoded.email,
      isActive: true 
    });

    if (!admin && !employee) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Rest of your existing code...
    const { page = 1, limit = 20, status, paymentStatus, date, search } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
    if (date) query.date = date;
    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
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
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});
```

### Step 4: Also Create Employee-Specific Endpoint (Optional)

```javascript
// GET /api/appointments/employee/all
router.get('/employee/all', async (req, res) => {
  // Same code as above, or just redirect to admin/all
  // The frontend will try this first, then fallback to admin/all
  return router.get('/admin/all')(req, res);
});
```

---

## That's It!

After making this change:
1. Restart your backend server
2. Employee login will work
3. Employee dashboard will be able to fetch appointments

The frontend is already set up to handle this!

