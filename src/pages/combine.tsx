import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Rss, Save, Plus } from "lucide-react";
import { useTheme } from "@/contexts/theme-provider";
import { Navigation } from "@/components/Navigation";
import axios from "axios"; // Importez axios pour les requêtes HTTP
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages } from "@/lib/languages";
import { supabase } from "@/lib/supabase";
import CopyIcon from "@/components/CopyIcon";

const Combine = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [feedUrls, setFeedUrls] = useState(`http://feeds.bbci.co.uk/news/technology/rss.xml
https://feeds.megaphone.fm/ADL9840290619`);
  
  // Utiliser localStorage pour la langue, avec en-US par défaut
  const [channelConfig, setChannelConfig] = useState({
    title: "",
    description: "",
    link: "",
    language: localStorage.getItem('preferredLanguage') || "en-US",
    itemsLimit: 20 // Ajout du nombre d'items par défaut
  });

  const [savedFeeds, setSavedFeeds] = useState([]);
  
  useEffect(() => {
    const fetchFeeds = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(); // Utilisez getUser() au lieu de user()

      if (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        return;
      }

      if (user) {
        // Récupérer les flux enregistrés
        const { data, error } = await supabase
          .from('rss_configs')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Erreur lors de la récupération des flux:', error);
        } else {
          setSavedFeeds(data);
        }
      }
    };

    fetchFeeds();
  }, []);

  const handleFeedClick = async (feed) => {
    // Charger les données du flux dans le formulaire
    setChannelConfig({
      title: feed.title,
      description: feed.description,
      link: feed.link,
      language: feed.language,
      itemsLimit: feed.nbr_items
    });

    // Récupérer les URLs des sources
    const { data: sources, error } = await supabase
      .from('rss_sources')
      .select('url')
      .eq('config_id', feed.id);

    if (error) {
      console.error('Erreur lors de la récupération des sources:', error);
    } else {
      setFeedUrls(sources.map(s => s.url).join('\n'));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: "L'URL a été copiée dans le presse-papiers",
      });
    } catch (err) {
      // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Copié",
          description: "L'URL a été copiée dans le presse-papiers",
        });
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de copier l'URL",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  // Nouvelle fonction pour gérer le changement de langue
  const handleLanguageChange = (value: string) => {
    localStorage.setItem('preferredLanguage', value);
    setChannelConfig(prev => ({
      ...prev,
      language: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedUrls.trim() || !channelConfig.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Improved URL parsing: handle both commas and newlines
    const urls = feedUrls
      .split(/[\n,]/)                    // Split by newline or comma
      .map(url => url.trim())           // Remove whitespace
      .filter(url => url.length > 0);     // Remove empty entries

    // Récupérer l'utilisateur authentifié
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(); // Utilisez getUser() au lieu de user()

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError);
      toast({
        title: "Error",
        description: "Une erreur s'est produite lors de la récupération de l'utilisateur",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Processing",
        description: "Combining RSS feeds...",
      });

      // Modifiez le port ici aussi
      const response = await axios.post('http://localhost:3001/combine-rss', {
        feedUrls: urls,
        channelConfig: channelConfig,
        user: { id: user.id } // Utilisez user.id
      });

      // Ajout de logs pour déboguer
      console.log("Réponse complète:", response);
      console.log("Données de la réponse:", response.data);

      // Récupérez le flux RSS combiné
      const { xml, filename } = response.data;
      console.log("Flux RSS combiné :", xml);

      // Optionnel : téléchargez le fichier ou affichez-le à l'utilisateur
      // ...votre code pour gérer le fichier...

      toast({
        title: "Success",
        description: "RSS feeds have been combined successfully",
        className: "success"  // Utilisation de la classe success au lieu de variant
      });

      // Mettre à jour la liste des flux sauvegardés
      // Optionnel: recharger les flux depuis la base de données
      // fetchFeeds(); // Si vous avez rendu fetchFeeds accessible
    } catch (error) {
      console.error("Error while combining feeds:", error);
      toast({
        title: "Error",
        description: `An error occurred while combining RSS feeds: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4 max-w-2xl pt-20 flex">
        {/* Contenu principal */}
        <div className="w-3/4">
          <div className="p-6 space-y-6 rounded-lg border shadow-lg bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <Rss className="h-6 w-6 text-[#F26522]" /> {/* Changement ici : couleur orange RSS officielle */}
              <h1 className="text-2xl font-bold">RSS Feed Combiner</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Feed Title</Label>
                  <Input
                    id="title"
                    value={channelConfig.title}
                    onChange={(e) => setChannelConfig({
                      ...channelConfig,
                      title: e.target.value
                    })}
                    placeholder="My Combined RSS Feed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={channelConfig.description}
                    onChange={(e) => setChannelConfig({
                      ...channelConfig,
                      description: e.target.value
                    })}
                    placeholder="Description of your RSS feed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Website Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={channelConfig.link}
                    onChange={(e) => setChannelConfig({
                      ...channelConfig,
                      link: e.target.value
                    })}
                    placeholder="https://yourwebsite.com"
                    className="bg-background [&:not(:focus)]:bg-background [&:valid]:bg-background" // Override des styles du navigateur
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Feed Language</Label>
                    <Select 
                      value={channelConfig.language} 
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select a language" />
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

                  <div className="space-y-2">
                    <Label htmlFor="itemsLimit">Number of Items</Label>
                    <Input
                      id="itemsLimit"
                      type="number"
                      min="1"
                      max="100"
                      value={channelConfig.itemsLimit}
                      onChange={(e) => setChannelConfig(prev => ({
                        ...prev,
                        itemsLimit: Math.max(1, parseInt(e.target.value) || 20)
                      }))}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeds">
                    RSS Feed URLs <span className="text-sm text-muted-foreground">(one per line or comma-separated)</span>
                  </Label>
                  <Textarea
                    id="feeds"
                    value={feedUrls}
                    onChange={(e) => setFeedUrls(e.target.value)}
                    placeholder={`Enter RSS feed URLs:
http://feeds.bbci.co.uk/news/technology/rss.xml
https://feeds.megaphone.fm/ADL9840290619`}
                    className="min-h-[150px]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium"
              >
                <Save className="mr-2 h-4 w-4" />
                Generate and Save
              </Button>
            </form>
          </div>
        </div>
        {/* Barre latérale "My feeds" */}
        <div className="w-1/4 pl-4">
          <h2 className="text-xl font-bold mb-4">My feeds</h2>
          <ul className="space-y-2">
            {savedFeeds.map(feed => (
              <li key={feed.id} className="border-b pb-2">
                <button
                  onClick={() => handleFeedClick(feed)}
                  className="text-left font-medium text-blue-600 hover:underline"
                >
                  {feed.title}
                </button>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="mr-2">/generated/{feed.id}.xml</span>
                  <button onClick={() => copyToClipboard(`/generated/${feed.id}.xml`)}>
                    <CopyIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Combine;