import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWritingStats } from "@/hooks/use-writing-stats";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import StatCard from "@/components/dashboard/stat-card";
import SeriesCard from "@/components/dashboard/series-card";
import CharacterCard from "@/components/dashboard/character-card";
import StreakTracker from "@/components/dashboard/streak-tracker";
import TimelinePreview from "@/components/dashboard/timeline-preview";
import AISuggestions from "@/components/dashboard/ai-suggestions";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, isLoading: isLoadingStats } = useWritingStats();
  
  const { data: series, isLoading: isLoadingSeries } = useQuery({
    queryKey: ['/api/series'],
  });

  const currentSeries = series && series.length > 0 ? series[0] : null;

  const { data: characters, isLoading: isLoadingCharacters } = useQuery({
    queryKey: currentSeries ? ['/api/series', currentSeries.id, 'characters'] : null,
    enabled: !!currentSeries,
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: currentSeries ? ['/api/series', currentSeries.id, 'locations'] : null,
    enabled: !!currentSeries,
  });

  const mainCharacters = characters?.filter(char => char.role === "protagonist" || char.role === "antagonist") || [];
  const keyLocations = locations || [];

  return (
    <div className="bg-neutral-50 text-neutral-800 font-sans min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />
          
          {/* Dashboard header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Dashboard</h1>
              <p className="text-neutral-600 mt-1">Welcome back, {user?.displayName || user?.username}. You're making great progress!</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button variant="outline" className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Today's Goals
              </Button>
              <Button className="flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Session
              </Button>
            </div>
          </header>

          {/* Writing streak section */}
          <StreakTracker streak={stats?.currentStreak || 0} />

          {/* Stats cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Words Written" 
              value={stats?.totalWordCount || 0} 
              icon="document" 
              change={12} 
              period="from last month" 
            />
            <StatCard 
              title="Characters Created" 
              value={stats?.charactersCreated || 0} 
              icon="users" 
              change={3} 
              period="this week" 
              changeType="new" 
            />
            <StatCard 
              title="Achievements" 
              value={`${stats?.achievementsCount || 0}/30`} 
              icon="award" 
              progress={47} 
              nextMilestone="World Builder (needs 3 more locations)" 
            />
          </section>

          {/* Current series section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-heading font-semibold text-neutral-800">Current Series</h2>
              <a href="/series" className="text-primary text-sm font-medium hover:underline flex items-center">
                View All Series
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            {isLoadingSeries ? (
              <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
                Loading series...
              </div>
            ) : currentSeries ? (
              <SeriesCard series={currentSeries} />
            ) : (
              <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
                <h3 className="text-lg font-medium mb-4">You haven't created any series yet</h3>
                <Button asChild>
                  <a href="/series">Create Your First Series</a>
                </Button>
              </div>
            )}
          </section>

          {/* Character & World Building Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Characters section */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-heading font-semibold text-neutral-800">Main Characters</h2>
                <a href="/characters" className="text-primary text-sm font-medium hover:underline flex items-center">
                  All Characters
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {isLoadingCharacters ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 flex items-center animate-pulse">
                    <div className="h-14 w-14 rounded-full bg-neutral-200 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 flex items-center animate-pulse">
                    <div className="h-14 w-14 rounded-full bg-neutral-200 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ) : mainCharacters.length > 0 ? (
                <div className="space-y-3">
                  {mainCharacters.map(character => (
                    <CharacterCard key={character.id} character={character} />
                  ))}
                  
                  {/* Add Character Button */}
                  <div className="mt-4">
                    <Button variant="ghost" className="w-full py-6 border border-dashed border-neutral-300 rounded-lg text-neutral-500 flex items-center justify-center hover:text-primary hover:border-primary-light">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Add New Character
                    </Button>
                  </div>
                </div>
              ) : currentSeries ? (
                <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-6 text-center">
                  <h3 className="text-lg font-medium mb-3">No characters yet</h3>
                  <p className="text-neutral-600 mb-4">Start building your cast of characters for this series.</p>
                  <Button asChild>
                    <a href="/characters">Create Characters</a>
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-6 text-center">
                  <p className="text-neutral-600">Create a series first to add characters</p>
                </div>
              )}
            </section>

            {/* World Building section */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-heading font-semibold text-neutral-800">World Building</h2>
                <a href="/world-building" className="text-primary text-sm font-medium hover:underline flex items-center">
                  World Atlas
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {isLoadingLocations ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 flex items-center animate-pulse">
                    <div className="h-12 w-12 rounded-md bg-neutral-200 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 flex items-center animate-pulse">
                    <div className="h-12 w-12 rounded-md bg-neutral-200 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ) : keyLocations.length > 0 ? (
                <>
                  {/* World Map Preview */}
                  <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 mb-4 hover:shadow-card-hover transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{currentSeries?.title} - World Map</h3>
                      <button className="text-neutral-400 hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-neutral-100 rounded-md h-40 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-800/30 flex items-end">
                        <div className="p-3 w-full">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-xs font-medium">{keyLocations.length} Locations</span>
                            <button className="bg-white/20 backdrop-blur-sm text-white rounded p-1 hover:bg-white/30 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Locations */}
                  <div className="space-y-3">
                    {keyLocations.map(location => (
                      <div key={location.id} className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 flex hover:border-primary/50 transition-colors">
                        <div className="h-12 w-12 rounded-md bg-secondary/10 flex items-center justify-center text-secondary mr-4 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-neutral-900">{location.name}</h3>
                              <p className="text-sm text-neutral-500">{location.type} • {location.description}</p>
                            </div>
                            <button className="text-neutral-400 hover:text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-2 flex">
                            <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600 mr-2">
                              {location.bookAppearances?.length ? `Book ${location.bookAppearances.join(', ')}` : 'No books yet'}
                            </span>
                            <span className="text-xs bg-secondary/10 px-2 py-0.5 rounded-full text-secondary">
                              {location.keyScenes} Key Scenes
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Location Button */}
                    <div className="mt-4">
                      <Button variant="ghost" className="w-full py-6 border border-dashed border-neutral-300 rounded-lg text-neutral-500 flex items-center justify-center hover:text-primary hover:border-primary-light">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Add New Location
                      </Button>
                    </div>
                  </div>
                </>
              ) : currentSeries ? (
                <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-6 text-center">
                  <h3 className="text-lg font-medium mb-3">No locations yet</h3>
                  <p className="text-neutral-600 mb-4">Start building the world for your series.</p>
                  <Button asChild>
                    <a href="/world-building">Create Locations</a>
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-6 text-center">
                  <p className="text-neutral-600">Create a series first to add locations</p>
                </div>
              )}
            </section>
          </div>

          {/* Timeline Preview */}
          <TimelinePreview seriesId={currentSeries?.id} />

          {/* Recommendations & AI Companion Section */}
          <AISuggestions />

          {/* Recent Activity */}
          <RecentActivity />

          {/* Footer */}
          <footer className="border-t border-neutral-200 pt-6 pb-12 text-neutral-500 text-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <p>© 2023 Saga Scribe - The Ultimate Series Author's Companion</p>
                <p className="mt-1">Version 1.0.0</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="hover:text-primary transition-colors">Help & Support</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
