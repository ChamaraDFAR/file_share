import express from 'express';
import { contactService } from '../services/contact.service';

const router = express.Router();

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (error: any) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: error.message || 'Failed to get contacts' });
  }
});

// Add contact
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber, isGroup, groupId } = req.body;
    
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const contact = await contactService.createContact({
      name,
      phoneNumber,
      isGroup: isGroup || false,
      groupId: groupId || null,
    });

    res.json(contact);
  } catch (error: any) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: error.message || 'Failed to create contact' });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const { name, phoneNumber, isGroup, groupId } = req.body;
    const contact = await contactService.updateContact(req.params.id, {
      name,
      phoneNumber,
      isGroup,
      groupId,
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error: any) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: error.message || 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    await contactService.deleteContact(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete contact' });
  }
});

// Sync contacts from WhatsApp
router.post('/sync', async (req, res) => {
  try {
    const contacts = await contactService.syncFromWhatsApp();
    res.json({ message: 'Contacts synced', count: contacts.length, contacts });
  } catch (error: any) {
    console.error('Sync contacts error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync contacts' });
  }
});

export default router;
