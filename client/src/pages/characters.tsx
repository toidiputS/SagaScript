import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, UserIcon, SearchIcon, FilterIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const characterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().default("supporting"),
  occupation: z.string().optional(),
  description: z.string().optional(),
  background: z.string().optional(),
  seriesId: z.coerce.number().min(1, "Series is required"),
  bookAppearances: z.array(z.string()).default([]),
});

type CharacterFormValues = z.infer<typeof characterSchema>;

export default function Characters() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateCharacterOpen, setIsCreateCharacterOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Fetch all series for the dropdown
  const { data: series, isLoading: isLoadingSeries } = useQuery({
    queryKey: ['/api/series'],
  });

  // Get books for the selected series
  const { data: books } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'books'],
    enabled: !!selectedSeries,
  });

  // Fetch characters
  const { data: allCharacters, isLoading: isLoadingCharacters } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'characters'],
    enabled: !!selectedSeries,
  });

  // Filter characters based on search and role filter
  const characters = allCharacters
    ? allCharacters.filter((character: any) => {
        const matchesSearch = searchQuery === "" || 
          character.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (character.occupation && character.occupation.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = !selectedRole || character.role === selectedRole;
        return matchesSearch && matchesRole;
      })
    : [];

  // Create character mutation
  const createCharacterMutation = useMutation({
    mutationFn: (data: CharacterFormValues) =>
      apiRequest("POST", `/api/series/${data.seriesId}/characters`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', selectedSeries, 'characters'] });
      toast({
        title: "Success",
        description: "Character created successfully",
      });
      setIsCreateCharacterOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create character",
        variant: "destructive",
      });
    },
  });

  // Form for creating a new character
  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: "",
      role: "supporting",
      occupation: "",
      description: "",
      background: "",
      seriesId: selectedSeries || undefined,
      bookAppearances: [],
    },
  });

  const onSubmit = (data: CharacterFormValues) => {
    createCharacterMutation.mutate(data);
  };

  // Handle series selection
  const handleSeriesChange = (value: string) => {
    const seriesId = parseInt(value);
    setSelectedSeries(seriesId);
    form.setValue("seriesId", seriesId);
  };

  return (
    <div className="bg-neutral-50 text-neutral-800 font-sans min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />
          
          {/* Page header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Characters</h1>
              <p className="text-neutral-600 mt-1">Create and manage your story's cast</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Dialog open={isCreateCharacterOpen} onOpenChange={setIsCreateCharacterOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Character
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Character</DialogTitle>
                    <DialogDescription>
                      Add a new character to your series.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="seriesId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Series</FormLabel>
                            <Select 
                              onValueChange={(value) => handleSeriesChange(value)} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a series" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {series?.map((s: any) => (
                                  <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Character Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter character name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="protagonist">Protagonist</SelectItem>
                                  <SelectItem value="antagonist">Antagonist</SelectItem>
                                  <SelectItem value="supporting">Supporting</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="occupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Occupation</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Warrior, Mage" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Physical attributes and personality traits" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="background"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Character's history and backstory" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {books && books.length > 0 && (
                        <FormField
                          control={form.control}
                          name="bookAppearances"
                          render={() => (
                            <FormItem>
                              <FormLabel>Appears in Books</FormLabel>
                              <div className="space-y-2">
                                {books.map((book: any) => (
                                  <div key={book.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`book-${book.id}`}
                                      onCheckedChange={(checked) => {
                                        const current = form.getValues("bookAppearances") || [];
                                        const bookId = book.id.toString();
                                        
                                        if (checked) {
                                          form.setValue("bookAppearances", [...current, bookId]);
                                        } else {
                                          form.setValue(
                                            "bookAppearances",
                                            current.filter((id) => id !== bookId)
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`book-${book.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Book {book.position}: {book.title}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createCharacterMutation.isPending}
                        >
                          {createCharacterMutation.isPending ? "Creating..." : "Create Character"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Series Selector and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="series-select" className="block text-sm font-medium text-neutral-700 mb-1">
                  Select Series
                </label>
                <Select 
                  onValueChange={(value) => setSelectedSeries(parseInt(value))}
                  value={selectedSeries?.toString()}
                >
                  <SelectTrigger id="series-select" className="w-full">
                    <SelectValue placeholder="Choose a series" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSeries ? (
                      <SelectItem value="loading" disabled>Loading series...</SelectItem>
                    ) : series && series.length > 0 ? (
                      series.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No series available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">
                  Search Characters
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by name or occupation"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                </div>
              </div>
              <div>
                <label htmlFor="role-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                  Filter by Role
                </label>
                <Select 
                  onValueChange={(value) => setSelectedRole(value === "all" ? null : value)}
                  value={selectedRole || "all"}
                >
                  <SelectTrigger id="role-filter" className="w-full">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="protagonist">Protagonists</SelectItem>
                    <SelectItem value="antagonist">Antagonists</SelectItem>
                    <SelectItem value="supporting">Supporting Characters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Characters Content */}
          {!selectedSeries ? (
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
              <UserIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium mb-4">Select a Series to View Characters</h3>
              <p className="text-neutral-600 mb-6">Choose a series from the dropdown above to manage its characters.</p>
              {!isLoadingSeries && series && series.length === 0 && (
                <Button asChild>
                  <a href="/series">Create Your First Series</a>
                </Button>
              )}
            </div>
          ) : isLoadingCharacters ? (
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
              <p>Loading characters...</p>
            </div>
          ) : (
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-heading font-semibold">
                  {allCharacters?.length || 0} Characters
                </h2>
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="grid" className="mt-0">
                {characters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {characters.map((character: any) => (
                      <Card key={character.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className={`p-4 ${
                            character.role === 'protagonist' ? 'bg-primary/10' :
                            character.role === 'antagonist' ? 'bg-accent/10' :
                            'bg-neutral-100'
                          }`}>
                            <div className="flex items-center">
                              <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0 ${
                                character.role === 'protagonist' ? 'bg-primary' :
                                character.role === 'antagonist' ? 'bg-accent' :
                                'bg-neutral-500'
                              }`}>
                                {character.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-medium text-neutral-900">{character.name}</h3>
                                <p className="text-sm text-neutral-600">
                                  {character.role.charAt(0).toUpperCase() + character.role.slice(1)}
                                  {character.occupation ? ` • ${character.occupation}` : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            {character.description && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-neutral-700 mb-1">Description</h4>
                                <p className="text-sm text-neutral-600 line-clamp-2">{character.description}</p>
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-medium text-neutral-700 mb-1">Appears In</h4>
                              <div className="flex flex-wrap gap-2">
                                {character.bookAppearances && character.bookAppearances.length > 0 ? (
                                  character.bookAppearances.map((bookId: string, index: number) => (
                                    <span 
                                      key={`${character.id}-${bookId}`}
                                      className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600"
                                    >
                                      Book {bookId}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-neutral-500">No books specified</span>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-between items-center">
                              <div className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                                {character.completeness}% Complete
                              </div>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
                    <UserIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-medium mb-4">No Characters Found</h3>
                    <p className="text-neutral-600 mb-6">
                      {searchQuery || selectedRole
                        ? "No characters match your search criteria."
                        : "This series doesn't have any characters yet."}
                    </p>
                    <Button onClick={() => setIsCreateCharacterOpen(true)}>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Character
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                {characters.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                          <tr>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Name</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Role</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Occupation</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Appearances</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Completeness</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {characters.map((character: any) => (
                            <tr key={character.id} className="hover:bg-neutral-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0 ${
                                    character.role === 'protagonist' ? 'bg-primary' :
                                    character.role === 'antagonist' ? 'bg-accent' :
                                    'bg-neutral-500'
                                  }`}>
                                    {character.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium">{character.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  character.role === 'protagonist' ? 'bg-primary/10 text-primary' :
                                  character.role === 'antagonist' ? 'bg-accent/10 text-accent' :
                                  'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {character.role.charAt(0).toUpperCase() + character.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-neutral-600">
                                {character.occupation || "-"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {character.bookAppearances && character.bookAppearances.length > 0 ? (
                                    character.bookAppearances.map((bookId: string) => (
                                      <span 
                                        key={`${character.id}-${bookId}`}
                                        className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600"
                                      >
                                        Book {bookId}
                                      </span>
                                    ))
                                  ) : (
                                    "-"
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-16 bg-neutral-200 rounded-full h-1.5 mr-2">
                                    <div 
                                      className={`h-1.5 rounded-full ${
                                        character.role === 'protagonist' ? 'bg-primary' :
                                        character.role === 'antagonist' ? 'bg-accent' :
                                        'bg-neutral-500'
                                      }`}
                                      style={{ width: `${character.completeness}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-neutral-600">{character.completeness}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
                    <UserIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-medium mb-4">No Characters Found</h3>
                    <p className="text-neutral-600 mb-6">
                      {searchQuery || selectedRole
                        ? "No characters match your search criteria."
                        : "This series doesn't have any characters yet."}
                    </p>
                    <Button onClick={() => setIsCreateCharacterOpen(true)}>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Character
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Footer */}
          <footer className="border-t border-neutral-200 pt-6 pb-12 text-neutral-500 text-sm mt-12">
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
