// Attendre que la police soit prête avant de rendre la moindre image.
// Sans cela, les premières images peuvent sortir dans la police de secours.
//
// Police installée sur l'ordinateur : usePolices() suffit.
// Fichier de police dans public/fonts/ : déclarez-le d'abord, par exemple avec le paquet @remotion/fonts :
//   import {loadFont} from '@remotion/fonts';
//   import {staticFile} from 'remotion';
//   loadFont({family: 'MaPolice', url: staticFile('fonts/MaPolice-Bold.woff2'), weight: '700'});
// puis mettez 'MaPolice' en tête de charte.police dans presets.ts.
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {charte} from './presets';

const famille = charte.police.split(',')[0].replace(/["']/g, '').trim();
const graisses = ['500', '600', '700', '800'];

export const usePolices = () => {
	const [poignee] = useState(() => delayRender(`Chargement de la police ${famille}`));
	useEffect(() => {
		Promise.all(graisses.map((g) => document.fonts.load(`${g} 48px "${famille}"`)))
			.then(() => document.fonts.ready)
			.then(() => continueRender(poignee))
			.catch((erreur) => {
				// On rend quand même, mais on le signale : le contrôle doit vérifier la police à l'image.
				console.error('Police non chargée :', erreur);
				continueRender(poignee);
			});
	}, [poignee]);
};
