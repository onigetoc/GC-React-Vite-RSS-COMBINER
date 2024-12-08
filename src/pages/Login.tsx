import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";  // Ajout de l'import manquant
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });

    if (error) {
      console.error('Erreur de connexion:', error.message);
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive"
      });
    }

    if (data) {
      console.log('Connexion réussie:', data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px] bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-card-foreground">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre compte
          </CardDescription>
        </CardHeader>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
        >
          <FcGoogle className="h-5 w-5" />
          Se connecter avec Google
        </Button>
      </Card>
    </div>
  );
};

export default Login;