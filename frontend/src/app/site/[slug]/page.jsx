'use client' // Declare the component as client-side

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation' // Use next/navigation in the app directory
import axios from 'axios'
import Link from 'next/link'
import SiteDetailMap from '@/components/maps/SiteDetailMap'
import { camelToSentence, unslugify } from '@/utils/stringUtils'
import { Button } from 'flowbite-react'

const SiteDetail = () => {
    const params = useParams()
    const searchParams = useSearchParams()
    const { slug } = params
    const id = searchParams.get('id')

    console.log({ slug, id })
    const [place, setPlace] = useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        if (id) {
            const fetchPlaceDetails = async () => {
                try {
                    setLoading(true)
                    const response = await axios.get(
                        `${API_URL}/place/details`,
                        {
                            params: {
                                place_id: id, // Use the place_id from the query param
                                fields: '*',
                            },
                        },
                    )

                    const { data } = response
                    let parsedAiData

                    try {
                        if (data.aiData && typeof data.aiData === 'string') {
                            parsedAiData = JSON.parse(data.aiData)
                        } else {
                            parsedAiData = data.aiData
                        }
                    } catch (error) {
                        console.error('Error parsing aiData', error)
                        parsedAiData = {}
                    }
                    setPlace({
                        ...data,
                        parsedAiData,
                    })
                    setLoading(false)
                } catch (err) {
                    setError('Failed to fetch place details')
                    setLoading(false)
                }
            }

            fetchPlaceDetails()
        }
    }, [id])

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <p>Loading...</p>
            </div>
        )
    if (error)
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <p>{error}</p>
            </div>
        )
    if (!place)
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <p>No place found.</p>
            </div>
        )

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-start">
            <div className="w-full h-[66vh] z-0">
                <SiteDetailMap
                    location={place.parsedAiData.geoLocation}
                    title={place.placesData.displayName.text}
                    id={id}
                />
            </div>
            <div className="bg-white z-10 shadow-2xl shadow-black rounded-xl flex flex-col gap-3 items-start p-5 lg:p-16 max-w-5xl lg:-mt-32 relative">
                <div className="heading">
                    <h1 className="text-3xl">
                        {place.placesData.displayName.text}
                    </h1>
                    <p>{unslugify(place.placesData.primaryType)}</p>
                </div>
                <div className="flex flex-row flex-wrap items-start justify-between w-full gap-3">
                    <div>
                        <p>Address: {place.placesData.formattedAddress}</p>
                        {place.parsedAiData.geoLocation ? (
                            <p>
                                Location: lat:{' '}
                                {place.parsedAiData.geoLocation.latitude} lng:{' '}
                                {place.parsedAiData.geoLocation.longitude}
                            </p>
                        ) : null}
                        {place.parsedAiData.ordnanceSurveyGridReference ? (
                            <p>
                                OS Grid:{' '}
                                {place.parsedAiData.ordnanceSurveyGridReference}
                            </p>
                        ) : null}
                        <p>
                            Rating:{' '}
                            {place.placesData.rating ??
                                'Not yet rated. Get out there and check it out.'}
                        </p>
                    </div>
                    <div className="place-buttons absolute top-0 right-0">
                        <Button.Group>
                            {/* <Button
                                color="gray"
                                href={`https://www.google.com/maps/dir//${place.parsedAiData.geoLocation.latitude},${place.parsedAiData.geoLocation.longitude}`}
                                target="_blank">
                                Directions
                            </Button> */}
                            <Button color="gray" href="/">
                                Back to map
                            </Button>
                        </Button.Group>
                    </div>
                </div>

                {!place.aiData ? (
                    <p>
                        No description, yet.{' '}
                        <a href="" className="">
                            Let us know
                        </a>
                    </p>
                ) : (
                    <div className="prose-lg prose-a:text-green-700">
                        {place.parsedAiData.historicalSignificance ? (
                            <div>
                                <h3>
                                    Historical & Archaeological Significance
                                </h3>
                                <p>
                                    {place.parsedAiData.historicalSignificance}
                                </p>
                            </div>
                        ) : null}
                        {place.parsedAiData.phasesOfConstruction ? (
                            <div>
                                <h3>Phases of Construction</h3>
                                {place.parsedAiData.phasesOfConstruction.map(
                                    phase => {
                                        const {
                                            phase: phaseLabel,
                                            yearRange,
                                            description,
                                        } = phase
                                        return (
                                            <div>
                                                <h4>
                                                    {phaseLabel} ({yearRange})
                                                </h4>
                                                <p>{description}</p>
                                            </div>
                                        )
                                    },
                                )}
                            </div>
                        ) : null}
                        {place.parsedAiData.culturalContext ? (
                            <div>
                                <h3>Cultural Context</h3>
                                <p>{place.parsedAiData.culturalContext}</p>
                            </div>
                        ) : null}
                        {place.parsedAiData.research ? (
                            <div>
                                <h3>Further reading</h3>
                                    <ul className="flex flex-wrap ml-0 pl-0 gap-5 justify-between">
                                        {place.parsedAiData.research.map(item => (
                                            <li className="mb-0 pl-0 max-w-[45%] w-full">
                                                <h4 className="font-bold">{item.title}</h4>
                                                <p>{item.summary}</p>
                                                <a href={item.url}>Visit resource</a>
                                            </li>
                                        )) }
                                </ul>
                            </div>
                        ) : null}
                        {place.parsedAiData.visitorInformation ? (
                                <div>
                                    <h3>Visitor Information</h3>
                                <ul className='pl-0'>
                                    {Object.entries(
                                        place.parsedAiData.visitorInformation,
                                    ).map(([key, value]) => (
                                        <li key={key} className='pl-0 mt-0 mb-8 flex items-start justify-start'>
                                            <strong className='capitalize w-1/5'>{camelToSentence(key)}:</strong>{' '}
                                            {typeof value === 'object' ? (
                                                <ul className='my-0 pl-0'>
                                                    {Object.entries(value).map(([nestedKey, nestedValue]) => (
                                                        <li className="capitalize mt-0 pl-0 last-of-type:mb-0">{camelToSentence(nestedKey)}:{' '} {nestedValue}</li>
                                                    ))}
                                                    </ul>
                                            ) : (
                                                    <span className='pl-0'>{value}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {place.parsedAiData.relatedLinks ? (
                            <div>
                                <h3>Links</h3>
                                <ul>
                                    {place.parsedAiData.relatedLinks.map(
                                        link => {
                                            const { title, url } = link
                                            return (
                                                <li>
                                                    <a href={url}>{title}</a>
                                                </li>
                                            )
                                        },
                                    )}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SiteDetail
