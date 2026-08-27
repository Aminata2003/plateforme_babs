# Budget prévisionnel de mise en ligne
## Plateforme Ubuntu Tech

**Document à remettre au propriétaire de la plateforme**  
**Date : 27 août 2026**

## 1. Objet

Ce document présente les dépenses nécessaires pour acheter le nom de domaine, héberger la plateforme, configurer les paiements et assurer son fonctionnement après la mise en ligne.

Les montants sont indiqués en **francs CFA (FCFA)** pour faciliter la préparation du budget.

> Les prix sont des estimations. Ils peuvent varier selon le fournisseur, le taux de change, les taxes et les promotions en cours. Le prix définitif doit être confirmé avant tout achat.

## 2. Hypothèses de conversion

- **1 dollar américain (USD) : environ 600 FCFA**
- **1 euro (EUR) : environ 656 FCFA**

Ces taux sont utilisés uniquement pour établir une estimation simple.

## 3. Dépenses indispensables

| Poste | Fréquence | Estimation en devise | Estimation en FCFA |
|---|---:|---:|---:|
| Nom de domaine `.com` | Par an | 12 à 20 USD | 7 200 à 12 000 FCFA |
| Nom de domaine `.sn` | Par an | Estimation locale | 25 000 à 60 000 FCFA |
| Hébergement backend Django | Par mois | 7 à 15 USD | 4 200 à 9 000 FCFA |
| Hébergement frontend React | Par mois | 0 à 5 USD | 0 à 3 000 FCFA |
| Base de données PostgreSQL | Par mois | 0 à 15 USD | 0 à 9 000 FCFA |
| Stockage des fichiers et certificats | Par mois | 3 à 10 USD | 1 800 à 6 000 FCFA |
| Service d’envoi d’emails | Par mois | 0 à 10 USD | 0 à 6 000 FCFA |
| Sauvegardes et surveillance | Par mois | 3 à 10 USD | 1 800 à 6 000 FCFA |
| Certificat SSL HTTPS | Par an | Souvent gratuit | 0 FCFA |

### Recommandation de départ

Pour limiter les coûts, la plateforme peut commencer avec :

- un domaine `.com` ou `.sn` ;
- un petit serveur pour Django ;
- un hébergement frontend gratuit ;
- PostgreSQL inclus dans l’offre d’hébergement ou une petite base managée ;
- un stockage séparé pour les avatars, devoirs et certificats ;
- un service email avec une offre gratuite ou de démarrage ;
- des sauvegardes automatiques.

## 4. Ngrok et notifications PayTech

### Pendant les tests

Ngrok permet de rendre temporairement accessible depuis Internet l’ordinateur local qui exécute Django. Cette adresse est nécessaire pour tester la notification IPN de PayTech en local.

| Offre indicative | Coût estimé |
|---|---:|
| Offre gratuite | 0 FCFA, avec limitations |
| Offre payante de base | Environ 8 USD/mois, soit 4 800 FCFA/mois |
| Offre avancée | Environ 20 USD/mois, soit 12 000 FCFA/mois |

### Après la mise en production

Ngrok ne devrait normalement **pas être une dépense permanente**. Une fois le backend installé sur un serveur public avec HTTPS, PayTech peut appeler directement :

`https://nom-de-domaine.tld/api/payments/ipn/`

Le propriétaire peut donc prévoir Ngrok uniquement pour les tests et le développement :

- Budget test recommandé : **0 à 4 800 FCFA par mois**.
- Budget production permanent : **0 FCFA**, si le serveur possède une URL HTTPS publique.

## 5. Frais liés aux paiements

PayTech peut appliquer des frais sur chaque transaction selon le moyen de paiement utilisé : Wave, Orange Money, Free Money ou carte bancaire.

Le montant exact dépend du contrat PayTech. Il faut demander au propriétaire du compte :

- le pourcentage prélevé par transaction ;
- les éventuels frais fixes ;
- les délais de transfert vers le compte bancaire ou mobile money ;
- les conditions de remboursement et d’annulation.

### Exemple indicatif

Pour une formation vendue **45 000 FCFA** :

| Frais hypothétiques | Montant estimé par vente |
|---:|---:|
| 1 % | 450 FCFA |
| 2 % | 900 FCFA |
| 3 % | 1 350 FCFA |

Ces montants sont uniquement des exemples et ne remplacent pas le tarif contractuel PayTech.

## 6. Budget recommandé

### Budget mensuel de fonctionnement

| Poste | Montant estimé |
|---|---:|
| Hébergement backend | 6 000 FCFA |
| Hébergement frontend | 0 FCFA |
| Base de données | 0 à 6 000 FCFA |
| Stockage des fichiers | 3 000 FCFA |
| Emails | 3 600 FCFA |
| Sauvegardes et surveillance | 3 000 FCFA |
| Ngrok pour les tests uniquement | 0 à 4 800 FCFA |
| **Total mensuel estimatif** | **15 600 à 26 400 FCFA** |

Les frais PayTech sont exclus de ce total, car ils dépendent du nombre de ventes.

### Budget annuel estimatif

| Poste | Estimation basse | Estimation haute |
|---|---:|---:|
| Fonctionnement sur 12 mois | 187 200 FCFA | 316 800 FCFA |
| Nom de domaine `.com` | 7 200 FCFA | 12 000 FCFA |
| Ou nom de domaine `.sn` | 25 000 FCFA | 60 000 FCFA |
| **Total annuel avec `.com`** | **194 400 FCFA** | **328 800 FCFA** |
| **Total annuel avec `.sn`** | **212 200 FCFA** | **376 800 FCFA** |

## 7. Dépenses ponctuelles possibles

Ces dépenses ne sont pas forcément obligatoires, mais elles peuvent être nécessaires pour une mise en ligne professionnelle.

| Poste | Estimation en FCFA |
|---|---:|
| Configuration initiale du serveur et du domaine | 50 000 à 150 000 FCFA |
| Mise en production et tests complets | 75 000 à 250 000 FCFA |
| Rédaction des conditions d’utilisation et politique de confidentialité | 50 000 à 200 000 FCFA |
| Création ou amélioration des visuels marketing | 50 000 à 300 000 FCFA |
| Maintenance technique mensuelle | 50 000 à 200 000 FCFA/mois |

Ces montants dépendent de la personne ou de l’agence chargée du travail.

## 8. Budget conseillé pour démarrer

Pour lancer la plateforme correctement, le propriétaire devrait prévoir :

- **Budget minimum de lancement hors développement : 250 000 FCFA**
- **Budget confortable de lancement : 400 000 à 600 000 FCFA**
- **Fonctionnement mensuel ensuite : environ 16 000 à 27 000 FCFA**, hors frais PayTech et maintenance humaine

Ce budget couvre principalement le domaine, les premiers mois d’hébergement, le stockage, les emails, les sauvegardes et les tests de paiement.

## 9. Checklist avant paiement

- [ ] Choisir entre le domaine `.com` et `.sn`.
- [ ] Vérifier que le nom de domaine est disponible.
- [ ] Acheter le domaine au nom du propriétaire ou de l’entreprise.
- [ ] Activer la double authentification sur les comptes fournisseurs.
- [ ] Choisir l’hébergement backend avec PostgreSQL et HTTPS.
- [ ] Configurer le domaine et les sous-domaines, par exemple `app.` et `api.`.
- [ ] Configurer les variables secrètes dans l’hébergement, jamais dans le code source.
- [ ] Configurer les sauvegardes automatiques.
- [ ] Tester l’IPN PayTech avec Ngrok avant la production.
- [ ] Vérifier un paiement test complet.
- [ ] Vérifier l’envoi des emails et la réinitialisation du mot de passe.
- [ ] Tester la génération et la vérification d’un certificat.
- [ ] Conserver les factures, accès et informations de renouvellement dans un emplacement sécurisé.

## Conclusion

Le coût technique minimal reste raisonnable si le frontend est hébergé gratuitement, si la base de données est incluse dans l’hébergement et si Ngrok est utilisé uniquement pendant les tests.

Le budget à prévoir est donc d’environ **250 000 FCFA pour le lancement**, puis **16 000 à 27 000 FCFA par mois** pour les services techniques courants, auxquels peuvent s’ajouter les frais PayTech et la maintenance de la plateforme.
