import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TimelineEvent, Book, Character, Location } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema
const timelineEventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  eventType: z.string().default("plot"),
  date: z.string().nullable().optional(),
  bookId: z.number().nullable().optional(),
  chapterId: z.number().nullable().optional(),
  characterIds: z.array(z.number()).default([]),
  locationId: z.number().nullable().optional(),
  importance: z.string().default("medium"),
  color: z.string().nullable().optional(),
  position: z.number().default(0),
  isPlotPoint: z.boolean().default(false),
  seriesId: z.number(),
});

type TimelineEventFormValues = z.infer<typeof timelineEventFormSchema>;

interface TimelineEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: TimelineEvent;
  seriesId: number;
  books: Book[];
  characters?: Character[];
  locations?: Location[];
  mode: "create" | "edit";
}

export default function TimelineEventDialog({
  isOpen,
  onClose,
  event,
  seriesId,
  books,
  characters = [],
  locations = [],
  mode,
}: TimelineEventDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState<number | null>(
    event?.bookId || null
  );

  // Initialize form with event data or defaults
  const form = useForm<TimelineEventFormValues>({
    resolver: zodResolver(timelineEventFormSchema),
    defaultValues: event
      ? { 
          ...event,
          characterIds: Array.isArray(event.characterIds) ? event.characterIds : [],
        }
      : {
          title: "",
          description: "",
          eventType: "plot",
          date: "",
          bookId: null,
          chapterId: null,
          characterIds: [],
          locationId: null,
          importance: "medium",
          color: null,
          position: 0,
          isPlotPoint: false,
          seriesId,
        },
  });

  // Create/update timeline event mutation
  const mutation = useMutation({
    mutationFn: async (data: TimelineEventFormValues) => {
      if (mode === "create") {
        const res = await apiRequest("POST", "/api/timeline-events", data);
        return res.json();
      } else {
        const res = await apiRequest(
          "PUT",
          `/api/timeline-events/${event?.id}`,
          data
        );
        return res.json();
      }
    },
    onSuccess: () => {
      // Invalidate timeline queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'timeline'] });
      if (selectedBook) {
        queryClient.invalidateQueries({ queryKey: ['/api/books', selectedBook, 'timeline'] });
      }
      
      toast({
        title: `Event ${mode === "create" ? "created" : "updated"} successfully`,
        description: `The timeline event has been ${mode === "create" ? "added to" : "updated in"} your timeline.`,
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${mode} timeline event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: TimelineEventFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Timeline Event" : "Edit Timeline Event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new event in your story timeline."
              : "Update the details of this timeline event."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="plot">Plot Event</SelectItem>
                        <SelectItem value="character">Character Event</SelectItem>
                        <SelectItem value="world">World Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date/Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Year 1242, Day 3, Evening"
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
                      placeholder="Describe what happens in this event"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bookId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const numValue = value ? parseInt(value) : null;
                        setSelectedBook(numValue);
                        field.onChange(numValue);
                      }}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {books?.map((book) => (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.title}
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
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importance</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPlotPoint"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Plot Point</FormLabel>
                    <FormDescription>
                      Mark this as a major plot point in your story
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : mode === "create" ? (
                  "Create Event"
                ) : (
                  "Update Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}