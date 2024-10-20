

export interface EmpireData {
    code: number
    name: string
    desc: string
}

export const TEMPESTRA_CODE: number = 1
export const CONCERTINA_CODE: number = 2
export const ICARIUM_CODE: number = 3

export const EMPIRE_DATA: EmpireData[] = [
    {
        code: TEMPESTRA_CODE,
        name: 'Tempestra',
        desc: 'This is the Tempestra Empire.'
    },
    {
        code: CONCERTINA_CODE,
        name: 'Concertina',
        desc: 'This is the Concertina Empire.'
    },
    {
        code: ICARIUM_CODE,
        name: 'Icarium',
        desc: 'This is the Icarium Empire.'
    }
]