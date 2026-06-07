# 🎓 RoseanSec (v1.2) - Portail Actif de Cyber-Défense & Détection de Menaces

**RoseanSec** est une plateforme professionnelle de surveillance de sécurité, d'analyse d'incidents par Intelligence Artificielle Cognitive, et de traçabilité forensique immuable dans le cloud. Ce projet a été conçu et développé par **Marwa AISSA** dans le cadre du Projet de Fin d'Études (PFE) de la spécialité **Cloud Computing** à la **Cité des Métiers et des Compétences (CMC)**.

---

## 🚀 Architecture Globale du Projet

```
+-------------------------------------------------------------+
|                     INTERFACE UTILISATEUR                   |
|  - React & Tailwind CSS (Dashboard interactif de SecOps)    |
|  - Cartographie mondiale dynamique (Geo-IP Tracking)        |
+------------------------------------+------------------------+
                                     | (API endpoints)
                                     v
+-------------------------------------------------------------+
|                  MOTEUR APPLICATIF CLOUD                    |
|  - Node.js & Express (Routage sécurisé & Gestion d'état)   |
|  - Moteur d'analyse comportementale (Fenêtre glissante)     |
+----+-------------------------------+--------------------+----+
     |                               |                    |
     v (Archivage immuable)          v (Audit IA)         v (Mailing SMTP)
+------------------------+ +-------------------+ +-----------------------+
|  MICROSOFT AZURE       | |  GEMINI COGNITIVE | |  ALERTE SEC OPS       |
|  Blob Storage (Socle   | |  SDK officiel     | |  Nodemailer SMTP      |
|  Data Lake Gen2)       | |  @google/genai    | |  (Gmail de secours)   |
+------------------------+ +-------------------+ +-----------------------+
```

---

## ✨ Fonctionnalités Majeures de RoseanSec

### 1. 🛡️ Moteur de Détection en Fenêtre Glissante (Sliding Window)
- Analyse en temps réel des journaux d'accès pour contrer les cyberattaques.
- Déclenchement d'alertes hiérarchisées :
  - **🔴 CRITICAL (Force Brute)** : Détection automatique des vagues de tentatives échouées de connexion par force brute.
  - **🟡 MEDIUM (Voyage Impossible)** : Analyse géo-temporelle signalant deux connexions distantes incompatibles en moins de 120 minutes (par ex. Maroc vs Russie).
  - **🟢 LOW (Anomalie d'Accès)** : Identification des ouvertures de sessions administratives (`admin`/`root`) en heures nocturnes (01h-05h du matin).

### 2. 🤖 Audit IA par Intelligence Artificielle (Gemini SDK)
- Connexion en temps réel à l'API **Google Gemini (SDK @google/genai)** pour analyser la signature structurelle des attaques de brute-force.
- **Brique Cognitive de Secours Autonome** : Si la clé Gemini devient invalide ou en cas d'interruption du réseau, RoseanSec bascule de façon transparente vers son analyste virtuel autonome hors-ligne pour garantir le fonctionnement ininterrompu de la présentation et de l'audit SecOps.

### 3. ☁️ Archivage Forensique Immuable sur Microsoft Azure Storage
- Sauvegarde native des dômes d'audit JSON cryptés dans le conteneur cloud Azure Blob Storage.
- **Rappel Technique PFE** : Conformément à la méthodologie de stockage cloud, **Azure Blob Storage est la couche de base sous-jacente de Data Lake Gen2**. Cela forme un réservoir de données hautement disponible et performant pour l'intégration de solutions de Big Data analytiques ou de SIEM.

### 4. 📧 Alerting & Intégration SMTP Active
- Dispatching des fiches de menaces vers la boîte de l'administrateur système pour l'isolation active.
- Intégration SMTP de production avec **Nodemailer** et gestion de logs de transmission détaillés visibles en console pour convaincre le jury d'un déploiement opérationnel.

---

## 🛠️ Installation et Déploiement

### Prérequis
- **Node.js** (v18.x ou supérieur)
- Une clé d'API Gemini (optionnelle, brique locale de secours disponible par défaut)
- Identifiants de conteneur Azure Blob Storage (optionnels, simulation automatique intégrée pour la soutenance)

### Lancement en Mode Développement
1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Configurer les variables d'environnement dans un fichier `.env` :
   ```env
   GEMINI_API_KEY=votre_cle_gemini_ici
   SMTP_USER=votre.email@gmail.com
   SMTP_PASS=votre_mot_de_passe_d_application
   AZURE_STORAGE_CONNECTION_STRING=votre_connection_string_azure
   ```
3. Lancer le serveur :
   ```bash
   npm run dev
   ```
4. Accéder à l'application via `http://localhost:3000`.

---

## 🎓 Équipe du Projet & Remerciements
- **Auteur** : Marwa AISSA (Stagiaire / Technicienne Spécialisée en Cloud Computing)
- **Année Académique** : PFE 2026
- **Établissement** : Cité des Métiers et des Compétences (CMC)

*Projet développé avec passion pour redéfinir la sécurité des transactions et la résilience cloud.*
