
# Application RSS Combiner

## Vue d'ensemble du projet réalisé jusqu'a maintenant:

Application web permettant de combiner et gérer différents flux RSS avec stockage des données utilisateur via Supabase.

Fonctionnalités principales
1. Gestion des flux RSS
Combinaison de multiples flux RSS en un seul
Flux par défaut : BBC News Tech et podcast Megaphone
Limite configurable d'items (20 par défaut)
2. Configuration du canal
Personnalisation du titre
Description personnalisée
Lien personnalisé
Sélection de la langue (sauvegardée dans localStorage)
3. Interface utilisateur
Thème clair/sombre
Notifications système
Navigation principale
Barre latérale des flux
Formulaires interactifs
Support multilingue
4. Intégration Supabase
Base de données
Table users : Informations des utilisateurs
Table feeds : Flux RSS sauvegardés
Table combined_feeds : XML générés
Authentification utilisateur intégrée
Fonctionnalités Supabase
Sauvegarde des configurations utilisateur
Stockage des flux favoris
Historique des flux générés
Gestion des sessions utilisateur
Export/Import des configurations
5. Composants UI
Navigation
Sidebar
Formulaires
Boutons
Sélecteurs
Cartes
Icônes de copie
Technologies utilisées
React/TypeScript
Supabase (Backend as a Service)
Axios pour les requêtes HTTP
LocalStorage pour les préférences
Composants UI personnalisés

here my web app structur:

- .env
- .env.example
- .gitignore
- backend
  - .env
  - api
    - .env
    - combine-rss.js
  - bun.lockb
  - package.json
  - server.js
  - supabaseClient.js
- bun.lockb
- components.json
- eslint.config.js
- index.html
- package-lock.json
- package.json
- postcss.config.js
- project-infos.txt
- project_structure.text
- public
  - favicon.ico
  - og-image.png
  - placeholder.svg
- README.md
- src
  - App.css
  - App.tsx
  - components
    - AuthGuard.tsx
    - CopyIcon.tsx
    - LoadingSpinner.tsx
    - Navigation.tsx
    - SidebarFeeds.tsx
    - ui
      - accordion.tsx
      - alert-dialog.tsx
      - alert.tsx
      - aspect-ratio.tsx
      - avatar.tsx
      - badge.tsx
      - breadcrumb.tsx
      - button.tsx
      - calendar.tsx
      - card.tsx
      - carousel.tsx
      - chart.tsx
      - checkbox.tsx
      - collapsible.tsx
      - command.tsx
      - context-menu.tsx
      - dialog.tsx
      - drawer.tsx
      - dropdown-menu.tsx
      - form.tsx
      - hover-card.tsx
      - input-otp.tsx
      - input.tsx
      - label.tsx
      - menubar.tsx
      - navigation-menu.tsx
      - pagination.tsx
      - popover.tsx
      - progress.tsx
      - radio-group.tsx
      - resizable.tsx
      - scroll-area.tsx
      - select.tsx
      - separator.tsx
      - sheet.tsx
      - sidebar.tsx
      - skeleton.tsx
      - slider.tsx
      - sonner.tsx
      - switch.tsx
      - table.tsx
      - tabs.tsx
      - textarea.tsx
      - toast.tsx
      - toaster.tsx
      - toggle-group.tsx
      - toggle.tsx
      - tooltip.tsx
      - use-toast.ts
  - contexts
    - theme-provider.tsx
  - hooks
    - use-mobile.tsx
    - use-toast.ts
  - index.css
  - index.tsx
  - lib
    - languages.ts
    - rss-combinerTEST.ts
    - supabase.ts
    - utils.ts
  - main.tsx
  - pages
    - combine.tsx
    - Index.tsx
    - Login.tsx
    - rss-back.tsx
  - styles
    - globals.css
    - theme.ts
  - vite-env.d.ts
- tailwind.config.ts
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts
- xml
  - combined-1733849721935.xml
