import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type SeriesCardProps = {
  series: any;
};

export default function SeriesCard({ series }: SeriesCardProps) {
  const [selectedSeries, setSelectedSeries] = useState<number | null>(series?.id || null);
  
  // Fetch books for this series
  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'books'],
    enabled: !!selectedSeries,
  });

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 transition-shadow hover:shadow-card-hover">
      <div className="md:flex">
        <div className="md:w-1/4 bg-gradient-to-br from-primary to-primary-dark text-white p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-heading font-bold">{series.title}</h3>
            <p className="text-primary-light text-sm mt-1">
              {series.genre ? `${series.genre} • ` : ""}
              {series.booksPlanned} {series.booksPlanned === 1 ? 'Book' : 'Books'} Planned
            </p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Series Progress</span>
              <span>{series.progress}%</span>
            </div>
            <div className="w-full bg-primary-light/30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: `${series.progress}%` }}></div>
            </div>
          </div>
        </div>
        <div className="md:w-3/4 p-5">
          {isLoadingBooks ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : books && books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {books.map((book: any) => (
                <div key={book.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Book {book.position}: {book.title}</h4>
                      <p className="text-neutral-500 text-sm mt-1">{book.wordCount.toLocaleString()} words</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      book.status === 'final' ? 'bg-secondary text-white' :
                      book.status === 'revision' ? 'bg-accent text-white' :
                      'bg-neutral-200 text-neutral-700'
                    }`}>
                      {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600">Progress</span>
                      <span className="text-neutral-600">{book.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          book.status === 'final' ? 'bg-secondary' :
                          book.status === 'revision' ? 'bg-accent' :
                          'bg-primary'
                        }`}
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center">
                    <span className="text-xs text-neutral-500">
                      Last edited: {new Date(book.lastEdited).toLocaleDateString()}
                    </span>
                    <button className="text-primary hover:text-primary-dark">
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add button for new book if we have fewer books than planned */}
              {books.length < series.booksPlanned && (
                <div className="bg-neutral-50 rounded-lg p-4 border border-dashed border-neutral-300 flex items-center justify-center">
                  <Button variant="ghost" className="text-neutral-500 flex flex-col items-center hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm mt-1">Start Book {books.length + 1}</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-50 p-6 rounded-lg text-center">
              <h4 className="font-medium mb-2">No books added yet</h4>
              <p className="text-neutral-600 mb-4">Start adding books to your series to track your progress.</p>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add First Book
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
