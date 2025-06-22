'use client';

import { useState, useEffect } from 'react';

export default function TestChildrenPage() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/debug/children?parentId=4YobN3dN4ohIgtR85Qjl7Wh1hsB2');
        const data = await response.json();
        setChildren(data.children || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Children Page</h1>
      <p>Found {children.length} children</p>
      <div className="mt-4">
        {children.map((child: any) => (
          <div key={child.id} className="border p-4 mb-2">
            <h3>{child.firstName} {child.lastName}</h3>
            <p>ID: {child.id}</p>
            <p>Born: {child.dateOfBirth}</p>
          </div>
        ))}
      </div>
    </div>
  );
}