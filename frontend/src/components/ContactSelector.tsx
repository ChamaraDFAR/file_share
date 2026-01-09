import { useState, useEffect } from 'react';
import { contactService, Contact } from '../services/contactService';
import './ContactSelector.css';

interface ContactSelectorProps {
  selectedContacts: string[];
  onSelectionChange: (contactIds: string[]) => void;
}

function ContactSelector({ selectedContacts, onSelectionChange }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', isGroup: false });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await contactService.getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await contactService.syncFromWhatsApp();
      await loadContacts();
    } catch (error) {
      console.error('Error syncing contacts:', error);
      alert('Failed to sync contacts. Make sure WhatsApp is connected.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await contactService.createContact(newContact);
      setNewContact({ name: '', phoneNumber: '', isGroup: false });
      setShowAddForm(false);
      await loadContacts();
    } catch (error: any) {
      console.error('Error adding contact:', error);
      alert(error.response?.data?.error || 'Failed to add contact');
    }
  };

  const toggleContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      onSelectionChange(selectedContacts.filter(id => id !== contactId));
    } else {
      onSelectionChange([...selectedContacts, contactId]);
    }
  };

  if (loading) {
    return <div className="contact-selector loading">Loading contacts...</div>;
  }

  return (
    <div className="contact-selector">
      <div className="contact-selector-header">
        <h3>Select Recipients</h3>
        <div className="contact-actions">
          <button onClick={handleSync} className="btn-secondary">
            Sync from WhatsApp
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-secondary">
            {showAddForm ? 'Cancel' : 'Add Contact'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-contact-form">
          <input
            type="text"
            placeholder="Contact Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={newContact.phoneNumber}
            onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={newContact.isGroup}
              onChange={(e) => setNewContact({ ...newContact, isGroup: e.target.checked })}
            />
            Is Group
          </label>
          <button onClick={handleAddContact} className="btn-primary">
            Add Contact
          </button>
        </div>
      )}

      <div className="contacts-list">
        {contacts.length === 0 ? (
          <p className="no-contacts">No contacts found. Sync from WhatsApp or add manually.</p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContacts.includes(contact.id) ? 'selected' : ''}`}
              onClick={() => toggleContact(contact.id)}
            >
              <input
                type="checkbox"
                checked={selectedContacts.includes(contact.id)}
                onChange={() => toggleContact(contact.id)}
              />
              <div className="contact-info">
                <span className="contact-name">
                  {contact.name}
                  {contact.isGroup && <span className="group-badge">Group</span>}
                </span>
                <span className="contact-phone">{contact.phoneNumber}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedContacts.length > 0 && (
        <div className="selected-count">
          {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

export default ContactSelector;
