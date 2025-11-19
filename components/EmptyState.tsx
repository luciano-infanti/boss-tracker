import { Upload } from 'lucide-react';

export default function EmptyState({ worldName }: { worldName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <Upload size={48} className="text-gray-600 mb-4" />
      <h2 className="text-xl font-semibold text-gray-300 mb-2">
        No Data Available
      </h2>
      <p className="text-gray-400">
        {worldName 
          ? `Upload the RubinOT_Kills_${worldName}.txt file to see statistics`
          : 'Upload the RubinOT_Kills_ALL_WORLDS_COMBINED.txt file to see global statistics'
        }
      </p>
    </div>
  );
}
