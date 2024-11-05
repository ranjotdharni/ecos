import { WorkerSlug } from "@/customs/utils/types"

export default function OwnerView({ workers } : { workers: WorkerSlug[] }) {

    return (
        <div>
            <h1>This is the Owner View</h1>
            <p>
                {JSON.stringify(workers)}
            </p>
        </div>
    )
}