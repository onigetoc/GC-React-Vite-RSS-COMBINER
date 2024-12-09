import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Rss, Save } from "lucide-react";
import { parseRSSFeeds } from "@/lib/rss-combiner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages } from "@/lib/languages";

const Index = () => {
  const { toast } = useToast();
  const [feedUrls, setFeedUrls] = useState("");
  const [rssContent, setRssContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("fr");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const content = await parseRSSFeeds(feedUrls);
      setRssContent(content);
      toast({
        title: "Success",
        description: "RSS feeds combined successfully",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to combine RSS feeds",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="feedUrls">RSS Feed URLs</Label>
            <Input
              id="feedUrls"
              value={feedUrls}
              onChange={(e) => setFeedUrls(e.target.value)}
              placeholder="Enter RSS feed URLs separated by commas"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Feed Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <span className="flex items-center">
                <Rss className="mr-2 h-4 w-4 animate-spin text-[#F26522]" />
                Loading...
              </span>
            ) : (
              <span className="flex items-center">
                <Rss className="mr-2 h-4 w-4 text-[#F26522]" />
                Combine RSS Feeds
              </span>
            )}
          </Button>
        </div>
      </form>
      {rssContent && (
        <div className="space-y-2">
          <Label>Result</Label>
          <Textarea
            value={rssContent}
            readOnly
            rows={10}
            className="font-mono text-sm"
          />
        </div>
      )}
    </Card>
  );
};

export default Index;