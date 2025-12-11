import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Search, Music, CheckCircle2, AlertCircle } from 'lucide-react';

export interface MusicTrack {
  id: string;
  title: string;
  category: 'Cinematic' | 'Uplifting' | 'Ambient' | 'Energetic' | 'Lo-Fi';
  duration: string;
  url: string;
}

// Stable Royalty-Free Music Links (Free Music Archive / CC BY)
const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: '1',
    title: 'Sentinel (Cinematic)',
    category: 'Cinematic',
    duration: '2:45',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_04_-_Sentinel.mp3'
  },
  {
    id: '2',
    title: 'Driven To Success',
    category: 'Uplifting',
    duration: '2:20',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes/Corporate_and_Motivational_Music_2/Scott_Holmes_-_08_-_Driven_To_Success.mp3'
  },
  {
    id: '3',
    title: 'Star Ling (Ambient)',
    category: 'Ambient',
    duration: '3:05',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/Music_for_Video/Podington_Bear/Solo_Instruments/Podington_Bear_-_Star_Ling.mp3'
  },
  {
    id: '4',
    title: 'Enthusiast',
    category: 'Energetic',
    duration: '2:15',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3'
  },
  {
    id: '5',
    title: 'Elips (Lo-Fi)',
    category: 'Lo-Fi',
    duration: '2:40',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Elips.mp3'
  },
  {
    id: '6',
    title: 'Homeroad',
    category: 'Ambient',
    duration: '3:10',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Chapter_One_-_Cold/Kai_Engel_-_09_-_Homeroad.mp3'
  }
];

interface MusicSelectorProps {
  onSelect: (url: string, title: string) => void;
  selectedUrl: string | null;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({ onSelect, selectedUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = ['All', ...Array.from(new Set(MUSIC_LIBRARY.map(t => t.category)))];

  const filteredTracks = MUSIC_LIBRARY.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || track.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePreview = async (track: MusicTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaybackError(null);
    const audio = audioRef.current;
    
    if (!audio) return;

    // If clicking the currently playing track, just pause.
    if (previewTrackId === track.id) {
      audio.pause();
      setPreviewTrackId(null);
      return;
    }

    // Changing track
    try {
      // 1. Pause current
      audio.pause();
      
      // 2. Set new source
      audio.src = track.url;
      // We do NOT set crossOrigin for preview to avoid strict CORS issues on some CDNs.
      // The export functionality fetches the file separately using fetch() which handles CORS headers if present.
      audio.removeAttribute('crossorigin');
      audio.load();

      // 3. Update state
      setPreviewTrackId(track.id);

      // 4. Play with promise handling
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // If the user clicks pause or another track quickly, an AbortError is expected.
          if (error.name === 'AbortError') {
            console.log("Playback interrupted (AbortError), ignoring.");
            return;
          }
          // Real error
          console.error("Audio playback error:", error);
          setPlaybackError("Unable to play track. Source may be restricted.");
          
          // Only clear if this track is still the one trying to play
          setPreviewTrackId(current => current === track.id ? null : current);
        });
      }
    } catch (err) {
      console.error("Audio setup failed:", err);
      setPlaybackError("Playback setup failed");
      setPreviewTrackId(null);
    }
  };

  useEffect(() => {
    // Initialize audio object for previews
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
      {/* Search and Filters */}
      <div className="p-3 border-b border-slate-800 space-y-3 bg-slate-900/50">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto p-1 custom-scrollbar max-h-[200px]">
        {playbackError && (
            <div className="mx-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-300">
                <AlertCircle size={14} />
                {playbackError}
            </div>
        )}
        
        {filteredTracks.length > 0 ? (
          <div className="space-y-1">
            {filteredTracks.map(track => {
              const isSelected = selectedUrl === track.url;
              const isPlaying = previewTrackId === track.id;

              return (
                <div 
                  key={track.id}
                  onClick={() => onSelect(track.url, track.title)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                    isSelected 
                    ? 'bg-indigo-500/10 border-indigo-500/50' 
                    : 'bg-transparent border-transparent hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={(e) => handlePreview(track, e)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isPlaying ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                    </button>
                    
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {track.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{track.category}</span>
                        <span>•</span>
                        <span>{track.duration}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={16} className="text-indigo-400 mr-1" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 text-slate-500 text-xs">
            <Music size={24} className="mb-2 opacity-50" />
            No tracks found
          </div>
        )}
      </div>
    </div>
  );
};
