'use client' // Declare the component as client-side

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation' // Use next/navigation in the app directory
import axios from 'axios'
import Link from 'next/link'
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
                    location={place.placesData.location}
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
                                Location: lat: {place.parsedAiData.geoLocation.latitude}{' '}
                                lng: {place.parsedAiData.geoLocation.longitude}
                            </p>
                        ) : null}
                        {place.parsedAiData.ordnanceSurveyGridReference ?
                            <p>OS Grid: {place.parsedAiData.ordnanceSurveyGridReference}</p>
                            : null}
                        <p>
                            Rating:{' '}
                            {place.placesData.rating ??
                                'Not yet rated. Get out there and check it out.'}
                        </p>
                    </div>
                    <div className="place-buttons absolute top-0 right-0">
                        <Button.Group>
                            <Button
                                color="gray"
                                href={`https://www.google.com/maps/dir//${place.placesData.location.latitude},${place.placesData.location.longitude}`}
                                target="_blank">
                                Directions
                            </Button>
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
                        {/* <SafeHTMLContent
                            htmlContent={place.aiData}
                            /> */}
                        {place.parsedAiData.historicalSignificance ? (
                            <div>
                                <h3>Historical Significance</h3>
                                <p>
                                    {place.parsedAiData.historicalSignificance}
                                </p>
                            </div>
                        ) : null}
                        {place.parsedAiData.historicalSignificance ? (
                            <div>
                                <h3>Archaeological Relevance</h3>
                                <p>
                                    {place.parsedAiData.archaeologicalRelevance}
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    )
}

import DOMPurify from 'dompurify'
import SafeHTMLContent from '@/components/SafeHTMLContent'
import MapView from '@/components/maps/MapView'
import SiteDetailMap from '@/components/maps/SiteDetailMap'
import { unslugify } from '@/utils/stringUtils'

export default SiteDetail
