import express from 'express';
import { logService } from '../services/log.service';

const router = express.Router();

// Get logs with filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      status,
      contactId,
      fileId,
      startDate,
      endDate,
      limit,
      offset,
    } = req.query;

    const filters = {
      type: type as string | undefined,
      status: status as string | undefined,
      contactId: contactId as string | undefined,
      fileId: fileId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string, 10) : 100,
      offset: offset ? parseInt(offset as string, 10) : 0,
    };

    const logs = await logService.getLogs(filters);
    res.json(logs);
  } catch (error: any) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: error.message || 'Failed to get logs' });
  }
});

// Get log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await logService.getLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json(log);
  } catch (error: any) {
    console.error('Get log error:', error);
    res.status(500).json({ error: error.message || 'Failed to get log' });
  }
});

// Export logs
router.get('/export/csv', async (req, res) => {
  try {
    const csv = await logService.exportLogsAsCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
    res.send(csv);
  } catch (error: any) {
    console.error('Export logs error:', error);
    res.status(500).json({ error: error.message || 'Failed to export logs' });
  }
});

export default router;
