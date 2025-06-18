import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Image, 
  Mic, 
  Film, 
  MapPin, 
  User, 
  X,
  Play,
  Pause,
  Trash2,
  Check
} from 'lucide-react';

interface MessageFormProps {
  onSendMessage: (data: MessageData) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  replyTo?: {
    id: string;
    content: string;
    userName: string;
  };
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

interface MessageData {
  type: 'text' | 'image' | 'file' | 'voice' | 'movie' | 'location' | 'contact';
  content: string;
  data?: any;
}

interface VoiceRecording {
  isRecording: boolean;
  duration: number;
  audioBlob?: Blob;
}

const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'];

export function MessageForm({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  replyTo,
  onCancelReply,
  placeholder = "Mesaj yazın...",
  disabled = false
}: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    duration: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [message]);

  // Voice recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (voiceRecording.isRecording) {
      interval = setInterval(() => {
        setVoiceRecording(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [voiceRecording.isRecording]);

  const handleInputChange = (value: string) => {
    setMessage(value);
    
    // Typing indicator
    if (value.trim() && onStartTyping) {
      onStartTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 2000);
    } else if (!value.trim() && onStopTyping) {
      onStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() && !voiceRecording.audioBlob) return;

    if (voiceRecording.audioBlob) {
      // Send voice message
      onSendMessage({
        type: 'voice',
        content: '',
        data: {
          duration: formatDuration(voiceRecording.duration),
          audioBlob: voiceRecording.audioBlob
        }
      });
      setVoiceRecording({ isRecording: false, duration: 0 });
    } else {
      // Send text message
      onSendMessage({
        type: 'text',
        content: message
      });
    }

    setMessage('');
    onStopTyping?.();
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onSendMessage({
          type: 'image',
          content: message || '',
          data: {
            imageUrl: e.target?.result,
            imageAlt: file.name,
            fileSize: formatFileSize(file.size)
          }
        });
        setMessage('');
      };
      reader.readAsDataURL(file);
    } else {
      onSendMessage({
        type: 'file',
        content: message || '',
        data: {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: file.type || 'Unknown'
        }
      });
      setMessage('');
    }
    
    e.target.value = '';
    setAttachmentType(null);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setVoiceRecording(prev => ({ ...prev, audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setVoiceRecording({ isRecording: true, duration: 0 });
    } catch (error) {
      console.error('Voice recording error:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setVoiceRecording(prev => ({ ...prev, isRecording: false }));
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setVoiceRecording({ isRecording: false, duration: 0 });
  };

  const sendVoiceMessage = () => {
    if (voiceRecording.audioBlob) {
      handleSendMessage();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      // Simulate file input change
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className={`relative ${isDragging ? 'bg-blue-50 border-blue-300' : ''}`}>
      
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div 
          className="absolute inset-0 bg-blue-50/90 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center z-10"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Image className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-700 font-medium">Dosyayı buraya bırakın</p>
          </div>
        </div>
      )}

      {/* Reply Context */}
      {replyTo && (
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{replyTo.userName}</span> yanıtlanıyor
              </p>
              <p className="text-sm text-gray-800 truncate">{replyTo.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Voice Recording UI */}
      {voiceRecording.isRecording && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 font-medium">Ses kaydediliyor...</span>
              <span className="text-red-600 text-sm">{formatDuration(voiceRecording.duration)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelVoiceRecording}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={stopVoiceRecording}
              >
                <Pause className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Preview */}
      {voiceRecording.audioBlob && !voiceRecording.isRecording && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Ses mesajı hazır</span>
              <span className="text-blue-600 text-sm">{formatDuration(voiceRecording.duration)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelVoiceRecording}
                className="text-gray-600 hover:text-gray-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={sendVoiceMessage}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div 
        className="bg-white border-t border-gray-200 px-4 py-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-end gap-3">
          
          {/* Attachment Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => setAttachmentType(attachmentType ? null : 'menu')}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            {attachmentType === 'menu' && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setAttachmentType(null);
                  }}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Resim
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setAttachmentType(null);
                  }}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Dosya
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Movie sharing logic
                    setAttachmentType(null);
                  }}
                >
                  <Film className="w-4 h-4 mr-2" />
                  Film
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Location sharing logic
                    setAttachmentType(null);
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Konum
                </Button>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || voiceRecording.isRecording}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[48px] max-h-32 overflow-y-auto disabled:opacity-50"
              rows={1}
            />
            
            {/* Emoji Picker Button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5" />
              </Button>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice/Send Button */}
          {message.trim() || voiceRecording.audioBlob ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={disabled || voiceRecording.isRecording}
              className="p-3 rounded-full"
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={startVoiceRecording}
              disabled={disabled}
              className="p-3 rounded-full hover:bg-red-50 hover:text-red-600"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,*/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 