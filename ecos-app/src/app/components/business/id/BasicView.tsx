import { BusinessSlug } from "@/customs/utils/types"

export default function BasicView({ business } : { business: BusinessSlug }) {

    return (
        <div>
            <h1>This is the Basic View</h1>
            <p>
                {JSON.stringify(business)}
            </p>
        </div>
    )
}