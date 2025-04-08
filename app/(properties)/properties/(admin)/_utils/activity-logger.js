import { supabase } from "@/utils/supabase/client";

export const LOG_TYPES = {
  PROPERTY: 'property',
  USER: 'user',
  SETTINGS: 'settings',
  SYSTEM: 'system',
};

export const LOG_ACTIONS = {
  // Property actions
  PROPERTY_CREATE: 'property_create',
  PROPERTY_UPDATE: 'property_update',
  PROPERTY_DELETE: 'property_delete',
  PROPERTY_APPROVE: 'property_approve',
  PROPERTY_REJECT: 'property_reject',
  PROPERTY_FEATURE: 'property_feature',
  
  // User actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_UPDATE: 'user_update',
  USER_BAN: 'user_ban',
  USER_UNBAN: 'user_unban',
  ROLE_CHANGE: 'role_change',
  
  // Settings actions
  SETTINGS_UPDATE: 'settings_update',
  EMAIL_TEMPLATE_UPDATE: 'email_template_update',
  
  // System actions
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_RESTORE: 'system_restore',
  SYSTEM_MAINTENANCE: 'system_maintenance',
};

export const LOG_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export async function logActivity({
  type,
  action,
  details,
  userId,
  status = LOG_STATUS.SUCCESS,
  metadata = {}
}) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        type,
        action,
        details,
        user_id: userId,
        status,
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { success: false, error };
  }
}

// Helper function to format log details
export function formatLogDetails(action, data) {
  switch (action) {
    case LOG_ACTIONS.PROPERTY_APPROVE:
      return `Approved property: ${data.title}`;
    
    case LOG_ACTIONS.PROPERTY_REJECT:
      return `Rejected property: ${data.title}${data.reason ? ` - Reason: ${data.reason}` : ''}`;
    
    case LOG_ACTIONS.ROLE_CHANGE:
      return `Changed user role from ${data.oldRole} to ${data.newRole}`;
    
    case LOG_ACTIONS.USER_BAN:
      return `Banned user: ${data.email}${data.reason ? ` - Reason: ${data.reason}` : ''}`;
    
    case LOG_ACTIONS.USER_UNBAN:
      return `Unbanned user: ${data.email}`;
    
    case LOG_ACTIONS.SETTINGS_UPDATE:
      return `Updated ${data.section} settings`;
    
    default:
      return data.details || 'No details provided';
  }
}

// Helper function to get activity description
export function getActivityDescription(log) {
  const baseText = {
    [LOG_TYPES.PROPERTY]: 'Property',
    [LOG_TYPES.USER]: 'User',
    [LOG_TYPES.SETTINGS]: 'Settings',
    [LOG_TYPES.SYSTEM]: 'System',
  }[log.type];

  const actionText = log.action.split('_').join(' ');
  
  return `${baseText} ${actionText}`;
}