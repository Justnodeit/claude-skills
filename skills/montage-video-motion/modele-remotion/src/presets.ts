// Préréglages du skill montage-video-motion (references/04-animation.md).
// Remplacez la charte par celle de votre marque ou de votre client : c'est le seul endroit où les couleurs vivent.
import {Easing, interpolate, SpringConfig} from 'remotion';

export const charte = {
	fond: '#FFFFFF',
	encre: '#111827',
	// Vérifiez le contraste de l'accent sur le fond (4,5:1 au moins pour un texte).
	accent: '#2F5BEA',
	blanc: '#FFFFFF',
	// Chargez la police avant le rendu (voir README.md, section « Police »).
	police: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
};

// Courbes nommées (Remotion). Équivalents GSAP et CSS dans references/04-animation.md.
export const courbes = {
	decelerationDouce: Easing.out(Easing.quad),
	deceleration: Easing.out(Easing.cubic),
	acceleration: Easing.in(Easing.cubic),
	allerRetour: Easing.inOut(Easing.cubic),
	deplacement: Easing.bezier(0.8, 0.1, 0.25, 0.9),
	grosseForme: Easing.bezier(0.7, 0, 0.2, 1),
	entreeMot: Easing.bezier(0.16, 1, 0.3, 1),
	camera: Easing.bezier(0.45, 0, 0.2, 1),
	fondu: Easing.inOut(Easing.sin),
};

// Ressorts : jamais le réglage par défaut de Remotion (16 % de dépassement).
export const ressorts: Record<'sansDepassement' | 'depassementDiscret' | 'cibleGlisser', Partial<SpringConfig>> = {
	sansDepassement: {mass: 1, stiffness: 200, damping: 26},
	depassementDiscret: {mass: 1, stiffness: 120, damping: 14},
	cibleGlisser: {mass: 0.6, stiffness: 220, damping: 12},
};

// Durées en secondes (mesurées à 30 i/s). Convertir avec img(durees.x, fps) : même mouvement à 30 et à 60 i/s.
export const durees = {
	microEntree: 3 / 30,
	apparitionMot: 4 / 30,
	glissementMot: 14 / 30,
	ecartMots: 3.5 / 30,
	ecartEnsemble: 2.5 / 30,
	ecartActions: 6.5 / 30,
	carteSurgit: 4 / 30,
	blocEntre: 18 / 30,
	blocSePose: 38 / 30,
	deplacement: 20 / 30,
	formePetite: 8 / 30,
	formeGrande: 19 / 30,
	compteur: 33 / 30,
	trace: 22 / 30,
	soulignement: 8 / 30,
	sortie: 3 / 30,
	camera: 20 / 30,
};

// Secondes vers images. 0 s donne l'image 0 (un plan qui commence à 0 est visible dès la première image).
export const img = (secondes: number, fps: number) => Math.round(secondes * fps);

// Progression bornée de 0 à 1 entre deux images. Les extrémités sont exactes (pas de 1e-9 au départ).
export const progression = (
	frame: number,
	debut: number,
	duree: number,
	courbe: (t: number) => number = courbes.deceleration,
) => {
	if (duree <= 0) return frame >= debut ? 1 : 0;
	if (frame <= debut) return 0;
	if (frame >= debut + duree) return 1;
	return interpolate(frame, [debut, debut + duree], [0, 1], {
		easing: courbe,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

// Zoom de caméra interpolé en échelle logarithmique (sinon il paraît accélérer en fin de course).
export const zoomLog = (p: number, de: number, vers: number) =>
	Math.exp(Math.log(de) + (Math.log(vers) - Math.log(de)) * p);

// Zone utile par format : là où un texte peut vivre (zones sûres des plateformes + 80 px de marge).
export const zoneUtile = (largeur: number, hauteur: number) => {
	const ratio = largeur / hauteur;
	if (ratio < 0.6) {
		// 9:16 : en-tête en haut (220 px), légende et boutons en bas (à partir de 1500), colonne de boutons à droite.
		const k = largeur / 1080;
		return {x: 140 * k, y: 300 * k, largeur: 800 * k, hauteur: 1120 * k, ligneSousTitres: hauteur * 0.67};
	}
	if (ratio < 1.2) {
		// 4:5 et 1:1 : 80 px sur chaque bord.
		const k = largeur / 1080;
		return {x: 80 * k, y: 80 * k, largeur: largeur - 160 * k, hauteur: hauteur - 160 * k, ligneSousTitres: hauteur * 0.67};
	}
	// 16:9 : 5 % sur chaque bord, bande des sous-titres réservée sous y = 860 (en 1080).
	const k = hauteur / 1080;
	return {x: largeur * 0.05, y: 54 * k, largeur: largeur * 0.9, hauteur: 806 * k - 54 * k, ligneSousTitres: hauteur * 0.67};
};

// Taille de base du texte courant : 56 px pour 1080 de large en vertical.
export const corps = (largeur: number, hauteur: number) => Math.round(Math.min(largeur, hauteur) * 0.052);
