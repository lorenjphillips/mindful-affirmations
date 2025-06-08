import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Pause, Trash2, Download } from "lucide-react";
import { Link } from "wouter";
import { type Meditation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import AudioPlayer from "@/components/AudioPlayer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Library() {
  const [playingMeditation, setPlayingMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const { data: meditations, isLoading, error } = useQuery<Meditation[]>({
    queryKey: ['/api/meditations'],
  });

  // Delete meditation mutation
  const deleteMutation = useMutation({
    mutationFn: async (meditationId: number) => {
      return await apiRequest("DELETE", `/api/meditations/${meditationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meditations'] });
      toast({
        title: "Meditation deleted",
        description: "The meditation has been removed from your library.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete meditation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handlePlay = (meditation: Meditation) => {
    if (playingMeditation?.id === meditation.id && isPlaying) {
      setIsPlaying(false);
    } else {
      setPlayingMeditation(meditation);
      setIsPlaying(true);
    }
  };

  const handleDelete = (meditationId: number) => {
    if (confirm("Are you sure you want to delete this meditation?")) {
      deleteMutation.mutate(meditationId);
    }
  };

  const handleDownload = (meditation: Meditation) => {
    // For now, we'll download the script as a text file
    const element = document.createElement("a");
    const file = new Blob([meditation.meditationScript || "No script available"], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${meditation.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Your Meditation Library</h2>
          <Link href="/">
            <Button>Create New</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Library</h3>
          <p className="text-red-600">There was a problem loading your meditation library. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Your Meditation Library</h2>
        <Link href="/">
          <Button>Create New</Button>
        </Link>
      </div>
      
      {/* Audio Player for Currently Playing Meditation */}
      {playingMeditation && (
        <div className="mb-6">
          <AudioPlayer 
            meditation={playingMeditation} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying}
            onMeditationComplete={() => {
              setIsPlaying(false);
              setPlayingMeditation(null);
            }}
          />
        </div>
      )}
      
      {meditations && meditations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meditations.map((meditation) => (
            <Card key={meditation.id}>
              <CardHeader className="pb-2">
                <CardTitle>{meditation.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">
                  {meditation.duration} minutes • {meditation.voiceStyle} voice
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(meditation.createdAt), { addSuffix: true })}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  className="flex-1" 
                  size="sm" 
                  variant="default"
                  onClick={() => handlePlay(meditation)}
                >
                  {playingMeditation?.id === meditation.id && isPlaying ? (
                    <><Pause className="mr-1 h-4 w-4" /> Pause</>
                  ) : (
                    <><Play className="mr-1 h-4 w-4" /> Play</>
                  )}
                </Button>
                <Button 
                  className="flex-1" 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownload(meditation)}
                >
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive"
                  onClick={() => handleDelete(meditation.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg border border-muted">
          <h3 className="text-xl font-medium mb-2">Your Library is Empty</h3>
          <p className="text-muted-foreground mb-6">Create your first meditation to get started</p>
          <Link href="/">
            <Button>Create a Meditation</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
