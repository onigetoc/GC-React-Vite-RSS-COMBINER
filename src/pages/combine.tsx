import { useState } from "react";
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

const Combine = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [feedUrls, setFeedUrls] = useState(`http://feeds.bbci.co.uk/news/technology/rss.xml
https://feeds.megaphone.fm/ADL9840290619`);
  const [channelConfig, setChannelConfig] = useState({
    title: "",
    description: "",
    link: "",
    language: "fr-FR"
  });

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

    try {
      toast({
        title: "Traitement en cours",
        description: "Combinaison des flux RSS...",
      });

      // Modifiez le port ici aussi
      const response = await axios.post('http://localhost:3001/combine-rss', {
        feedUrls: urls,
        channelConfig: channelConfig,
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
        title: "Succès",
        description: "Les flux RSS ont été combinés avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la combinaison des flux :", error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de la combinaison des flux RSS: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4 max-w-2xl pt-20">
        <div className="p-6 space-y-6 rounded-lg border shadow-lg bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Rss className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">RSS Feed Combiner</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du flux</Label>
                <Input
                  id="title"
                  value={channelConfig.title}
                  onChange={(e) => setChannelConfig({
                    ...channelConfig,
                    title: e.target.value
                  })}
                  placeholder="Mon flux RSS combiné"
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
                  placeholder="Description de votre flux RSS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Lien du site</Label>
                <Input
                  id="link"
                  type="url"
                  value={channelConfig.link}
                  onChange={(e) => setChannelConfig({
                    ...channelConfig,
                    link: e.target.value
                  })}
                  placeholder="https://monsite.com"
                />
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
              Générer et Sauvegarder
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Combine;