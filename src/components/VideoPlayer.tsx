interface VideoPlayerProps {
  url: string;
}

function getGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return null;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  if (!url) return null;

  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-proxy?id=${driveId}`;
    return (
      <video controls className="h-full w-full" preload="metadata">
        <source src={proxyUrl} type="video/mp4" />
      </video>
    );
  }

  const youtubeEmbed = getYouTubeEmbedUrl(url);
  if (youtubeEmbed) {
    return (
      <iframe
        src={youtubeEmbed}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
        title="Lesson video"
      />
    );
  }

  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
  if (isDirectVideo) {
    return <video src={url} controls className="h-full w-full" />;
  }

  return (
    <iframe
      src={url}
      allowFullScreen
      className="h-full w-full"
      title="Lesson video"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
}
