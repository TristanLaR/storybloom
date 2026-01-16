export default function BookEditorPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Editor</h1>
        <p className="text-gray-600 mt-2">Edit and preview your book</p>
      </div>

      {/* Book editor will be implemented in later issues */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <p className="text-gray-500 text-center">Book editor coming soon</p>
      </div>
    </div>
  );
}
