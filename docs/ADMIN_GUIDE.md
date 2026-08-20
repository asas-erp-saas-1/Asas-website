# ADMIN GUIDE — ASAS Real Estate CMS

> Guide for non-technical ASAS staff: how to manage projects, apartments, media, videos, leads, and publishing.

## 1. Se connecter (Login)

1. Ouvrez le site à l'URL : `https://votre-domaine.dz/#/admin`
2. Saisissez votre **email** (ex. `admin@asas.dz`) et votre **mot de passe**.
3. Cliquez sur **Se connecter**.
4. Si vos identifiants sont corrects, le tableau de bord s'affiche.

**En cas d'échec** : message « Identifiants incorrects ». Vérifiez votre email et mot de passe. Après 8 heures, la session expire et il faut se reconnecter.

**Mot de passe oublié** : contactez l'administrateur principal. La réinitialisation se fait en base de données (champ `passwordHash` hashé avec bcrypt).

## 2. Tableau de Bord (Dashboard)

Affiche :
- **4** Projets actifs
- **22** Appartements disponibles
- **4** Réservés / **0** Vendus
- **0** Nouveaux leads

Boutons d'action rapide : Gérer Projets, Gérer Appartements, Voir Leads.

## 3. Gérer les Projets

### 3.1 Liste
Cliquez sur **Projets** dans la barre latérale. La table affiche :
- Nom + slug
- Localisation (district, city)
- Statut (Disponible, Bientôt, Épuisé, etc.)
- **État de publication** : `Publié` (badge vert) ou `Brouillon` (badge orange)
- Nombre d'appartements
- Étoile favori
- Prix de départ
- Actions : **Aperçu** (œil), **Modifier** (chevron), **Archiver** (corbeille)

### 3.2 Publier / Dépublier
- Cliquez sur le badge `Publié` ou `Brouillon` pour basculer l'état.
- **Dépublier** masque immédiatement le projet du site public.
- **Republier** le rend visible.

### 3.3 Aperçu sur le site
- Cliquez sur l'icône **œil** dans la colonne Actions.
- Une nouvelle fenêtre s'ouvre avec la page publique du projet.

### 3.4 Modifier un projet
- Cliquez sur l'icône **chevron droit**.
- Une fenêtre s'ouvre avec les champs : nom, statut, publication, mise en avant, description.
- Modifiez puis cliquez **Enregistrer**.

### 3.5 Créer un nouveau projet
- Cliquez sur **+ Nouveau** en haut à droite.
- Remplissez le formulaire (nom, statut, description).
- Le projet est créé en **Brouillon** par défaut — invisible sur le site public.
- Cliquez sur le badge `Brouillon` pour le **Publier**.

### 3.6 Archiver un projet
- Cliquez sur l'icône **corbeille**.
- Une boîte de dialogue demande confirmation :
  > « Archiver le projet "..." ? Il sera dépublié et masqué du site public. »
- Cliquez **OK** pour archiver.
- Le projet reçoit `archived=true` + `published=false`. Il n'apparaît plus dans la liste publique, mais reste en base pour les leads historiques.

## 4. Gérer les Appartements

### 4.1 Liste + filtres
Cliquez sur **Appartements**. Utilisez les filtres en haut :
- **Projet** : filtrer par projet parent
- **Statut** : Disponible, Réservé, Vendu, Bientôt, Retiré, Brouillon
- **Type** : F2, F3, F4, Duplex, Studio, Villa

### 4.2 Workflow de création d'un appartement
1. Cliquez **+ Nouvel Appartement**
2. Sélectionnez le projet parent
3. Saisissez : numéro, référence, type (F2/F3/F4), surface, étage, bâtiment, orientation
4. Chambres, salles de bain, balcons, terrasse, parking
5. **Prix** (en DA) — sera automatiquement divisé par la surface pour afficher le prix/m²
6. Plan de paiement (texte libre)
7. Statut (Disponible par défaut)
8. Description
9. Caractéristiques (climatisation, double vitrage, etc.)
10. Cliquez **Enregistrer**

L'appartement est créé en **Brouillon** par défaut. Cliquez sur le badge pour le **Publier**.

### 4.3 Modifier le prix d'un appartement
1. Ouvrez l'appartement en édition (chevron droit).
2. Modifiez le champ **Prix**.
3. Enregistrez.
4. Le nouveau prix est **immédiatement visible** sur :
   - La page de l'appartement
   - L'inventaire du projet
   - Les cartes d'appartements
   - La recherche et les filtres
   - Les données structurées SEO
   - Pas de modification manuelle ailleurs nécessaire.

## 5. Médiathèque (Media Library)

### 5.1 Téléverser une image
1. Cliquez sur **Médiathèque** dans la barre latérale.
2. Dans le panneau de gauche, **Téléverser un média** :
   - **Cible** : Projet ou Appartement
   - Sélectionnez le projet/appartement spécifique
   - **Type** : hero, gallery, floor-plan, 3d-plan, render, interior, exterior, amenity
   - **Texte alt** : description pour l'accessibilité (ex: « Façade principale »)
   - **Légende** : optionnelle
3. Glissez-déposez une image dans la zone pointillée, OU cliquez pour choisir un fichier.
   - Formats acceptés : JPEG, PNG, WebP, AVIF, GIF
   - Taille max : 8 MB
   - La validation MIME et des **magic bytes** est appliquée — les fichiers renommés sont rejetés.
4. Cliquez **Téléverser**.
5. La barre de progression affiche l'avancement.
6. L'image apparaît dans la grille à droite.

### 5.2 Modifier un média
- Cliquez sur **Modifier** sous une image.
- Une fenêtre s'ouvre avec : aperçu, type, alt, légende.
- Modifiez puis **Enregistrer**.

### 5.3 Supprimer un média
- Cliquez sur l'icône **corbeille** sous une image.
- Confirmation demandée : « Supprimer ce média ? Cette action supprimera définitivement le fichier et son enregistrement en base. »
- Le fichier est supprimé du disque et la ligne de la base est effacée.

### 5.4 Filtrer et rechercher
- **Filtres** en haut : Toutes cibles / Projets / Appartements ; Tous types ou un type spécifique.
- **Recherche** : tapez dans le champ pour chercher par alt ou légende.

## 6. Gestion des Vidéos

Le gestionnaire de vidéos se trouve dans le panneau gauche de la **Médiathèque**, sous le formulaire d'upload d'images.

### 6.1 Ajouter une vidéo
1. Sélectionnez la cible (Projet ou Appartement).
2. Sélectionnez l'entité spécifique.
3. Saisissez l'**URL vidéo** (YouTube ou Vimeo).
   - Exemples acceptés :
     - `https://www.youtube.com/watch?v=ABC123`
     - `https://youtu.be/ABC123`
     - `https://vimeo.com/123456789`
4. Saisissez un **Titre** (obligatoire).
5. Description (optionnelle).
6. Type : HERO, GALLERY, WALKTHROUGH, INTERVIEW.
7. URL Thumbnail (optionnelle — sinon, l'image de miniature par défaut est utilisée).
8. Cliquez **Ajouter la vidéo**.

La vidéo apparaît immédiatement sur la page publique du projet ou de l'appartement.

### 6.2 Gérer les vidéos existantes
Pour chaque vidéo, vous pouvez :
- **Étoile** : mettre en avant / retirer des favoris (une vidéo `featured` s'affiche en grand).
- **Œil** : publier / dépublier (la vidéo `Non publié` n'apparaît pas sur le site public).
- **Corbeille** : supprimer avec confirmation.

## 7. Leads (Contacts)

Cliquez sur **Leads** dans la barre latérale.

### 7.1 Consulter les leads
La table affiche : Nom, Téléphone, Email, Intention (Info, Prix, Plan, Visite, WhatsApp, Appel, Réservation), Propriété concernée, Statut (Nouveau, Contacté, Qualifié, Converti, Perdu), Date.

### 7.2 Filtrer
Utilisez le filtre **Statut** en haut pour ne voir que certains leads (ex: uniquement les Nouveaux).

### 7.3 Workflow de traitement
1. Un visiteur remplit le formulaire sur le site → POST `/api/leads` → 201 Created
2. Le lead apparaît dans l'admin avec statut `Nouveau`.
3. Un conseiller ASAS prend contact (WhatsApp / téléphone).
4. Modifiez le statut en `Contacté` (TODO: la modification côté admin sera ajoutée prochainement).
5. Suite à l'interaction, passez à `Qualifié`, `Converti` ou `Perdu`.

## 8. Paramètres

L'onglet **Paramètres** affiche :
- Votre compte (nom, email, rôle)
- Description du rôle :
  - **Administrateur** : Accès complet — projets, appartements, médias, leads, paramètres.
  - **Éditeur** : Création et édition de contenu immobilier et médias. Pas de gestion des utilisateurs.
  - **Lecteur** : Lecture seule.
- Résumé de sécurité : authentification bcrypt, cookie httpOnly, routes protégées, validation des uploads.

## 9. Déconnexion

Cliquez sur **Déconnexion** en bas de la barre latérale. La session est révoquée côté serveur et le cookie est supprimé.

## 10. Bonnes pratiques

- ✅ Toujours remplir le **texte alt** des images (accessibilité + SEO).
- ✅ Publier les projets avant de publier leurs appartements (sinon les appartements sont orphelins sur le site public).
- ✅ Utiliser des images en **WebP** ou **AVIF** pour des tailles optimales.
- ✅ Compresser les images avant upload (max 8 MB).
- ✅ Pour les vidéos YouTube/Vimeo, vérifier que la vidéo est **publique** (non privée) avant de l'ajouter.
- ✅ Dépublier (mettre en Brouillon) au lieu de supprimer pour masquer temporairement.

## 11. FAQ

**Q : J'ai oublié mon mot de passe. Que faire ?**
R : Contactez l'administrateur principal. Le mot de passe est haché en base (bcrypt) — il n'est pas récupérable. L'admin peut réinitialiser via un script Prisma.

**Q : Combien de temps dure ma session ?**
R : 8 heures. Ensuite, vous devez vous reconnecter.

**Q : Puis-je éditer plusieurs projets en même temps ?**
R : Une seule fenêtre d'édition est ouverte à la fois. Mais vous pouvez ouvrir plusieurs onglets de navigateur.

**Q : Que se passe-t-il si je ferme le navigateau pendant un upload ?**
R : L'upload est annulé. Le fichier partiel n'est pas écrit sur le disque (validation complète avant écriture).

**Q : Mes changements ne s'affichent pas sur le site public.**
R : Vérifiez que le projet/appartement est **Publié** (badge vert). Si oui, videz le cache du navigateur ou attendez 1 minute (cache TanStack Query côté client).
