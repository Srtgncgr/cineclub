import React from 'react';
import { Avatar } from './avatar';
import { 
  Play, 
  Pause, 
  Download, 
  File, 
  Image as ImageIcon, 
  Mic, 
  Calendar,
  MapPin,
  Phone,
  Video,
  ExternalLink,
  Star,
  Clock
} from 'lucide-react';

interface MessageBubbleProps {
  type: 'text' | 'image' | 'file' | 'voice' | 'movie' | 'location' | 'contact' | 'call';
  content: string;
  isOwn: boolean;
  timestamp: string;
  data?: {
    // For image messages
    imageUrl?: string;
    imageAlt?: string;
    // For file messages
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    // For voice messages
    duration?: string;
    isPlaying?: boolean;
    // For movie recommendations
    movie?: {
      title: string;
      poster: string;
      year: number;
      rating: number;
      description: string;
    };
    // For location messages
    location?: {
      name: string;
      address: string;
      coordinates: [number, number];
    };
    // For contact messages
    contact?: {
      name: string;
      phone: string;
      avatar?: string;
    };
    // For call messages
    call?: {
      type: 'voice' | 'video';
      duration?: string;
      status: 'missed' | 'completed' | 'declined';
    };
  };
  onImageClick?: () => void;
  onFileDownload?: () => void;
  onVoicePlay?: () => void;
  onMovieClick?: () => void;
  onLocationClick?: () => void;
  onContactClick?: () => void;
}

export function MessageBubble({
  type,
  content,
  isOwn,
  timestamp,
  data,
  onImageClick,
  onFileDownload,
  onVoicePlay,
  onMovieClick,
  onLocationClick,
  onContactClick
}: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'missed': return 'text-red-500';
      case 'completed': return 'text-green-500';
      case 'declined': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getCallStatusText = (status: string) => {
    switch (status) {
      case 'missed': return 'Cevapsız arama';
      case 'completed': return 'Tamamlanan arama';
      case 'declined': return 'Reddedilen arama';
      default: return 'Arama';
    }
  };

  const bubbleStyles = `rounded-2xl px-4 py-3 max-w-xs lg:max-w-md ${
    isOwn
      ? 'bg-primary text-white rounded-br-md ml-auto'
      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
  }`;

  const renderTextMessage = () => (
    <div className={bubbleStyles}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </p>
      <div className="flex justify-end mt-2">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  const renderImageMessage = () => (
    <div className={bubbleStyles}>
      <div 
        className="mb-2 rounded-lg overflow-hidden cursor-pointer"
        onClick={onImageClick}
      >
        <img
          src={data?.imageUrl}
          alt={data?.imageAlt || 'Shared image'}
          className="w-full h-auto max-h-64 object-cover hover:opacity-90 transition-opacity"
        />
      </div>
      {content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-2">
          {content}
        </p>
      )}
      <div className="flex justify-end">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  const renderFileMessage = () => (
    <div className={bubbleStyles}>
      <div 
        className="flex items-center gap-3 p-3 bg-black/5 rounded-lg cursor-pointer hover:bg-black/10 transition-colors"
        onClick={onFileDownload}
      >
        <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-gray-100'}`}>
          <File className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{data?.fileName}</p>
          <p className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
            {data?.fileSize} • {data?.fileType}
          </p>
        </div>
        <Download className="w-5 h-5" />
      </div>
      {content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-2">
          {content}
        </p>
      )}
      <div className="flex justify-end mt-2">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  const renderVoiceMessage = () => (
    <div className={bubbleStyles}>
      <div 
        className="flex items-center gap-3 p-2 cursor-pointer"
        onClick={onVoicePlay}
      >
        <div className={`p-2 rounded-full ${isOwn ? 'bg-white/20' : 'bg-primary'}`}>
          {data?.isPlaying ? (
            <Pause className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-white'}`} />
          ) : (
            <Play className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-white'}`} />
          )}
        </div>
        
        {/* Voice Wave Animation */}
        <div className="flex items-center gap-1 flex-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-current rounded-full transition-all duration-150 ${
                data?.isPlaying ? 'animate-pulse' : ''
              }`}
              style={{
                height: `${Math.random() * 20 + 8}px`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{data?.duration}</span>
        </div>
      </div>
      <div className="flex justify-end mt-1">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  const renderMovieMessage = () => (
    <div className={bubbleStyles}>
      <div 
        className="cursor-pointer"
        onClick={onMovieClick}
      >
        <div className="flex gap-3 p-3 bg-black/5 rounded-lg hover:bg-black/10 transition-colors">
          <img
            src={data?.movie?.poster}
            alt={data?.movie?.title}
            className="w-16 h-24 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{data?.movie?.title}</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">{data?.movie?.year}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs">{data?.movie?.rating}</span>
              </div>
            </div>
            <p className="text-xs line-clamp-2 opacity-80">
              {data?.movie?.description}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 mt-1" />
        </div>
      </div>
      {content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-2">
          {content}
        </p>
      )}
      <div className="flex justify-end mt-2">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  const renderLocationMessage = () => (
    <div className={bubbleStyles}>
      <div 
        className="cursor-pointer"
        onClick={onLocationClick}
      >
        <div className="p-3 bg-black/5 rounded-lg hover:bg-black/10 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="font-medium text-sm">{data?.location?.name}</span>
          </div>
          <p className="text-xs opacity-80 mb-3">{data?.location?.address}</p>
          
          {/* Mini Map Placeholder */}
          <div className="h-24 bg-gray-200 rounded border-2 border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-red-500 mx-auto mb-1" />
              <span className="text-xs text-gray-600">Haritayı Görüntüle</span>
            </div>
          </div>
        </div>
      </div>
      {content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-2">
          {content}
        </p>
      )}
      <div className="flex justify-end mt-2">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  const renderContactMessage = () => (
    <div className={bubbleStyles}>
      <div 
        className="cursor-pointer"
        onClick={onContactClick}
      >
        <div className="flex items-center gap-3 p-3 bg-black/5 rounded-lg hover:bg-black/10 transition-colors">
          <Avatar
            src={data?.contact?.avatar}
            alt={data?.contact?.name}
            size="md"
            fallback={data?.contact?.name?.charAt(0) || 'K'}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{data?.contact?.name}</h4>
            <p className="text-xs opacity-80">{data?.contact?.phone}</p>
          </div>
          <Phone className="w-4 h-4" />
        </div>
      </div>
      {content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-2">
          {content}
        </p>
      )}
      <div className="flex justify-end mt-2">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  const renderCallMessage = () => (
    <div className={`${bubbleStyles} text-center`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        {data?.call?.type === 'video' ? (
          <Video className={`w-5 h-5 ${getCallStatusColor(data?.call?.status || '')}`} />
        ) : (
          <Phone className={`w-5 h-5 ${getCallStatusColor(data?.call?.status || '')}`} />
        )}
        <span className={`text-sm ${getCallStatusColor(data?.call?.status || '')}`}>
          {getCallStatusText(data?.call?.status || '')}
        </span>
      </div>
      {data?.call?.duration && (
        <p className="text-xs opacity-80 mb-2">
          Süre: {data.call.duration}
        </p>
      )}
      <div className="flex justify-center">
        <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );

  // Render appropriate message type
  switch (type) {
    case 'image':
      return renderImageMessage();
    case 'file':
      return renderFileMessage();
    case 'voice':
      return renderVoiceMessage();
    case 'movie':
      return renderMovieMessage();
    case 'location':
      return renderLocationMessage();
    case 'contact':
      return renderContactMessage();
    case 'call':
      return renderCallMessage();
    case 'text':
    default:
      return renderTextMessage();
  }
} 