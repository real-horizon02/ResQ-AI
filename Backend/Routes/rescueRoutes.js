import express from 'express';
const router = express.Router();

// In-memory store for rescue applications (persists until server restart)
let rescueApplications = [];

// POST /api/rescue-applications  — volunteer submits a request
router.post('/rescue-applications', (req, res) => {
  const { volunteerId, incidentId, details } = req.body;
  const newApp = {
    id: `app-${Date.now()}`,
    volunteerId,
    incidentId,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  rescueApplications.push(newApp);
  console.log('[RescueRoute] New application:', newApp.id, 'volunteer:', volunteerId);
  res.json({ success: true, application: newApp });
});

// GET /api/rescue-applications  — admin fetches all
router.get('/rescue-applications', (req, res) => {
  res.json(rescueApplications);
});

// PATCH /api/rescue-applications/:id  — admin approves or rejects
router.patch('/rescue-applications/:id', (req, res) => {
  const { status } = req.body;
  const app = rescueApplications.find(a => a.id === req.params.id);
  if (app) {
    app.status = status;
    console.log('[RescueRoute] Updated application:', app.id, '->', status);
    res.json({ success: true, application: app });
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

export default router;
