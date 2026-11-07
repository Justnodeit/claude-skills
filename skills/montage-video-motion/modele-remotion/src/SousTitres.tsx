// Sous-titres au mot, à partir de audio/cartons.json produit par scripts/sous_titres.py.
// Règles : references/05-typographie-et-sous-titres.md, partie 2 (S1 à S16).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {charte, corps, zoneUtile} from './presets';

export type Mot = {mot: string; debut: number; fin: number};
export type Carton = {debut: number; fin: number; texte: string; motCle: string | null; mots: Mot[]};

const nettoyer = (m: string) => m.toLowerCase().replace(/[.,;:!? «»"]/g, '').trim();

export const SousTitres: React.FC<{
	cartons: Carton[];
	// Centre vertical de la ligne, en px. Par défaut : 33 % du bas (S1). En écran séparé : la ligne de séparation (S2).
	centreY?: number;
	// Cartouche plat couleur encre, pour un sous-titre posé sur deux fonds (S2).
	cartouche?: boolean;
	// Construction mot à mot (variante de S11) au lieu du remplacement sec du carton.
	motAMot?: boolean;
	couleur?: string;
}> = ({cartons, centreY, cartouche = false, motAMot = false, couleur}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;
	const carton = cartons.find((c) => t >= c.debut && t < c.fin);
	if (!carton) return null;

	const taille = corps(width, height);
	const y = centreY ?? zoneUtile(width, height).ligneSousTitres;
	const cle = carton.motCle ? nettoyer(carton.motCle) : null;
	const teinte = couleur ?? (cartouche ? charte.blanc : charte.encre);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					top: y,
					left: 0,
					right: 0,
					transform: 'translateY(-50%)',
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						maxWidth: width * 0.74,
						fontFamily: charte.police,
						fontSize: taille,
						lineHeight: 1.1,
						color: teinte,
						whiteSpace: 'nowrap',
						display: 'flex',
						alignItems: 'baseline',
						gap: taille * 0.28,
						...(cartouche
							? {backgroundColor: charte.encre, padding: 22, borderRadius: 8}
							: {}),
					}}
				>
					{carton.mots.map((m, i) => {
						const estCle = cle !== null && nettoyer(m.mot) === cle;
						const visible = !motAMot || m.debut <= t + 0.03;
						return (
							<span
								key={i}
								style={{
									fontWeight: estCle ? 800 : 500,
									fontSize: estCle ? taille * 1.45 : taille,
									opacity: visible ? 1 : 0,
								}}
							>
								{m.mot}
							</span>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};
