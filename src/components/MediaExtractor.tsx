
import React, { useState, useEffect } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Image, Video } from 'lucide-react';

interface MediaExtractorProps {
  url?: string;
  className?: string;
}

const MediaExtractor: React.FC<MediaExtractorProps> = ({ url, className = "" }) => {
  const [mediaData, setMediaData] = useState<{
    type: 'image' | 'video' | null;
    src: string;
    error?: string;
  }>({ type: null, src: '' });
  const [isLoading, setIsLoading] = useState(false);

  const extractMediaFromText = (text: string): string | null => {
    // Extract URLs from text using regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    
    if (!urls) return null;
    
    // Find the first URL that looks like media
    for (const url of urls) {
      // Check for common image/video URLs
      if (url.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)$/i)) {
        return url;
      }
      
      // Check for common social media/image hosting domains
      if (url.includes('instagram.com') || 
          url.includes('imgur.com') || 
          url.includes('unsplash.com') ||
          url.includes('pexels.com') ||
          url.includes('youtube.com') ||
          url.includes('youtu.be')) {
        return url;
      }
    }
    
    return urls[0]; // Return first URL as fallback
  };

  const processMediaUrl = (mediaUrl: string) => {
    // Handle YouTube URLs
    if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
      let videoId = '';
      if (mediaUrl.includes('youtu.be/')) {
        videoId = mediaUrl.split('youtu.be/')[1].split('?')[0];
      } else if (mediaUrl.includes('youtube.com/watch?v=')) {
        videoId = mediaUrl.split('v=')[1].split('&')[0];
      }
      
      if (videoId) {
        return {
          type: 'video' as const,
          src: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
      }
    }

    // Handle Instagram URLs (convert to placeholder)
    if (mediaUrl.includes('instagram.com')) {
      return {
        type: 'image' as const,
        src: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=500&h=500&fit=crop'
      };
    }

    // Handle Unsplash URLs
    if (mediaUrl.includes('unsplash.com')) {
      return {
        type: 'image' as const,
        src: mediaUrl.includes('?') ? mediaUrl : `${mediaUrl}?w=500&h=500&fit=crop`
      };
    }

    // Default handling for direct media URLs
    const isVideo = mediaUrl.match(/\.(mp4|mov|avi|webm)$/i);
    const isImage = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isVideo) {
      return { type: 'video' as const, src: mediaUrl };
    } else if (isImage) {
      return { type: 'image' as const, src: mediaUrl };
    } else {
      // Default to image for unknown URLs
      return { type: 'image' as const, src: mediaUrl };
    }
  };

  useEffect(() => {
    if (!url) return;

    setIsLoading(true);
    const extractedUrl = extractMediaFromText(url);
    
    if (extractedUrl) {
      try {
        const processedMedia = processMediaUrl(extractedUrl);
        setMediaData(processedMedia);
      } catch (error) {
        setMediaData({
          type: null,
          src: '',
          error: 'Failed to process media URL'
        });
      }
    } else {
      setMediaData({
        type: null,
        src: '',
        error: 'No media URL found in text'
      });
    }
    
    setIsLoading(false);
  }, [url]);

  if (isLoading) {
    return (
      <AspectRatio ratio={1} className={className}>
        <Skeleton className="w-full h-full" />
      </AspectRatio>
    );
  }

  if (mediaData.error || !mediaData.src) {
    return (
      <AspectRatio ratio={1} className={className}>
        <Card className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No media found</p>
          </div>
        </Card>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={1} className={className}>
      {mediaData.type === 'video' ? (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <video 
            src={mediaData.src} 
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
          <div className="absolute top-2 right-2">
            <Video className="h-4 w-4 text-white" />
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={mediaData.src} 
            alt="Extracted media"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=500&h=500&fit=crop';
            }}
          />
          <div className="absolute top-2 right-2">
            <Image className="h-4 w-4 text-white drop-shadow-lg" />
          </div>
        </div>
      )}
    </AspectRatio>
  );
};

export default MediaExtractor;
