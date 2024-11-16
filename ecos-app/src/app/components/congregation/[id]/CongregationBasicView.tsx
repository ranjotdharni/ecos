'use client'

import { CongregationSlug } from "@/customs/utils/types"


export default function CongregationBasicView({ congregation } : { congregation: CongregationSlug }) {

    return (
        <h1>This is the Basic View for {congregation.congregation_name}</h1>
    )
}