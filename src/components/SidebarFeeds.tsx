import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, Copy, X, Rss } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarFeedsProps {
  feeds: any[];
  onFeedClick: (feed: any) => void;
  onCopyClick: (url: string) => void;
  onDeleteClick: (feed: any) => Promise<void>;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const SidebarFeeds: React.FC<SidebarFeedsProps> = ({
  feeds,
  onFeedClick,
  onCopyClick,
  onDeleteClick,
  isOpen,
  toggleSidebar,
}) => {
  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-800 shadow-lg transition-transform duration-300 z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-64 h-full pt-[100px] p-4 overflow-auto"> 
          <div className="flex items-center gap-2 mb-6">
            <Rss className="h-5 w-5 text-[#F26522]" />
            <h3 className="text-xl font-bold text-foreground">My Feeds</h3>
          </div>
          <ul className="space-y-2">
            {feeds.map((feed) => (
              <li key={feed.id} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => onFeedClick(feed)} 
                    className="text-left font-medium truncate flex-1 mr-2"
                    title={feed.title}
                  >
                    {feed.title}
                  </button>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        const combinedFeedUrl = `http://localhost:3001/xml/combined-${feed.id}.xml`;
                        onCopyClick(combinedFeedUrl);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      onClick={() => onDeleteClick(feed)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button
        onClick={toggleSidebar}
        className="fixed top-[14px] left-4 z-[60]" // Changé z-30 à z-[60] pour être au-dessus de la navigation
      >
        <PanelLeft className="h-6 w-6" />
      </Button>
    </>
  );
};
