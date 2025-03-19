import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

type TimelinePreviewProps = {
  seriesId?: number;
};

export default function TimelinePreview({ seriesId }: TimelinePreviewProps) {
  const [activeFilter, setActiveFilter] = useState("key-events");
  
  // Fetch timeline events if we have a series ID
  const { data: timelineEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/series', seriesId, 'timeline'],
    enabled: !!seriesId,
  });

  // Helper to generate event color
  const getEventColor = (index: number) => {
    const colors = ["bg-primary", "bg-accent", "bg-secondary", "bg-green-500"];
    return colors[index % colors.length];
  };

  if (!seriesId) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">Series Timeline</h2>
        <a href="/timeline" className="text-primary text-sm font-medium hover:underline flex items-center">
          Full Timeline
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-card p-5 border border-neutral-200">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={activeFilter === "key-events" ? "default" : "outline"}
              onClick={() => setActiveFilter("key-events")}
            >
              Key Events
            </Button>
            <Button 
              size="sm" 
              variant={activeFilter === "character-arcs" ? "default" : "outline"}
              onClick={() => setActiveFilter("character-arcs")}
            >
              Character Arcs
            </Button>
            <Button 
              size="sm" 
              variant={activeFilter === "plot-lines" ? "default" : "outline"}
              onClick={() => setActiveFilter("plot-lines")}
            >
              Plot Lines
            </Button>
          </div>
          {timelineEvents && timelineEvents.length > 0 && (
            <div className="text-sm text-neutral-500">
              Showing: <span className="font-medium text-neutral-800">
                {timelineEvents[0].date} — {timelineEvents[timelineEvents.length - 1].date}
              </span>
            </div>
          )}
        </div>

        {/* Timeline visualization */}
        <div className="relative h-48 overflow-x-auto" data-implementation="Interactive timeline component">
          {/* Timeline tracker line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 transform -translate-y-1/2"></div>
          
          {isLoadingEvents ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : timelineEvents && timelineEvents.length > 0 ? (
            <div className="absolute top-0 left-0 right-0 bottom-0">
              {/* Year markers */}
              <div className="absolute bottom-0 left-[5%] text-xs text-neutral-500">
                {timelineEvents[0].date}
              </div>
              <div className="absolute bottom-0 left-[35%] text-xs text-neutral-500">
                {timelineEvents[Math.floor(timelineEvents.length * 0.3)].date}
              </div>
              <div className="absolute bottom-0 left-[65%] text-xs text-neutral-500">
                {timelineEvents[Math.floor(timelineEvents.length * 0.6)].date}
              </div>
              
              {/* Event markers - evenly distribute across the timeline */}
              {timelineEvents.map((event: any, index: number) => {
                // Calculate position
                const leftPos = 5 + (index / (timelineEvents.length - 1 || 1)) * 90;
                const topPos = index % 2 === 0 ? 15 : 60;
                
                return (
                  <div 
                    key={event.id} 
                    className="absolute"
                    style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                  >
                    <div className={`w-4 h-4 rounded-full ${getEventColor(index)} border-2 border-white shadow-md`}></div>
                    <div className={`absolute ${topPos < 50 ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md w-max max-w-[150px] z-10`}>
                      <h4 className="text-xs font-medium">{event.title}</h4>
                      <p className="text-xs text-neutral-500">{event.description.substring(0, 50)}{event.description.length > 50 ? '...' : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-neutral-500 mb-2">No timeline events yet</p>
              <Button asChild size="sm">
                <a href="/timeline">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create Your Timeline
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-2 pt-4 border-t border-neutral-200 flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">{timelineEvents?.length || 0} Events</span>
            <span className="text-neutral-500"> across the timeline</span>
          </div>
          <a href="/timeline" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add New Event
          </a>
        </div>
      </div>
    </section>
  );
}
