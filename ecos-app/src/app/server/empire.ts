import ConcertinaSigil from '../static/png/concertinaSigil.png'
import TempestraSigil from '../static/png/tempestraSigil.png'
import IcariumSigil from '../static/png/icariumSigil.png'
import { StaticImageData } from 'next/image'

export interface EmpireData {
    code: number
    name: string
    sigil: StaticImageData
    desc: string
}

export const TEMPESTRA_CODE: number = 1
export const CONCERTINA_CODE: number = 2
export const ICARIUM_CODE: number = 3

export const EMPIRE_DATA: EmpireData[] = [
    {
        code: TEMPESTRA_CODE,
        name: 'Tempestra',
        sigil: TempestraSigil,
        desc: `Over fertile plains and verdant fields, Tempestrans flourish through their true mastery of agriculture, nurturing the earth to feed their people and neighbors.`
    },
    {
        code: CONCERTINA_CODE,
        name: 'Concertina',
        sigil: ConcertinaSigil,
        desc: `Known for their disciplined and formidable armies, Concerts dominate through sheer military prowess, shaping their empire with steel and strategy.`
    },
    {
        code: ICARIUM_CODE,
        name: 'Icarium',
        sigil: IcariumSigil,
        desc: `Rooted in spiritual devotion, the Icari thrive in a theocratic realm, where faith governs and religious principles guide the hearts and minds of the people.`
    }
]