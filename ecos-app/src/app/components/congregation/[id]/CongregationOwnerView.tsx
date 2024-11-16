'use client'

import { CongregationSlug } from "@/customs/utils/types"


export default function CongregationOwnerView({ congregation } : { congregation: CongregationSlug }) {

    return (
        <h1>This is the Priveleged View for {congregation.congregation_name}</h1>
    )
}