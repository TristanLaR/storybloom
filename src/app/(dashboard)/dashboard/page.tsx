export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
        <p className="text-gray-600 mt-2">Your personalized children&apos;s book collection</p>
      </div>

      {/* Book grid will be implemented in Issue #32 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">No books yet</p>
          <p className="text-sm text-gray-400 mt-2">Create your first book to get started</p>
        </div>
      </div>
    </div>
  );
}
