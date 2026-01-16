export default function OrderPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Your Book</h1>
        <p className="text-gray-600 mt-2">Get a beautiful printed copy delivered to your door</p>
      </div>

      {/* Order flow will be implemented in Issues #27-31 */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <p className="text-gray-500 text-center">Order flow coming soon</p>
      </div>
    </div>
  );
}
