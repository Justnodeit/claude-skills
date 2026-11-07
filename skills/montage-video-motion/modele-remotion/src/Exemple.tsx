// Composition d'exemple : trois plans (titre mot à mot, chiffre clé, appel à l'action) et des sous-titres.
// Une seule composition pour tous les formats : chaque plan se place depuis zoneUtile(), jamais par recadrage.
// Les textes et le chiffre sont des données fictives d'exemple : remplacez-les par ceux de votre script et de faits.md.
import React from 'react';
import {AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Compteur} from './Compteur';
import {usePolices} from './Polices';
import {charte, corps, courbes, durees, img, progression, ressorts, zoneUtile} from './presets';
import {Carton, SousTitres} from './SousTitres';
import {TexteMotAMot} from './TexteMotAMot';

export type ExempleProps = {cartons: Carton[]};

// Bornes des plans en secondes (issues du tableau de plans).
export const PLANS = {titre: [0, 2.3], chiffre: [2.3, 4.6], action: [4.6, 7.0]} as const;
export const DUREE_EXEMPLE = 7.0;

const Zone: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {width, height} = useVideoConfig();
	const z = zoneUtile(width, height);
	return (
		<div
			style={{
				position: 'absolute',
				left: z.x,
				top: z.y,
				width: z.largeur,
				// en 9:16 et en 16:9, le contenu reste au-dessus de la ligne des sous-titres
				height: Math.min(z.hauteur, z.ligneSousTitres - z.y - corps(width, height) * 1.6),
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: corps(width, height) * 0.8,
			}}
		>
			{children}
		</div>
	);
};

const PlanTitre: React.FC = () => {
	const {width, height} = useVideoConfig();
	const t = corps(width, height);
	return (
		<Zone>
			<TexteMotAMot
				taille={t * 2.1}
				motCle="son"
				souligner
				inclinaisonCle={-2}
				mots={[
					// première image déjà composée (R1, R7) : les deux premiers mots sont là dès l'image 0
					{mot: 'Vos', debut: 0},
					{mot: 'vidéos', debut: 0},
					{mot: 'se', debut: 0.35},
					{mot: 'regardent', debut: 0.47},
					{mot: 'sans', debut: 0.9},
					{mot: 'le', debut: 1.02},
					{mot: 'son', debut: 1.15},
				]}
			/>
		</Zone>
	);
};

const PlanChiffre: React.FC = () => {
	const {width, height, fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const t = corps(width, height);
	const contexte = progression(frame, img(0.5, fps), img(durees.blocEntre, fps), courbes.deceleration);
	return (
		<Zone>
			<Compteur cible={12} suffixe="vidéos" taille={t * 4.2} couleur={charte.accent} debut={0.05} />
			<div
				style={{
					fontFamily: charte.police,
					fontSize: t * 1.05,
					fontWeight: 500,
					color: charte.encre,
					opacity: contexte,
					transform: `translateY(${(1 - contexte) * 12}px)`,
					textAlign: 'center',
				}}
			>
				livrées ce mois-ci (exemple)
			</div>
		</Zone>
	);
};

const PlanAction: React.FC = () => {
	const {width, height, fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const t = corps(width, height);
	// Le geste attendu est montré, pas seulement dit (R9) : le bouton arrive en ressort sans dépassement,
	// puis appui 3 + 3 + 4 images (mesuré à 30 i/s). Les mots dits passent par les sous-titres.
	const arrivee = spring({frame, fps, config: ressorts.sansDepassement});
	const a = img(0.6, fps);
	const enfonce = progression(frame, a, img(3 / 30, fps), courbes.deceleration);
	const relache = progression(frame, a + img(6 / 30, fps), img(4 / 30, fps), courbes.deceleration);
	const echelle = arrivee * (1 - 0.2 * enfonce + 0.2 * relache);
	const fait = progression(frame, a + img(6 / 30, fps), img(durees.microEntree, fps));
	return (
		<Zone>
			<div
				style={{
					position: 'relative',
					transform: `scale(${echelle})`,
					backgroundColor: charte.encre,
					color: charte.blanc,
					fontFamily: charte.police,
					fontWeight: 700,
					fontSize: t * 1.6,
					padding: `${t * 0.6}px ${t * 1.2}px`,
					borderRadius: t * 0.5,
				}}
			>
				<span style={{opacity: 1 - fait}}>Enregistrer</span>
				<span style={{position: 'absolute', left: 0, right: 0, top: t * 0.6, textAlign: 'center', opacity: fait}}>
					Enregistrée
				</span>
			</div>
		</Zone>
	);
};

export const Exemple: React.FC<ExempleProps> = ({cartons}) => {
	usePolices();
	const {fps} = useVideoConfig();
	const de = (s: number) => img(s, fps);
	return (
		<AbsoluteFill style={{backgroundColor: charte.fond}}>
			<Sequence from={de(PLANS.titre[0])} durationInFrames={de(PLANS.titre[1] - PLANS.titre[0])}>
				<PlanTitre />
			</Sequence>
			<Sequence from={de(PLANS.chiffre[0])} durationInFrames={de(PLANS.chiffre[1] - PLANS.chiffre[0])}>
				<PlanChiffre />
			</Sequence>
			<Sequence from={de(PLANS.action[0])} durationInFrames={de(PLANS.action[1] - PLANS.action[0])}>
				<PlanAction />
			</Sequence>
			{/* Sous-titres au-dessus de tout, hors du plan titre qui dit déjà les mêmes mots (S13) */}
			<SousTitres cartons={cartons.filter((c) => c.debut >= PLANS.titre[1])} />
		</AbsoluteFill>
	);
};
