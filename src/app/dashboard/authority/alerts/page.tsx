import DashboardLayout from '@/components/layout/DashboardLayout';
import AlertsList from '@/components/emergency/AlertsList';

export default function AuthorityAlertsPage() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Active Alerts</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage all active missing child alerts in your jurisdiction.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-l-md text-white bg-primary-600 hover:bg-primary-700 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                All Alerts
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                Active
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                Resolved
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Search Alerts
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Search for specific alerts by name, location, or other details.</p>
              </div>
              <form className="mt-5 sm:flex sm:items-center">
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search alerts"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
          
          <AlertsList role="authority" />
        </div>
      </div>
    </DashboardLayout>
  );
}