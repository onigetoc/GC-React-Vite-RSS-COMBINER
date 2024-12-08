import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Rss, Save } from "lucide-react";
import { parseRSSFeeds } from "@/lib/rss-combiner";

const Index = () => {
  const { toast } = useToast();
  const [feedUrls, setFeedUrls] = useState("");
  const [rssContent, setRssContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <Card>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="feedUrls">RSS Feed URLs</Label>
        <Input
          id="feedUrls"
          value={feedUrls}
          onChange={(e) => setFeedUrls(e.target.value)}
          placeholder="Enter RSS feed URLs separated by commas"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Combine RSS Feeds"}
        </Button>
      </form>
      {rssContent && (
        <Textarea
          value={rssContent}
          readOnly
          rows={10}
          placeholder="Combined RSS feed content will appear here"
        />
      )}
    </Card>
  );
};

export default Index;