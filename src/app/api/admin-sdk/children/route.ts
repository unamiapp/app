import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getChildren, getChildById, createChild, updateChild, deleteChild } from '@/lib/firebase/childrenApi';

export async function GET(request: NextRequest) {
  try {
    // Get the session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const parentId = searchParams.get('parentId') || (session.user as any).id;
    
    if (id) {
      // Get a specific child by ID
      const child = await getChildById(id);
      
      if (!child) {
        return NextResponse.json({ 
          success: false, 
          error: 'Child not found' 
        }, { status: 404 });
      }
      
      // Check if the user has access to this child
      const userRole = (session.user as any).role;
      if (userRole !== 'admin' && 
          userRole !== 'authority' && 
          userRole !== 'school' && 
          (!child.guardians || !child.guardians.includes(parentId))) {
        return NextResponse.json({ 
          success: false, 
          error: 'Unauthorized access to this child' 
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        success: true, 
        child
      });
    }
    
    // Get all children with optional parent filter
    let children = await getChildren(
      (session.user as any).role === 'parent' ? parentId : undefined
    );
    
    // Calculate pagination
    const totalCount = children.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedChildren = children.slice(startIndex, endIndex);
    
    return NextResponse.json({ 
      success: true,
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      children: paginatedChildren
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch children',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Check if user can create children
    const userRole = (session.user as any).role;
    if (userRole !== 'parent' && userRole !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only parents and admins can create child profiles' 
      }, { status: 403 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.dateOfBirth || !data.gender) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Ensure guardians includes current user if parent
    let guardians = data.guardians || [];
    if (userRole === 'parent' && !guardians.includes((session.user as any).id)) {
      guardians = [...guardians, (session.user as any).id];
    }
    
    // Create child
    const child = await createChild({
      ...data,
      guardians
    });
    
    return NextResponse.json({ 
      success: true, 
      child
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create child',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child ID is required' 
      }, { status: 400 });
    }
    
    // Get the child to check access
    const existingChild = await getChildById(id);
    
    if (!existingChild) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child not found' 
      }, { status: 404 });
    }
    
    // Check if the user has access to this child
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
    if (userRole !== 'admin' && 
        (!existingChild.guardians || !existingChild.guardians.includes(userId))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access to this child' 
      }, { status: 403 });
    }
    
    const data = await request.json();
    
    // Update child
    const updatedChild = await updateChild(id, data);
    
    return NextResponse.json({ 
      success: true, 
      child: updatedChild
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update child',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child ID is required' 
      }, { status: 400 });
    }
    
    // Get the child to check access
    const existingChild = await getChildById(id);
    
    if (!existingChild) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child not found' 
      }, { status: 404 });
    }
    
    // Check if the user has access to this child
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
    if (userRole !== 'admin' && 
        (!existingChild.guardians || !existingChild.guardians.includes(userId))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access to this child' 
      }, { status: 403 });
    }
    
    // Delete child
    await deleteChild(id);
    
    return NextResponse.json({ 
      success: true, 
      id,
      message: 'Child deleted successfully'
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete child',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}