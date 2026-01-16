export default function GeneratingPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  return (
    <div className="max-w-xl mx-auto text-center space-y-8 py-16">
      <div className="animate-pulse">
        <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✨</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Creating Your Story</h1>
        <p className="text-gray-600 mt-2">Our AI is crafting your personalized book...</p>
      </div>

      {/* Progress indicator will be implemented with generation jobs */}
      <div className="bg-gray-200 rounded-full h-2 w-full">
        <div className="bg-purple-600 h-2 rounded-full w-1/3 transition-all duration-500"></div>
      </div>

      <p className="text-sm text-gray-500">This usually takes 2-3 minutes</p>
    </div>
  );
}
