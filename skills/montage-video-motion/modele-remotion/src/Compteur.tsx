// Compteur qui part de 0 (ou d'une valeur de départ), décélère et finit sur la valeur exacte (references/04, section 7).
// La valeur affichée doit venir de faits.md.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {charte, courbes, durees, img, progression} from './presets';

const formater = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ' ');

export const Compteur: React.FC<{
	cible: number;
	depart?: number;
	debut?: number; // secondes, depuis le début de la séquence
	duree?: number; // secondes, 30 à 35 images à 30 i/s par défaut
	suffixe?: string; // « % », « € », « clients »
	taille: number;
	couleur?: string;
}> = ({cible, depart = 0, debut = 0, duree = durees.compteur, suffixe = '', taille, couleur = charte.encre}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const d = img(debut, fps);
	const p = progression(frame, d, img(duree, fps), (t) => t); // temps linéaire, la décélération est dans la formule
	const valeur = p >= 1 ? cible : Math.round(depart + (cible - depart) * (1 - Math.pow(1 - p, 3)));
	const opacite = progression(frame, d, img(durees.microEntree, fps), courbes.deceleration);
	return (
		<div
			style={{
				fontFamily: charte.police,
				fontSize: taille,
				fontWeight: 800,
				color: couleur,
				fontVariantNumeric: 'tabular-nums',
				lineHeight: 1,
				opacity: opacite,
				whiteSpace: 'nowrap',
			}}
		>
			{formater(valeur)}
			{suffixe ? <span style={{fontSize: taille * 0.5, fontWeight: 700}}>{' ' + suffixe}</span> : null}
		</div>
	);
};
