
"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Corrected import path
import type { TextFace } from "@/data/text-faces";
import { textFacesData, popularTags } from "@/data/text-faces";

export default function HomePage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [clipboardAvailable, setClipboardAvailable] = useState(false);

  useEffect(() => {
    setClipboardAvailable(typeof window !== "undefined" && !!navigator.clipboard);
  }, []);


  const filteredTextFaces = useMemo(() => {
    let faces = textFacesData;
    const lowerSelectedTag = selectedTag?.toLowerCase();
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    if (lowerSelectedTag) {
      faces = faces.filter(face => face.tags.includes(lowerSelectedTag));
    }

    if (lowerSearchTerm) {
      faces = faces.filter(face =>
        face.face.toLowerCase().includes(lowerSearchTerm) ||
        face.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return faces;
  }, [searchTerm, selectedTag]);

  const copyToClipboard = React.useCallback((text: string) => {
    if (!clipboardAvailable) {
       toast({
         title: "Clipboard Error",
         description: "Cannot copy text. Clipboard API not available.",
         variant: "destructive",
         duration: 3000,
       });
       return;
    }
     navigator.clipboard.writeText(text).then(() => {
       toast({
         title: "Copied!",
         // Use smaller font for description and prevent line breaks for the face itself
         description: <span className="font-mono break-all text-sm">{text} copied to clipboard.</span>,
         duration: 2000,
       });
     }).catch(err => {
       console.error('Failed to copy: ', err);
       toast({
         title: "Copy Error",
         description: "Could not copy text to clipboard.",
         variant: "destructive",
         duration: 2000,
       });
     });
  }, [clipboardAvailable, toast]); // Dependencies for useCallback

   const handleTagClick = React.useCallback((tag: string) => {
    setSelectedTag(prevTag => {
      const newTag = prevTag === tag ? null : tag;
      // Clear search term only if selecting a *new* tag or deselecting
      if (newTag !== prevTag) {
        setSearchTerm("");
      }
      return newTag;
    });
  }, []); // No dependencies needed

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value;
      setSearchTerm(newSearchTerm);
      // Clear selected tag *only* if user starts typing in search
      if (newSearchTerm.trim() && selectedTag) {
        setSelectedTag(null);
      }
  }, [selectedTag]); // Dependency on selectedTag needed

  const clearFilters = React.useCallback(() => {
    setSearchTerm("");
    setSelectedTag(null);
  }, []); // No dependencies


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">TextFaces Galore (≧∇≦)/</h1>
        <p className="text-muted-foreground">Find and copy your favorite text faces!</p>
      </header>

       {/* Sticky Search and Filter Section */}
       <div className="mb-8 max-w-3xl mx-auto space-y-4 sticky top-4 z-10 bg-background/95 backdrop-blur-sm py-4 px-2 sm:px-4 rounded-lg border shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search faces or tags (e.g., happy, cat, shrug...)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-10 w-full" // Padding for icons
            aria-label="Search text faces"
          />
          {searchTerm && (
             <Button
               variant="ghost"
               size="icon"
               className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
               onClick={() => setSearchTerm("")}
               aria-label="Clear search input"
             >
               <X className="h-4 w-4" />
             </Button>
           )}
        </div>

        {/* Popular Tags & Clear Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-medium mr-2 text-muted-foreground self-center whitespace-nowrap">Trending:</span>
          {popularTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "secondary"}
              onClick={() => handleTagClick(tag)}
              className="cursor-pointer capitalize transition-colors duration-150 ease-in-out hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              role="button"
              aria-pressed={selectedTag === tag}
              tabIndex={0} // Make tags focusable
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTagClick(tag);
                 }
               }}
            >
              {tag}
              {selectedTag === tag && <X className="ml-1.5 h-3 w-3" aria-hidden="true"/>}
            </Badge>
          ))}
           {(searchTerm || selectedTag) && (
              <Button
                variant="link" // Use link variant for less visual weight
                size="sm"
                onClick={clearFilters}
                className="h-auto py-0.5 px-1 text-xs text-muted-foreground hover:text-primary whitespace-nowrap"
                aria-label="Clear all filters"
              >
                Clear Filters
              </Button>
            )}
        </div>
      </div>


      {/* Main Grid - Add margin-top to avoid overlap */}
      <main className="mt-8">
       {filteredTextFaces.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredTextFaces.map((face, index) => (
              <Card
                key={`${face.face}-${index}-${selectedTag}-${searchTerm}`} // More robust key for re-renders
                className="bg-card text-card-foreground shadow-sm rounded-lg transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-md focus-within:scale-105 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer group relative overflow-hidden"
                onClick={() => copyToClipboard(face.face)}
                role="button"
                aria-label={`Copy text face: ${face.face}`}
                tabIndex={0} // Make card focusable
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault(); // Prevent page scroll on space
                    copyToClipboard(face.face);
                  }
                }}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center aspect-square min-h-[100px]">
                  {/* Face Text - Centered */}
                  <span className="text-xl md:text-2xl font-mono text-center break-all leading-tight flex-grow flex items-center justify-center p-1">
                    {face.face}
                  </span>
                   {/* Tags display at bottom - shown on hover/focus */}
                  <div className="absolute bottom-0 left-0 right-0 p-1 pt-3 bg-gradient-to-t from-card/90 via-card/70 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 ease-in-out pointer-events-none">
                    <p className="text-xs text-muted-foreground text-center truncate px-1 capitalize">
                      {face.tags.slice(0, 3).join(', ')}
                    </p>
                  </div>
                   {/* Copy Icon - shown on hover/focus */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 ease-in-out pointer-events-none">
                    <Clipboard className="w-4 h-4 text-muted-foreground" aria-hidden="true"/>
                  </div>
                </CardContent>

              </Card>
            ))}
          </div>
        ) : (
           // No Results Message
           <div className="text-center text-muted-foreground mt-16 py-8">
             <p className="text-4xl mb-4">¯\\_(ツ)_/¯</p>
             <p className="text-lg font-medium">No faces found</p>
              {searchTerm && <p className="text-sm">for "{searchTerm}"</p>}
              {selectedTag && <p className="text-sm">with tag "{selectedTag}"</p>}
             <p className="text-sm mt-1">Try adjusting your search or filters.</p>
               <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                 Clear Search & Filters
               </Button>
           </div>
         )}
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-muted-foreground text-sm">
        {textFacesData.length}+ faces available. Made with (づ｡◕‿‿◕｡)づ by AI
      </footer>
    </div>
  );
}

