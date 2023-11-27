import {useGetBudgetLimit} from "../../../hooks/expense";
import {useEffect, useState} from "react";
import { useMediaQuery } from "../../../hooks/commons";


interface props {
    category: string,
    amountCurrency: number,
}

export default function LimitBudget(props: props) {

    const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
    const limitBudget = useGetBudgetLimit();
    const [budgetResidue, setBudgetResidue] = useState<number>(0);

    useEffect(() => {
        if (!!props.category && !!limitBudget.data) {
            const myObj: { [index: string]: any } = limitBudget.data
            const budget = myObj[props.category.toLowerCase()]
            setBudgetResidue(Number((budget - props.amountCurrency).toFixed(2)))
        }
    }, [props])


    return (
        <p className={`${Math.sign(budgetResidue) === 1 ? '' : 'alert alert-danger'} ${isSmallScreen ? 'mt-1' : 'ms-1'} p-1 mb-0  `}>
            Budget residuo {!!budgetResidue ? budgetResidue + '€': 'da definire'} 
        </p>
    );
}