// Une composition par format, toutes sur le même déroulé (references/09-rendu-et-export.md, section 5).
import React from 'react';
import {Composition} from 'remotion';
import {DUREE_EXEMPLE, Exemple, ExempleProps} from './Exemple';

const FPS = 60;

// Cartons d'exemple au format de scripts/sous_titres.py. Remplacez-les par audio/cartons.json :
//   import cartons from '../audio/cartons.json';
const cartonsExemple: ExempleProps['cartons'] = [
	{debut: 2.3, fin: 3.4, texte: 'Douze vidéos livrées', motCle: 'Douze', mots: [
		{mot: 'Douze', debut: 2.3, fin: 2.7}, {mot: 'vidéos', debut: 2.75, fin: 3.1}, {mot: 'livrées', debut: 3.1, fin: 3.4}]},
	{debut: 3.4, fin: 4.6, texte: 'ce mois-ci', motCle: null, mots: [
		{mot: 'ce', debut: 3.4, fin: 3.55}, {mot: 'mois-ci', debut: 3.55, fin: 4.0}]},
	{debut: 4.6, fin: 5.8, texte: 'Enregistrez cette vidéo', motCle: 'Enregistrez', mots: [
		{mot: 'Enregistrez', debut: 4.6, fin: 5.0}, {mot: 'cette', debut: 5.0, fin: 5.2}, {mot: 'vidéo', debut: 5.2, fin: 5.6}]},
	{debut: 5.8, fin: 7.0, texte: 'pour la prochaine fois.', motCle: 'prochaine', mots: [
		{mot: 'pour', debut: 5.8, fin: 5.95}, {mot: 'la', debut: 5.95, fin: 6.05}, {mot: 'prochaine', debut: 6.05, fin: 6.5}, {mot: 'fois.', debut: 6.5, fin: 6.9}]},
];

const formats = [
	{id: 'Exemple-9x16', width: 1080, height: 1920},
	{id: 'Exemple-4x5', width: 1080, height: 1350},
	{id: 'Exemple-16x9', width: 1920, height: 1080},
];

export const RemotionRoot: React.FC = () => (
	<>
		{formats.map((f) => (
			<Composition
				key={f.id}
				id={f.id}
				component={Exemple}
				durationInFrames={Math.round(DUREE_EXEMPLE * FPS)}
				fps={FPS}
				width={f.width}
				height={f.height}
				defaultProps={{cartons: cartonsExemple}}
			/>
		))}
	</>
);
