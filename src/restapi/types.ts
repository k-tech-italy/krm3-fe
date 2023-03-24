import { useEffect, useState } from "react";


export interface KrmUser {
	id: number,
	username: string,
	email: string,
	groups: string[],
	isSuperUser: boolean,
}

// Interface for component
export interface ExpenseInterface {
	id: number,
	dataExpense: string,
	category: string,
	currency: string,
	currencyAmount: number,
	currencyEUR: number,
	isPaid: boolean,
	typeOfPayment: string,
}

export interface MissionInterface {
	id: number,
	place: string,
	dataStartMission: string,
	dataEndMission: string,
	costumer: string,
	expense: ExpenseInterface[],
}

export const missionsDataTest = [{
	id: 1,
	place: 'Roma',
	dataStartMission: '01/08/2023',
	dataEndMission: '31/08/2023',
	costumer: 'World Food Program',
	expense: [
		{
			id: 1,
			dataExpense: '01/08/2023',
			category: 'Taxi',
			currency: 'GBP',
			currencyAmount: 111,
			currencyEUR: 126,
			isPaid: false,
			typeOfPayment: 'CCA Aziendale',
		},
		{
			id: 2,
			dataExpense: '03/07/2023',
			category: 'Hotel',
			currency: 'GBP',
			currencyAmount: 1430,
			currencyEUR: 1460,
			isPaid: false,
			typeOfPayment: 'Conto risorsa',
		}, {
			id: 3,
			dataExpense: '08/07/2023',
			category: 'Colazione',
			currency: 'GBP',
			currencyAmount: 1114,
			currencyEUR: 136,
			isPaid: false,
			typeOfPayment: 'CCA Aziendale',
		}, {
			id: 4,
			dataExpense: '10/07/2023',
			category: 'Pranzo',
			currency: 'GBP',
			currencyAmount: 330,
			currencyEUR: 313,
			isPaid: true,
			typeOfPayment: 'CCA Aziendale',
		}, {
			id: 5,
			dataExpense: '12/07/2023',
			category: 'Metro',
			currency: 'GBP',
			currencyAmount: 3,
			currencyEUR: 5,
			isPaid: false,
			typeOfPayment: 'CCA Aziendale',
		},
	],
}, {
	id: 2,
	place: 'Milano',
	dataStartMission: '01/07/2023',
	dataEndMission: '31/07/2023',
	costumer: 'World Food Program',
	expense: [
		{
			id: 1,
			dataExpense: '01/07/2023',
			category: 'Taxi',
			currency: 'GBP',
			currencyAmount: 14,
			currencyEUR: 16,
			isPaid: true,
			typeOfPayment: 'CCA Aziendale',
		},
		{
			id: 2,
			dataExpense: '03/07/2023',
			category: 'Hotel',
			currency: 'GBP',
			currencyAmount: 140,
			currencyEUR: 160,
			isPaid: false,
			typeOfPayment: 'Conto risorsa',
		}, {
			id: 3,
			dataExpense: '08/07/2023',
			category: 'Colazione',
			currency: 'GBP',
			currencyAmount: 14,
			currencyEUR: 16,
			isPaid: false,
			typeOfPayment: 'CCA Aziendale',
		}, {
			id: 4,
			dataExpense: '10/07/2023',
			category: 'Pranzo',
			currency: 'GBP',
			currencyAmount: 30,
			currencyEUR: 33,
			isPaid: true,
			typeOfPayment: 'CCA Aziendale',
		}, {
			id: 5,
			dataExpense: '12/07/2023',
			category: 'Metro',
			currency: 'GBP',
			currencyAmount: 3,
			currencyEUR: 5,
			isPaid: false,
			typeOfPayment: 'CCA Aziendale',
		},
	],
}]


// Update media query
export const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}
		const listener = () => setMatches(media.matches);
		window.addEventListener("resize", listener);
		return () => window.removeEventListener("resize", listener);
	}, [matches, query]);

	return matches;
}
