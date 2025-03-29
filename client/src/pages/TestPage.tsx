import { Link } from 'wouter';
import TestRunner from '@/components/TestRunner';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">UI Test Dashboard</h1>
          <Link href="/">
            <a className="text-blue-600 dark:text-blue-400 hover:underline">
              Return to Dashboard
            </a>
          </Link>
        </div>

        <div className="space-y-6">
          <TestRunner />
        </div>
      </div>
    </div>
  );
};

export default TestPage;