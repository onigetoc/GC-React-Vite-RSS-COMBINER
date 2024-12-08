import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Rss, Save, Plus } from "lucide-react";
import axios from "axios"; // Importez axios pour les requêtes HTTP

const RSSPage = () => {
  const { toast } = useToast();
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
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const urls = feedUrls.split(/[\n,]/).map(url => url.trim()).filter(Boolean);
    
    try {
      toast({
        title: "Traitement en cours",
        description: "Combinaison des flux RSS..."
      });

      // Envoyez les données au serveur
      const response = await axios.post('/combine-rss', {
        feedUrls: urls,
        channelConfig: channelConfig,
      });

      // Récupérez le flux RSS combiné
      const { xml, filename } = response.data;
      console.log("Flux RSS combiné :", xml);

      toast({
        title: "Succès",
        description: "Les flux RSS ont été combinés avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la combinaison des flux :", error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de la combinaison des flux RSS: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Rss className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Combinateur RSS</h1>
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
              <Label htmlFor="link">Lien du site 2</Label>
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
              <Label htmlFor="feeds">URLs des flux RSS</Label>
              <Textarea
                id="feeds"
                value={feedUrls}
                onChange={(e) => setFeedUrls(e.target.value)}
                placeholder="Entrez les URLs des flux RSS (un par ligne ou séparés par des virgules)"
                className="min-h-[150px]"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Générer et Sauvegarder
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RSSPage;