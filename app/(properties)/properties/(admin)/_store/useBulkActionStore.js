import { create } from 'zustand';
import { supabase } from "@/utils/supabase/client";
import { logActivity, LOG_TYPES, LOG_ACTIONS } from '../_utils/activity-logger';

const useBulkActionStore = create((set, get) => ({
  selectedItems: [],
  processing: false,
  error: null,
  exportFormat: 'csv', // or 'excel'
  
  // Select/deselect items
  toggleItem: (itemId) => {
    set((state) => ({
      selectedItems: state.selectedItems.includes(itemId)
        ? state.selectedItems.filter(id => id !== itemId)
        : [...state.selectedItems, itemId]
    }));
  },

  // Select/deselect all items
  toggleAll: (items) => {
    set((state) => ({
      selectedItems: state.selectedItems.length === items.length
        ? []
        : items.map(item => item.id)
    }));
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedItems: [] });
  },

  // Bulk approve properties
  bulkApproveProperties: async (userId) => {
    try {
      set({ processing: true });
      const { selectedItems } = get();

      const { data, error } = await supabase
        .from('properties')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .in('id', selectedItems)
        .select();

      if (error) throw error;

      // Log activity
      await logActivity({
        type: LOG_TYPES.PROPERTY,
        action: LOG_ACTIONS.APPROVE,
        details: `Bulk approved ${selectedItems.length} properties`,
        userId,
        metadata: { propertyIds: selectedItems }
      });

      // Send notifications
      await get().sendBulkNotifications(data, 'approved');

      set({ selectedItems: [], processing: false });
      return { success: true, count: data.length };
    } catch (error) {
      console.error('Error in bulk approve:', error);
      set({ error: error.message, processing: false });
      return { success: false, error };
    }
  },

  // Bulk reject properties 
  bulkRejectProperties: async (userId, reason) => {
    try {
      set({ processing: true });
      const { selectedItems } = get();

      const { data, error } = await supabase
        .from('properties')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedItems)
        .select();

      if (error) throw error;

      // Log activity
      await logActivity({
        type: LOG_TYPES.PROPERTY,
        action: LOG_ACTIONS.REJECT,
        details: `Bulk rejected ${selectedItems.length} properties`,
        userId,
        metadata: { propertyIds: selectedItems, reason }
      });

      // Send notifications
      await get().sendBulkNotifications(data, 'rejected', reason);

      set({ selectedItems: [], processing: false });
      return { success: true, count: data.length };
    } catch (error) {
      console.error('Error in bulk reject:', error);
      set({ error: error.message, processing: false });
      return { success: false, error };
    }
  },

  // Send bulk notifications
  sendBulkNotifications: async (properties, action, reason = null) => {
    try {
      const notifications = properties.map(property => ({
        type: `property_${action}`,
        user_id: property.user_id,
        property_id: property.id,
        reason,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      // Trigger email notifications
      await fetch('/api/admin/send-bulk-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties,
          action,
          reason,
        }),
      });

    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't throw - we don't want to fail the main action if notifications fail
    }
  },

  // Export data
  exportData: async (format = 'csv') => {
    try {
      set({ processing: true });
      const { selectedItems } = get();

      // Fetch full property data
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          user:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .in('id', selectedItems);

      if (error) throw error;

      // Format data for export
      const formattedData = data.map(property => ({
        ID: property.id,
        Title: property.title,
        Type: property.type,
        Price: property.price,
        Location: property.location,
        Status: property.status,
        Owner: `${property.user.first_name} ${property.user.last_name}`,
        'Owner Email': property.user.email,
        'Created At': new Date(property.created_at).toLocaleDateString(),
        'Updated At': new Date(property.updated_at).toLocaleDateString(),
      }));

      if (format === 'csv') {
        return get().exportToCsv(formattedData);
      } else if (format === 'excel') {
        return get().exportToExcel(formattedData);
      }

      set({ processing: false });
    } catch (error) {
      console.error('Error exporting data:', error);
      set({ error: error.message, processing: false });
      return { success: false, error };
    }
  },

  // Export to CSV
  exportToCsv: (data) => {
    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => 
            typeof row[header] === 'string' ? `"${row[header]}"` : row[header]
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `property-export-${new Date().toISOString()}.csv`;
      link.click();

      return { success: true };
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return { success: false, error };
    }
  },

  // Export to Excel
  exportToExcel: async (data) => {
    try {
      // You'll need to install and import xlsx library
      const XLSX = (await import('xlsx')).default;
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Properties');
      
      XLSX.writeFile(workbook, `property-export-${new Date().toISOString()}.xlsx`);

      return { success: true };
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return { success: false, error };
    }
  },
}));

export default useBulkActionStore;