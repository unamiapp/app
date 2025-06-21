# Authority Dashboard - Jurisdiction Explained

## What is a Jurisdiction?

In the UNCIP system, a **jurisdiction** refers to the geographical area or administrative region under an authority's responsibility. This concept is central to how the Authority Dashboard functions and how data is organized within the system.

## Key Aspects of Jurisdictions

### 1. Geographical Boundaries
- Each authority user is assigned to a specific geographical area
- Jurisdictions can be based on municipal boundaries, police districts, or administrative regions
- Jurisdictions may have sub-jurisdictions for more granular control

### 2. Data Access Control
- Authority users can only access data within their assigned jurisdiction
- This ensures data privacy and security
- Prevents unauthorized access to sensitive information

### 3. Alert Management
- Alerts are automatically routed to the appropriate jurisdiction
- Authority users receive notifications for alerts within their jurisdiction
- Cross-jurisdiction alerts can be coordinated through the system

### 4. Statistical Analysis
- Jurisdiction-specific statistics and reports
- Trend analysis within geographical boundaries
- Comparison between different jurisdictions for benchmarking

## Jurisdiction Data in the Dashboard

The Authority Dashboard displays several jurisdiction-specific sections:

### Alerts Section
- Shows all alerts within the authority's jurisdiction
- Filters for active, resolved, and all alerts
- Prioritizes alerts based on severity and recency

### Statistics Section
- Displays key metrics for the jurisdiction:
  - Number of registered children
  - Active alerts
  - Resolved cases
  - School participation rates

### Reports Section
- Generates jurisdiction-specific reports
- Provides analysis of trends within the jurisdiction
- Allows comparison with historical data

## Jurisdiction Management

Authority administrators can:
- Define jurisdiction boundaries
- Assign authority users to specific jurisdictions
- Set up notification rules for jurisdiction-specific alerts
- Configure data sharing between jurisdictions when necessary

## Technical Implementation

The jurisdiction system is implemented through:
- Firestore security rules that enforce jurisdiction-based access control
- Data models that include jurisdiction fields
- API endpoints that filter data based on the user's assigned jurisdiction
- UI components that display only relevant jurisdiction data

## Future Enhancements

Planned enhancements to the jurisdiction system include:
- Interactive maps showing jurisdiction boundaries
- Real-time collaboration tools for cross-jurisdiction coordination
- Advanced analytics for jurisdiction-specific trends
- Mobile support for field operations within jurisdictions