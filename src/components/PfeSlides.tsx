import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Download, 
  Tv, 
  Code, 
  Layers, 
  Workflow, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface PfeSlidesProps {
  businessName: string;
  ecommercePlatform: string;
}

export default function PfeSlides({ businessName, ecommercePlatform }: PfeSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slidesData = [
    {
      id: 1,
      section: "PAGE DE GARDE",
      duration: "50s",
      cumul: "00:50",
      title: "Soutenance de Projet de Fin d'Études (PFE)",
      subtitle: `Plateforme de Cyber-Sécurité Active & d'Archivage Forensique pour Infrastructure E-Commerce`,
      bullets: [
        "Diplôme visé : Technicienne Spécialisée en Cloud Computing.",
        `Projet d'épreuve : Solution RoseanSec pour la sécurisation active de l'écosystème d'accès d'une boutique ${ecommercePlatform}.`,
        "Piliers opérationnels : Algorithme à fenêtre glissante en mémoire vive, archivage sur Microsoft Azure, alertes SMTP certifiées et audit cognitif par IA Gemini 3.5 Flash.",
        "Auteur du projet : marwa.aissa06@gmail.com | Jury d'Évaluation Opérationnelle de Fin de Cycle."
      ],
      layout: "cover",
      notes: "« Madame, Monsieur, honorables membres du jury, bonjour. J'ai le grand plaisir de vous présenter aujourd'hui mon projet de fin d'études pour l'obtention du diplôme de Technicienne Spécialisée en Cloud Computing. Face au problème de la cyber-fraude ciblant le portail de connexion e-commerce " + ecommercePlatform + ", j'ai conçu et codé l'application RoseanSec. C'est une plateforme d'intervention active qui supervise, bloque et archive sur le Cloud Azure les attaques de brute-force. Pendant cette présentation de 10 minutes, je vais vous démontrer l'architecture concrète et le code de cette solution prête pour le monde professionnel. »"
    },
    {
      id: 2,
      section: "CONTEXTE & PROBLÉMATIQUE",
      duration: "45s",
      cumul: "01:35",
      title: "Vulnérabilités critiques des transactions e-commerce",
      subtitle: "Pourquoi les authentifications sont des cibles prioritaires d'intrusions",
      bullets: [
        "Faiblesse systémique : Les formulaires d'accès web sont assaillis en continu par des robots malveillants de brute-force.",
        "Type de cyber-menace : Attaques automatisées visant à usurper des sessions d'administration ou escroquer des clients.",
        "Limitation des solutions classiques : Les extensions standards génèrent une lourde charge CPU ou bloquent trop tardivement.",
        "Le défi relevé : Développer un filtre léger asynchrone capable d'intercepter les requêtes malveillantes sans ralentir l'accès des acheteurs."
      ],
      layout: "problem",
      notes: "« Pour poser l'importance de ce projet, les formulaires de connexion sont les points les plus vulnérables d'une boutique en ligne. Les robots testent massivement des milliers de mots de passe par minute, ce qui sature notre serveur et peut mener au vol de comptes. Les composants traditionnels ralentissent l'accès. Ma mission a donc été de concevoir une couche de filtrage asynchrone performante qui analyse et neutralise ces flux hostiles en amont, de manière instantanée et transparente. »"
    },
    {
      id: 3,
      section: "ARCHITECTURE DE ROSEANSEC",
      duration: "50s",
      cumul: "02:25",
      title: "Conception modulaire et intégration multicouche",
      subtitle: "Un écosystème logiciel pragmatique et performant",
      bullets: [
        "Module d'Ingestion & Télémétrie : Traitement non bloquant d'un flux massif de connexion (jusqu'à 10,000 logs d'événements) avec cartographie Leaflet.",
        "Module de Décision (Algorithme local) : Filtre de fenêtre glissante en mémoire vive cache pour statuer ultra-rapidement.",
        "Module d'Archivage (Cloud Microsoft Azure) : Tunnel sécurisé d'exportation vers Microsoft Azure Blob Storage pour l'analyse forensique.",
        "Module de Notification (Service SMTP) : Système d'alerte mail de crise crypté avec contrôle strict anti-exfiltration par whitelist."
      ],
      layout: "objectives",
      notes: "« Pour relever ce défi d'ingénierie logicielle, j'ai structuré RoseanSec autour de quatre modules essentiels et complémentaires : d'abord, l'ingestion asynchrone des journaux web. Ensuite, un algorithme d'évaluation temporelle en mémoire vive pour statuer sur les blocages. Troisièmement, un archivage conforme sur le stockage cloud Azure. Et enfin, un service d'alerte SMTP pour notifier en toute sécurité l'administrateur système dès qu'une anomalie critique est détectée. »"
    },
    {
      id: 4,
      section: "ALGORITHME D'ÉVALUATION",
      duration: "55s",
      cumul: "03:20",
      title: "Algorithme de Fenêtre Glissante Haute Fréquence",
      subtitle: "Optimisation de l'évaluation mémoire pour une réactivité instantanée",
      bullets: [
        "Calcul du taux de panne temporel : Évalue le nombre d'erreurs de connexion sur un intervalle glissant Delta-T (ex. 5 tentatives d'échecs en 5 minutes).",
        "Modélisation en structures Map : Utilisation de tables de hachage associant la clé IP-Utilisateur à son historique de timings en millisecondes.",
        "Efficacité algorithmique : Complexité temps constante en O(1) permettant l'évaluation de 1200+ logs à la milliseconde sans geler le serveur.",
        "Neutralisation des faux-positifs : Gestion d'une liste blanche d'IP approuvées pour s'assurer que les administrateurs légitimes ne soient jamais bloqués."
      ],
      layout: "algorithm",
      notes: "« L'optimisation algorithmique est au cœur de mon savoir-faire technique. RoseanSec implémente un système de fenêtre glissante en mémoire vive. Pour chaque échec, le système évalue la densité temporelle des tentatives récentes en lisant une table de hachage. Grâce aux structures de données Map, chaque opération se réalise en temps constant O(1), ce qui préserve notre processeur d'une surchauffe. On protège également l'accès de l'équipe interne grâce à une liste blanche dynamique. »"
    },
    {
      id: 5,
      section: "LE DASHBOARD TECHNIQUE",
      duration: "45s",
      cumul: "04:05",
      title: "Visualisation Géographique et Pilotage Asynchrone",
      subtitle: "Un tableau de bord ergonomique écrit en React 19 et Tailwind CSS",
      bullets: [
        "Fluidité de l'interface : Cartographie Leaflet dynamique qui géolocalise précisément les flux et les agresseurs dans le monde.",
        "Conception Adaptative (Responsive) : Style Tailwind assurant un confort d'utilisation absolu sur écrans d'ordinateurs, tablettes et smartphones.",
        "Analyses et Métriques de Pics : Graphique de tendance Recharts traçant les tranches horaires subissant les assauts les plus intenses.",
        "Intégration d'Actions Rapides : Panneau d'alarme de crise pour traiter, résoudre des alertes ou exporter d'un simple clic."
      ],
      layout: "tech",
      notes: "« En vue de moderniser l'exploitation informatique, j'ai développé une interface d'administration réactive en React 19 stylisée avec Tailwind CSS. J'y ai intégré une cartographie Leaflet interactive ainsi que des graphiques Recharts. C'est un véritable outil de pilotage proactif : il permet au technicien de repérer en temps réel l'origine mondiale des cyberattaques et de prendre des mesures correctives en quelques secondes à l'aide d'un panneau d'actions simples d'accès. »"
    },
    {
      id: 6,
      section: "PERSISTANCE CLOUD : AZURE STORAGE",
      duration: "50s",
      cumul: "04:55",
      title: "Sauvegarde et Traçabilité Forensique Immuable",
      subtitle: "Interfaçage sécurisé avec Microsoft Azure Blob Storage (Socle Data Lake Gen2)",
      bullets: [
        "Fondation Data Lake Gen2 : Azure Blob Storage sert de couche de stockage de base sous-jacente pour Data Lake Storage Gen2.",
        "Utilisation du client SDK Azure officiel (@azure/storage-blob) : Envoi crypté et fiable des dômes JSON d'audit de connexion vers le cloud.",
        "Résilience d'écriture réseau : Diagnostic et création dynamique du conteneur Azure à chaud s'il n'existe pas lors de l'appel d'archivage.",
        "Conformité et Intégrité Forensique : Processus d'anonymisation RGPD automatique des adresses IP avant exportation avec garantie de conservation inviolable."
      ],
      layout: "azure",
      notes: "« L'aspect cloud et persistance est un point fort de mon intégration système en tant que future technicienne en Cloud Computing. RoseanSec se connecte nativement au service de stockage d'objets Microsoft Azure Blob Storage. Il est crucial de préciser que Azure Blob Storage constitue la couche de stockage de base sous-jacente pour un Data Lake Gen2. En cas de cyberattaque extrême ou de panne complète de notre serveur physique, l'intégralité des traces d'audit de crise est préservée sur ce stockage cloud Azure hautement résilient, tout en veillant à l'anonymisation RGPD des adresses IP. »"
    },
    {
      id: 7,
      section: "MOTEUR DE NOTIFICATION SMTP",
      duration: "45s",
      cumul: "05:40",
      title: "Envoi SMTP Sécurisé et Isolation des Informations",
      subtitle: "Un service de messagerie d'alerte résistant aux fuites de données",
      bullets: [
        "Alerte de Transaction instantanée : Envoi instantané d'un email de crise listant l'attaquant, sa localisation géographique et les actions appliquées.",
        "Whitelisting restrictif : Filtrage systématique excluant tout domaine mail ne figurant pas sur la liste interne (ex. @entreprise.com, @prestataire.ma).",
        "Défense anti-exfiltration : Bloque les tentatives d'envoi secret vers des serveurs malveillants ou des adresses emails jetables temporaires.",
        "Console d'analyse intégrée : Restitution textuelle des sockets d'échange SMTP en temps réel à l'écran pour prouver la réussite de la liaison."
      ],
      layout: "smtp",
      notes: "« Afin d'avertir immédiatement le service de sécurité, j'ai conçu un moteur de notification SMTP. Sa particularité réside dans sa protection active contre l'exfiltration : le serveur RoseanSec vérifie que le domaine destinataire appartient bien à notre entreprise. Un hacker ne peut donc pas détourner ce canal pour s'auto-envoyer nos rapports confidentiels. Un outil de diagnostic réseau affiche également le flux d'échange SMTP brut, assurant la traçabilité de nos envois d'alertes. »"
    },
    {
      id: 8,
      section: "AUDIT COGNITIF IA (GEMINI)",
      duration: "55s",
      cumul: "06:35",
      title: "Analyse Assistée par Intelligence Artificielle",
      subtitle: "Faciliter la gestion de crise grâce à l'intégration de Gemini 3.5 Flash",
      bullets: [
        "API Google GenAI asynchrone : Utilisation du modèle ultra-rapide Gemini 3.5 Flash pour analyser instantanément les structures d'alertes complexes.",
        "Diagnostic automatisé : Traduction immédiate des anomalies brutes en synthèses pragmatiques et digestes pour les techniciens réseau.",
        "Validation Réglementaire Locale : Évaluation cognitive par rapport aux circulaires cyber du Maroc (Loi 09-08 de la CNDP et DN-11 de BAM).",
        "Calcul d'actions correctives : Recommandation automatique de règles de blocage réseau (IPTables, WAF, modification de ports, application de MFA)."
      ],
      layout: "gemini",
      notes: "« Pour accroître notre efficacité opérationnelle, RoseanSec intègre de l'Intelligence Artificielle de premier plan. Nous faisons appel au modèle Gemini 3.5 Flash via son API asynchrone. L'IA extrait la structure de la menace dans nos registres web bruts, la décrypte et rédige une synthèse claire des risques. Elle évalue la criticité au regard des normes nationales du Maroc et fournit instantanément au technicien un plan de remédiation direct contenant des lignes de commande correctives à copier-coller. »"
    },
    {
      id: 9,
      section: "CYBER-DÉMO ET CRASH TEST",
      duration: "55s",
      cumul: "07:30",
      title: "Émulation de 10,000 Requêtes et Résistance de Charge",
      subtitle: "Démonstration pragmatique des réactions automatiques de RoseanSec",
      bullets: [
        "Générateur de stress-test intégré : Simulation asynchrone d'un flux de connexion comprenant des requêtes légitimes et d'intrusions par brute-force.",
        "Réaction algorithmique instantanée : Blocage et notification envoyés à la volée vers l'administration dès le franchissement de seuil de sécurité.",
        "Console de supervision réactive : Permet au technicien de manipuler la base, de purger à chaud, de relancer les calculs ou de forcer un archivage Azure.",
        "Robustesse éprouvée : Zéro erreur de routage, zéro fuite mémoire, validant l'architecture face au trafic à haute fréquence."
      ],
      layout: "demo",
      notes: "« Pour valider le comportement de ma solution devant vous aujourd'hui, j'ai développé un outil d'émulation de crash-test. Nous pouvons injecter d'un coup 10,000 connexions de serveurs. L'algorithme trie ce flux à la volée. Nous observons en direct les statistiques de pics géographiques se mettre à jour sur la carte Leaflet, et les fiches d'alerte s'alimenter instantanément. Le système réagit sans introduire la moindre lenteur sur le site principal. »"
    },
    {
      id: 10,
      section: "RÉGLEMENTATION & SOUVERAINETÉ",
      duration: "50s",
      cumul: "08:20",
      title: "Conformité aux Exigences Juridiques Nationales",
      subtitle: "Pourquoi RoseanSec garantit la protection du patrimoine numérique local",
      bullets: [
        "Conformité Loi 09-08 (Maroc CNDP) : respect de la vie privée des clients e-commerce par anonymisation des IP en mémoire et archivage.",
        "Directives BAM Circulaire DN-11 : Isolation sécurisée des registres d'échec de connexion et traçabilité inaltérable pour le contrôle réglementaire.",
        "Indépendance technologique : Solution autonome de contrôle d'accès garantissant la souveraineté complète des données et évitant des coûts de licences d'éditeurs tiers.",
        "Valorisation de l'Ingénierie Nationale : RoseanSec démontre l'importance d'outils de cyber-défense adaptés aux réglementations et acteurs marocains."
      ],
      layout: "law",
      notes: "« L'aspect réglementaire a guidé mes choix de programmation. Au Maroc, la loi 09-08 impose le respect strict des informations privées des acheteurs. RoseanSec y répond en anonymisant systématiquement les adresses IP stockées. De plus, mon architecture répond aux requêtes d'isolation et d'archivage sécurisé édictées par la circulaire DN-11 de Bank Al-Maghrib. C'est une solution robuste, économique et souveraine pour nos structures. »"
    },
    {
      id: 11,
      section: "CONCLUSION ET COMPÉTENCES MÉTIERS",
      duration: "50s",
      cumul: "09:10",
      title: "Bilan des Compétences Validées et Perspectives d'Évolution",
      subtitle: "Un projet pilote illustrant de solides bases d'intégration technique",
      bullets: [
        "Compétences clés démontrées : Maîtrise avancée du JavaScript asynchrone (Node.js/Express), intégration des API Cloud d'Azure, et architecture d'interface React 19.",
        "Rapport Utilité/Coût Optimal : Création d'un outil de cyber-sécurité autonome sans aucune licence extérieure onéreuse.",
        "Voie d'évolution 1 - Coupe-Circuit Réseau : Interfaçage de RoseanSec avec des scripts Shell système Linux (IPtables/UFW) pour bloquer physiquement les hackers.",
        "Voie d'évolution 2 - Modèle Anomaly Detection : Ajout d'une brique d'évaluation statistique par Machine Learning local pour identifier les attaques camouflées."
      ],
      layout: "conclusion",
      notes: "« En conclusion, ce travail de fin d'études synthétise l'ensemble des compétences de mon cursus : de la maîtrise du serveur web asynchrone Node.js à l'intégration d'API cloud complexes Microsoft ou d'Intelligence Artificielle. RoseanSec est une preuve de concept pleinement fonctionnelle. À l'avenir, j'envisage de relier directement mon serveur à des scripts d'administration shell pour exécuter un blocage réseau physique au niveau du pare-feu de la machine virtuelle. »"
    },
    {
      id: 12,
      section: "REMERCIEMENTS & QUESTIONS",
      duration: "50s",
      cumul: "10:00",
      title: "Merci de Votre Attention Chaleureuse",
      subtitle: "Session ouverte pour les questions et démonstrations",
      bullets: [
        "Projet RoseanSec v1.2 : 'La cyber-résilience moderne et le cloud enfin accessibles à tous les hébergements web.'",
        "Remerciements sincères : À l'équipe d'encadrement académique et aux membres de ce jury professionnel pour votre évaluation constructive.",
        "Disponibilité technique : Je me tiens à votre entière disposition pour tout examen du code source de l'algorithme, des liaisons Azure ou de l'analyse IA.",
        "marwa.aissa06@gmail.com | Diplôme de Technicienne Spécialisée en Cloud Computing"
      ],
      layout: "thanks",
      notes: "« Pour conclure, cette expérience de fin d'études a conforté ma passion pour les architectures cloud et la sécurité. Je tiens à remercier mon encadrant pédagogique pour ses conseils avisés ainsi que vous, honorables membres du jury, d'avoir pris le temps d'évaluer ce projet. C’est avec grand intérêt que je suis désormais disponible pour répondre à vos questions et vous présenter le code ou la démo de mon application RoseanSec. Merci. »"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slidesData.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Automated PDF document generation representing the extensive presentation
  const handleExportSlidesPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    slidesData.forEach((slide, idx) => {
      if (idx > 0) doc.addPage('landscape');

      // 1. Draw slides background layout
      doc.setFillColor(37, 25, 35); // Very dark cherry background
      doc.rect(0, 0, 297, 210, 'F');

      // 2. Sidebar border in Gold/Bordeaux logo style
      doc.setFillColor(128, 0, 32); // Burgundy
      doc.rect(0, 0, 10, 210, 'F');
      doc.setFillColor(255, 182, 193); // Pink accent
      doc.rect(10, 0, 1.5, 210, 'F');

      // 3. Slide Metadata Header
      doc.setTextColor(255, 182, 193);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`SLIDE ${slide.id} / ${slidesData.length} | SECTION : ${slide.section} | Durée : ${slide.duration} (Cumul: ${slide.cumul})`, 20, 18);

      // 4. Slide main Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(slide.title, 20, 28);

      // 5. Slide Subtitle
      doc.setTextColor(210, 200, 210);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      doc.text(slide.subtitle, 20, 35);

      // Divider line
      doc.setDrawColor(255, 182, 193);
      doc.setLineWidth(0.3);
      doc.line(20, 40, 277, 40);

      // 6. Draw Bullets Text beautifully
      doc.setTextColor(240, 235, 240);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      
      let startY = 52;
      slide.bullets.forEach((bullet) => {
        // Safe line wrapping helper to avoid spilling past PDF slide margins
        const splitText = doc.splitTextToSize(`- ${bullet}`, 250);
        doc.text(splitText, 20, startY);
        startY += splitText.length * 6 + 2;
      });

      // 7. Footer line notes indication
      doc.setDrawColor(128, 0, 32);
      doc.line(20, 182, 277, 182);

      doc.setTextColor(180, 160, 180);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text("CONSEIL JURY : Adaptez le ton selon l'intérêt des évaluateurs sur l'algorithme.", 20, 189);
      doc.setTextColor(255, 182, 193);
      doc.text(`Commerce : ${businessName} | Solution : ${ecommercePlatform} | Projet RoseanSec v1.2`, 170, 189);

      // Second Page of the slide represents oral speech transcript strictly for offline study
      doc.addPage('portrait');
      doc.setFillColor(248, 245, 248); // Elegant soft offwhite
      doc.rect(0, 0, 210, 297, 'F');

      // Top colored bar
      doc.setFillColor(128, 0, 32);
      doc.rect(0, 0, 210, 22, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`ROSEANSEC - MANUEL DU CANDIDAT | FICHE ORALE ET SCRIPT DE SOUTENANCE`, 12, 11);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Répétition pour l'évaluation : Technicienne Spécialisée (Pitch : 10 Min Chrono)`, 12, 16);

      // Content of the transcript page
      doc.setTextColor(50, 40, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`SUPPORT ORAL POUR LA DIAPOSITIVE N°${slide.id} : ${slide.title}`, 12, 35);
      
      doc.setDrawColor(128, 0, 32);
      doc.setLineWidth(0.4);
      doc.line(12, 38, 198, 38);

      // Section metadata
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(128, 0, 32);
      doc.text(`Axe Thématique : ${slide.section}`, 12, 45);

      // Text key summaries
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(`Sur la diapositive, le jury verra des points résumés sur le fond noir de la plateforme d'évaluation.`, 12, 52);
      doc.text(`Le message central à véhiculer est la démonstration d'une ingénierie informatique rigoureuse.`, 12, 57);

      // Talking points script box
      doc.setFillColor(235, 225, 230); // light pink grey bubble
      doc.rect(12, 65, 186, 110, 'F');

      doc.setTextColor(110, 10, 32);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`SCRIPT DE PAROLE À PRONONCER MOT POUR MOT À L'ALIMENTATION DU DIAPORAMA :`, 16, 73);

      doc.setTextColor(40, 30, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const scriptText = slide.notes;
      const splitNotes = doc.splitTextToSize(scriptText, 178);
      doc.text(splitNotes, 16, 82);

      // Tips section
      doc.setFillColor(255, 255, 255);
      doc.rect(12, 185, 186, 85, 'F');
      doc.setDrawColor(220, 200, 210);
      doc.rect(12, 185, 186, 85, 'D');

      doc.setTextColor(128, 0, 32);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`CONSEILS PÉDAGOGIQUES POUR RÉUSSIR CETTE DIAPOSITIVE :`, 16, 193);

      doc.setTextColor(70, 70, 70);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`1. Posture et Voix : Parlez d'une voix posée mais affirmée. Ne regardez pas vos feuilles.`, 16, 201);
      doc.text(`2. Réponse aux critiques : Si un membre du jury critique l'évaluation mémoire, insistez sur le fait`, 16, 207);
      doc.text(`   que les structures de hachage Node.js en Big-O standard O(1) résolvent les goulots d'étranglement.`, 16, 213);
      doc.text(`3. Clarté : Prononcez calmement la solution "${ecommercePlatform}" comme un cas pratique d'école.`, 16, 219);
      doc.text(`4. Alignement Loi : En parlant de la loi 09-08 ou de la DN-11, rappelez que RoseanSec met un point d'honneur`, 16, 225);
      doc.text(`   à respecter la protection de la souveraineté numérique du commerce local ${businessName}.`, 16, 231);
      doc.text(`5. Démo Pratique : Préparez l'onglet "Analyse des logs" pret à être démontré pendant cette section.`, 16, 237);

      // Page numbers footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8.5);
      doc.text(`Page de Soutenance ${slide.id * 2} (Fiche Orale) | Distribué par la plateforme RoseanSec`, 12, 285);
    });

    doc.save(`RoseanSec-Guide-SoutenancePFE-SlideDeck.pdf`);
  };

  const currentSlideData = slidesData[currentSlide];

  return (
    <div className="bg-brand-card p-5 rounded-xl border border-brand-border flex flex-col gap-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-brand-border pb-3">
        <div>
          <h3 className="font-display font-medium text-brand-rose flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-[#FFB6C1]" />
            KIT DE SOUTENANCE PFE - TECHNICIENNE SPÉCIALISÉE
          </h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Support interactif et fiches de parole chronométrées pour un pitch professionnel de 10 minutes de haut niveau devant le jury de votre épreuve pratique.
          </p>
        </div>
        
        {/* Export buttons */}
        <button
          onClick={handleExportSlidesPDF}
          className="bg-brand-rose/20 hover:bg-brand-rose/35 text-[#FFB6C1] border border-brand-rose/40 px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer self-start md:self-center"
        >
          <Download className="w-4 h-4" />
          TÉLÉCHARGER LE KIT COMPLET (PDF 24 PAGES)
        </button>
      </div>

      {/* Main slides engine dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Lecture Slide Sidebar */}
        <div className="lg:col-span-3 bg-black/40 rounded-xl border border-white/5 p-3 font-mono text-[11px] h-[450px] overflow-y-auto">
          <p className="text-[#FFB6C1] uppercase font-bold tracking-wider text-[10px] mb-3 pb-1 border-b border-white/10 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            Sommaire des Diapos ({slidesData.length})
          </p>
          <div className="space-y-1">
            {slidesData.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`w-full text-left p-2.5 rounded transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  currentSlide === idx 
                    ? 'bg-[#800020]/40 text-white border-l-2 border-brand-rose font-bold' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 text-center font-bold text-brand-rose">{slide.id}</span>
                  <span className="truncate">{slide.section}</span>
                </div>
                <span className="text-[9px] font-mono shrink-0 px-1 py-0.2 bg-white/10 text-[#FFB6C1] rounded">
                  {slide.duration}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Slide Frame */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <div className="bg-[#211620] border-2 border-brand-rose/20 rounded-xl p-5 md:p-8 h-[310px] flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Design Watermark */}
            <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
              <Workflow className="w-56 h-56 text-[#FFB6C1]" />
            </div>

            {/* Slide Header */}
            <div className="flex items-center justify-between border-b border-brand-rose/10 pb-3">
              <span className="text-[10px] font-mono tracking-widest text-[#FFB6C1] uppercase font-bold bg-[#800020]/50 px-2 py-0.5 rounded">
                SLIDE {currentSlideData.id} : {currentSlideData.section}
              </span>
              <span className="text-[10px] font-mono text-gray-400 font-bold bg-[#800020]/25 px-2 py-0.5 rounded border border-brand-rose/10">
                ⏱️ {currentSlideData.duration} (Cumul: {currentSlideData.cumul})
              </span>
            </div>

            {/* Slide Content */}
            <div className="my-auto py-2">
              <h2 className="text-white font-bold text-base md:text-lg mb-2 leading-tight">
                {currentSlideData.title}
              </h2>
              <p className="text-brand-rose font-medium text-xs mb-4 italic">
                {currentSlideData.subtitle}
              </p>

              {/* Bullet list */}
              <ul className="space-y-2 text-xs text-gray-300">
                {currentSlideData.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-brand-rose font-bold select-none">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Footer logo */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[9px] font-mono text-gray-400">
              <span>Soutenance de Projet de Fin d'Études TS</span>
              <span>Propulsé par l'IA Gemini 3.5 Flash</span>
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-xs">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="px-3.5 py-1.5 bg-[#1A1118] hover:bg-[#251923] text-[#FFB6C1] border border-white/5 rounded-lg disabled:opacity-30 cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              DIAPO PRÉCÉDENTE
            </button>

            <span className="text-[11px] text-gray-400">
              DIAPORAMA : <strong className="text-white">{currentSlide + 1}</strong> SUR <strong className="text-white">{slidesData.length}</strong>
            </span>

            <button
              onClick={nextSlide}
              disabled={currentSlide === slidesData.length - 1}
              className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#a60c32] text-white rounded-lg disabled:opacity-30 cursor-pointer flex items-center gap-1 text-[11px]"
            >
              DIAPO SUIVANTE
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidat oral presentation speech bubble script */}
      <div className="bg-[#1C111C] rounded-xl border border-brand-rose/20 p-5 mt-2">
        <h4 className="font-mono text-xs font-bold text-[#FFB6C1] uppercase tracking-wider mb-3 pb-2 border-b border-brand-rose/10 flex items-center gap-2">
          <Tv className="w-4 h-4 text-brand-rose" />
          SCRIPT DE PAROLE ORALE À PRONONCER DEVANT LE JURY (MOT POUR MOT) :
        </h4>
        <div className="p-4 bg-black/30 rounded-lg border border-white/5 italic text-[12.5px] leading-relaxed text-gray-300 font-serif quotes pl-10 relative">
          <span className="absolute left-3 top-2 text-4xl text-brand-rose/40 font-serif leading-none">“</span>
          {currentSlideData.notes}
        </div>
        
        {/* Oral tip */}
        <div className="mt-4 p-3 bg-brand-rose/5 rounded-lg border border-brand-rose/15 text-[11.5px] leading-relaxed text-gray-400 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-[#FFB6C1] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Conseil de l'expert en soutenance académique :</strong> Pour cette diapositive, n'hésitez pas à faire des pauses dramatiques pour souligner d'un ton confiant l'importance de la solution <span className="text-[#FFB6C1]">{ecommercePlatform}</span> et de la protection cloud autonome que vous avez développée. Cela montrera votre maîtrise de l'architecture.
          </div>
        </div>
      </div>

    </div>
  );
}
