
import { StreamFailureViewer } from "@/components/StreamFailureViewer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Stream Failure Viewer</h1>
          <p className="text-gray-600">Monitor and analyze IoT stream failures with advanced filtering and sorting capabilities</p>
        </div>
        <StreamFailureViewer />
      </div>
    </div>
  );
};

export default Index;
