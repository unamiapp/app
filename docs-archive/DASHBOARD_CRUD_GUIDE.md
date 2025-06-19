# Dashboard CRUD Operations Guide

This guide explains how to implement consistent Create, Read, Update, and Delete (CRUD) operations across all dashboard features using our new utility hooks and components.

## Overview

We've created several utility hooks and components to standardize data management:

1. `useCrudOperations` - A hook for standardized CRUD operations
2. `useFormValidation` - A hook for form validation
3. `DataTable` - A component for displaying and managing data
4. `ConfirmDialog` - A component for confirming critical actions

## Implementation Guide

### 1. Basic CRUD Implementation

Here's how to implement CRUD operations for any collection:

```tsx
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { useEffect } from 'react';

// Define your data type
interface Resource {
  id: string;
  title: string;
  description: string;
  // other fields...
}

export function ResourcesManager() {
  // Initialize the CRUD hook
  const {
    items: resources,
    loading,
    error,
    create,
    update,
    remove,
    subscribe
  } = useCrudOperations<Resource>('resources', {
    successMessages: {
      create: 'Resource created successfully',
      update: 'Resource updated successfully',
      delete: 'Resource deleted successfully'
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe([/* optional query constraints */]);
    return () => unsubscribe();
  }, [subscribe]);

  // Create a new item
  const handleCreate = async (data: Omit<Resource, 'id'>) => {
    await create(data);
  };

  // Update an item
  const handleUpdate = async (id: string, data: Partial<Resource>) => {
    await update(id, data);
  };

  // Delete an item
  const handleDelete = async (id: string) => {
    await remove(id);
  };

  // Render your UI
  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

### 2. Form Validation

Use the `useFormValidation` hook for consistent form handling:

```tsx
import { useFormValidation } from '@/hooks/useFormValidation';

// Define your form data type
interface ResourceFormData {
  title: string;
  description: string;
  category: string;
}

export function ResourceForm({ onSubmit }) {
  // Define initial values
  const initialValues: ResourceFormData = {
    title: '',
    description: '',
    category: 'safety'
  };

  // Define validation rules
  const validationRules = {
    title: [
      { validate: (value) => value.trim() !== '', message: 'Title is required' },
      { validate: (value) => value.length <= 100, message: 'Title must be 100 characters or less' }
    ],
    description: [
      { validate: (value) => value.trim() !== '', message: 'Description is required' }
    ]
  };

  // Initialize the form validation hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  } = useFormValidation<ResourceFormData>(initialValues, validationRules);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.title && errors.title && (
          <p className="text-red-500 text-sm">{errors.title}</p>
        )}
      </div>
      
      {/* Other form fields */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### 3. Data Display with DataTable

Use the `DataTable` component for consistent data display:

```tsx
import DataTable from '@/components/ui/DataTable';

function ResourcesList({ resources, loading, onEdit, onDelete }) {
  // Define table columns
  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true
    },
    {
      key: 'category',
      header: 'Category',
      render: (resource) => resource.category.toUpperCase()
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (resource) => new Date(resource.createdAt).toLocaleDateString()
    }
  ];

  // Actions for each row
  const renderActions = (resource) => (
    <div className="flex space-x-2">
      <button onClick={() => onEdit(resource)}>Edit</button>
      <button onClick={() => onDelete(resource.id)}>Delete</button>
    </div>
  );

  return (
    <DataTable
      data={resources}
      columns={columns}
      keyField="id"
      isLoading={loading}
      emptyMessage="No resources found"
      actions={renderActions}
    />
  );
}
```

### 4. Confirmation Dialogs

Use the `ConfirmDialog` component for delete confirmations:

```tsx
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function ResourceManager() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const { remove, loading } = useCrudOperations<Resource>('resources');

  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (resourceToDelete) {
      await remove(resourceToDelete);
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  return (
    <>
      {/* Your component content */}
      
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </>
  );
}
```

## Best Practices

1. **Use Real-time Subscriptions**: For critical data, use the `subscribe` method to get real-time updates.

2. **Handle Loading States**: Always show loading indicators during CRUD operations.

3. **Provide Feedback**: Use toast notifications (built into `useCrudOperations`) to inform users about operation results.

4. **Confirm Destructive Actions**: Always use `ConfirmDialog` for delete operations.

5. **Validate Forms**: Use `useFormValidation` for all forms to ensure data integrity.

6. **Optimize Renders**: Use React's `useMemo` and `useCallback` for performance optimization.

7. **Error Handling**: Always handle errors gracefully and provide user-friendly error messages.

## Example Implementation

For a complete example, see the Resources feature implementation which demonstrates all these patterns working together.