// Ligne ou titre construit mot à mot, calé sur la voix (references/05, T3 et T4).
// La mise en page est calculée une fois à la largeur finale : les mots invisibles occupent déjà leur place,
// donc la ligne ne se recentre jamais par saut. Un mot dont debut vaut 0 est présent dès la première image (R1).
// Les lignes sont équilibrées (text-wrap: balance) pour éviter un mot seul en fin de titre.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {charte, courbes, durees, img, progression} from './presets';

export type MotHoraire = {mot: string; debut: number}; // debut en secondes, depuis le début de la séquence

export const TexteMotAMot: React.FC<{
	mots: MotHoraire[];
	motCle?: string;
	taille: number;
	couleur?: string;
	couleurCle?: string;
	souligner?: boolean;
	sec?: boolean; // variante sèche : le mot apparaît d'un coup sur son image
	inclinaisonCle?: number; // degrés, 4 au plus (2 au plus pour un titre)
}> = ({mots, motCle, taille, couleur = charte.encre, couleurCle = charte.accent, souligner = false, sec = false, inclinaisonCle = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div
			style={{
				display: 'block',
				fontFamily: charte.police,
				lineHeight: 1.1,
				textAlign: 'center',
				...({textWrap: 'balance'} as unknown as React.CSSProperties),
			}}
		>
			{mots.map((m, i) => {
				const depart = img(m.debut, fps);
				const present = m.debut <= 0; // déjà composé à l'image 0, sans entrée
				const estCle = motCle !== undefined && m.mot.replace(/[.,;:!?]/g, '') === motCle;
				const opacite = present ? 1 : sec ? (frame >= depart ? 1 : 0) : progression(frame, depart, img(durees.apparitionMot, fps), courbes.decelerationDouce);
				const glisse = present || sec ? 1 : progression(frame, depart, img(durees.glissementMot, fps), courbes.entreeMot);
				const flou = present || sec ? 0 : 12 * (1 - progression(frame, depart, img(5 / 30, fps), courbes.deceleration));
				const trait = progression(frame, (present ? 0 : depart) + img(durees.apparitionMot, fps), img(durees.soulignement, fps), courbes.deceleration);
				return (
					<span
						key={i}
						style={{
							position: 'relative',
							display: 'inline-block',
							margin: `0 ${taille * 0.12}px`,
							fontSize: estCle ? taille * 1.28 : taille,
							fontWeight: estCle ? 800 : 600,
							color: estCle ? couleurCle : couleur,
							opacity: opacite,
							filter: flou > 0.05 ? `blur(${flou.toFixed(2)}px)` : undefined,
							transform: `translateY(${(1 - glisse) * taille * 0.9}px) rotate(${estCle ? inclinaisonCle : 0}deg)`,
						}}
					>
						{m.mot}
						{estCle && souligner ? (
							<span
								style={{
									position: 'absolute',
									left: 0,
									bottom: -taille * 0.12,
									height: Math.max(4, taille * 0.07),
									width: `${trait * 100}%`,
									backgroundColor: couleurCle,
								}}
							/>
						) : null}
					</span>
				);
			})}
		</div>
	);
};
