import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getChildren, getChildById, createChild, updateChild, deleteChild, getChildrenByParentId, getChildrenBySchool } from '@/lib/firebase/childrenApi';

export async function GET(request: NextRequest) {
  try {
    // 1. Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // 2. Get user role and ID for hybrid access control
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // 3. Handle specific child request
    if (id) {
      // Get the child
      const child = await getChildById(id);
      
      if (!child) {
        return NextResponse.json({ 
          success: false, 
          error: 'Child not found' 
        }, { status: 404 });
      }
      
      // 4. Hybrid access control - role + relationship
      const hasAccess = 
        userRole === 'admin' || 
        userRole === 'authority' || 
        (userRole === 'school' && child.schoolId === (session.user as any).schoolId) ||
        (userRole === 'parent' && (
          // New parentId model
          child.parentId === userId ||
          // Legacy guardians model
          (child.guardians && child.guardians.includes(userId))
        ));
      
      if (!hasAccess) {
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
    
    // 5. Handle children listing with role-appropriate filtering
    let children: any[] = [];
    
    if (userRole === 'admin' || userRole === 'authority') {
      // Admins and authorities can see all children
      children = await getChildren();
    } else if (userRole === 'school') {
      // Schools can see children in their school
      const schoolId = (session.user as any).schoolId;
      if (schoolId) {
        children = await getChildrenBySchool(schoolId);
      }
    } else if (userRole === 'parent') {
      // Parents can only see their own children
      children = await getChildrenByParentId(userId);
    }
    
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
    // 1. Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // 2. Check role-based access control
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
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
    
    // 3. Set up hybrid parent-child relationship
    let childData = { ...data };
    
    if (userRole === 'parent') {
      // For parents, set both parentId (new model) and guardians (legacy model)
      childData.parentId = userId;
      
      // Maintain guardians array for backward compatibility
      let guardians = data.guardians || [];
      if (!guardians.includes(userId)) {
        guardians = [...guardians, userId];
      }
      childData.guardians = guardians;
    }
    
    // Set createdBy for audit trail
    childData.createdBy = userId;
    
    // Create child
    const child = await createChild(childData);
    
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
    // 1. Get session and verify authentication
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
    
    // 2. Get the child to check access
    const existingChild = await getChildById(id);
    
    if (!existingChild) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child not found' 
      }, { status: 404 });
    }
    
    // 3. Hybrid access control - role + relationship
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
    const hasAccess = 
      userRole === 'admin' || 
      (userRole === 'school' && existingChild.schoolId === (session.user as any).schoolId) ||
      (userRole === 'parent' && (
        // New parentId model
        existingChild.parentId === userId ||
        // Legacy guardians model
        (existingChild.guardians && existingChild.guardians.includes(userId))
      ));
    
    if (!hasAccess) {
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
    // 1. Get session and verify authentication
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
    
    // 2. Get the child to check access
    const existingChild = await getChildById(id);
    
    if (!existingChild) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child not found' 
      }, { status: 404 });
    }
    
    // 3. Hybrid access control - role + relationship
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
    const hasAccess = 
      userRole === 'admin' || 
      (userRole === 'parent' && (
        // New parentId model
        existingChild.parentId === userId ||
        // Legacy guardians model
        (existingChild.guardians && existingChild.guardians.includes(userId))
      ));
    
    if (!hasAccess) {
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