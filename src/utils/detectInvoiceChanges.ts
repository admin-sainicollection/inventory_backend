export const detectInvoiceChanges = (oldData: any, newData: any, fieldsToTrack: string[] = []): Array<{field: string, oldValue: any, newValue: any}> => {
    const changes: Array<{field: string, oldValue: any, newValue: any}> = [];
    
    // If no specific fields to track, track all fields
    const fields = fieldsToTrack.length > 0 ? fieldsToTrack : Object.keys(newData);
    
    for (const field of fields) {
      // Skip internal fields
      if (field === '_id' || field === '__v' || field === 'createdAt' || field === 'updatedAt') continue;
      
      // Handle nested objects and arrays
      if (JSON.stringify(oldData[field]) !== JSON.stringify(newData[field])) {
        changes.push({
          field,
          oldValue: oldData[field],
          newValue: newData[field]
        });
      }
    }
    
    return changes;
  };