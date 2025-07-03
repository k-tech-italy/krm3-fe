
export default function LoadSpinner() {
    return (
        <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-krm3-primay mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
}