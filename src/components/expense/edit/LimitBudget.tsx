import { useGetBudgetLimit } from "../../../hooks/expense";
import { useEffect, useState } from "react";
import { useMediaQuery } from "../../../hooks/commons";
import { Category } from "../../../restapi/types";


interface props {
    category: Category,
    amountCurrency: number,
    categoryList: Category[]
}

export default function LimitBudget(props: props) {

    const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
    const limitBudget = useGetBudgetLimit();
    const [budgetResidue, setBudgetResidue] = useState<number | null>(null);



    useEffect(() => {
        setBudgetResidue(null)
        calculateBudget(props.category, props.categoryList, props.amountCurrency)
    }, [props.amountCurrency, props.category, props.categoryList])


    function calculateBudget(category: Category, categoryList: Category[], amout: number) {
        if (!!props.category && !!limitBudget.data) {
            const myObj: { [index: string]: any } = limitBudget.data
            const budget = myObj[props.category.title.toLowerCase()]
            const data = limitBudget.data
            if (category.parent === null) {
                setBudgetResidue(Number((budget - props.amountCurrency).toFixed(2)))
                //console.log(budget, props.amountCurrency, Number((budget - props.amountCurrency).toFixed(2)))
            }
        }
    }


    return (
        <p className={`${!!budgetResidue && Math.sign(budgetResidue) === 1 ? '' : 'alert alert-danger'} ${isSmallScreen ? 'mt-1' : 'ms-1'} p-1 mb-0  `}>
            Budget residuo {budgetResidue === null ? 'da definire' : budgetResidue + '€'}
        </p>
    );
}