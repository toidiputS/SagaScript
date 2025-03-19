import { type Series } from "@shared/schema";

interface SeriesProgressProps {
  title: string;
  series: Series;
}

export default function SeriesProgress({ title, series }: SeriesProgressProps) {
  // Calculate progress percentage
  const progressPercentage = Math.round((series.currentBook / series.totalBooks) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
      <div className="flex items-center">
        <div className="p-3 bg-success/10 rounded-lg">
          <i className="ri-book-open-line text-xl text-success"></i>
        </div>
        <div className="ml-4">
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-800">{progressPercentage}%</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-success h-2 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex justify-between">
          <span>Book {series.currentBook} of {series.totalBooks}</span>
          <span>{series.title}</span>
        </div>
      </div>
    </div>
  );
}
